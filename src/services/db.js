// ─── Firestore Database Service ──────────────────────────────────────────────
// All helpers are async and return plain JS objects (no Firestore DocumentSnapshot).
// Collection layout:
//   users/{uid}/                  — student & doctor profiles
//   users/{uid}/appointments/     — student appointments
//   users/{uid}/prescriptions/    — student prescriptions
//   users/{uid}/reminders/        — student reminders
//   users/{uid}/orders/           — medicine orders
//   users/{uid}/healthProfile/    — health profile document
//   doctors/{uid}/                — doctor profiles (separate collection)

import {
  doc, collection, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, orderBy, serverTimestamp,
  onSnapshot, where,
} from "firebase/firestore";
import { db } from "../firebase";

// ── Generic helpers ───────────────────────────────────────────────────────────

/** Save or update a user-scoped document */
export const upsertUserDoc = (uid, docPath, data) =>
  setDoc(doc(db, "users", uid, ...docPath.split("/")), { ...data, updatedAt: serverTimestamp() }, { merge: true });

/** Add a new document to a user-scoped sub-collection */
export const addUserDoc = async (uid, collectionPath, data) => {
  const ref = await addDoc(
    collection(db, "users", uid, ...collectionPath.split("/")),
    { ...data, createdAt: serverTimestamp() }
  );
  return ref.id;
};

/** Fetch all docs from a user-scoped sub-collection */
export const getUserCollection = async (uid, collectionPath, orderByField = "createdAt") => {
  const q = query(
    collection(db, "users", uid, ...collectionPath.split("/")),
    orderBy(orderByField, "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** Fetch a single user-scoped document */
export const getUserDoc = async (uid, docPath) => {
  const snap = await getDoc(doc(db, "users", uid, ...docPath.split("/")));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/** Update a specific user-scoped document */
export const updateUserDoc = (uid, docPath, data) =>
  updateDoc(doc(db, "users", uid, ...docPath.split("/")), { ...data, updatedAt: serverTimestamp() });

/** Delete a user-scoped document */
export const deleteUserDoc = (uid, docPath) =>
  deleteDoc(doc(db, "users", uid, ...docPath.split("/")));

// ── Real-time listeners ───────────────────────────────────────────────────────

/**
 * Subscribe to a user-scoped collection in real time.
 * @returns unsubscribe function — call in useEffect cleanup
 */
export const subscribeUserCollection = (uid, collectionPath, callback, orderByField = "createdAt") => {
  const q = query(
    collection(db, "users", uid, ...collectionPath.split("/")),
    orderBy(orderByField, "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// ── User profile ──────────────────────────────────────────────────────────────

/** Save or update the base user profile */
export const saveUserProfile = (uid, profile) =>
  setDoc(doc(db, "users", uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });

/** Fetch a user's profile */
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

// ── Appointments ──────────────────────────────────────────────────────────────

export const saveAppointment = async (uid, appt) => {
  // Save to student's subcollection
  await setDoc(doc(db, "users", uid, "appointments", appt.id), { ...appt, createdAt: serverTimestamp() }, { merge: true });
  // Also save to global appointments collection so doctor can read it
  await setDoc(doc(db, "appointments", appt.id), { ...appt, studentUid: uid, createdAt: serverTimestamp() }, { merge: true });
};

export const getAppointments = (uid) => getUserCollection(uid, "appointments");

export const updateAppointmentStatus = (uid, apptId, status) =>
  updateUserDoc(uid, `appointments/${apptId}`, { status });

// ── Prescriptions ─────────────────────────────────────────────────────────────

export const savePrescription = (uid, rx) =>
  setDoc(doc(db, "users", uid, "prescriptions", rx.id), { ...rx, createdAt: serverTimestamp() }, { merge: true });

export const getPrescriptions = (uid) => getUserCollection(uid, "prescriptions");

// ── Reminders ─────────────────────────────────────────────────────────────────

export const addReminderToDb = async (uid, reminder) => {
  const ref = await addDoc(collection(db, "users", uid, "reminders"), {
    ...reminder,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateReminderInDb = (uid, reminderId, data) =>
  updateUserDoc(uid, `reminders/${reminderId}`, data);

export const deleteReminderFromDb = (uid, reminderId) =>
  deleteUserDoc(uid, `reminders/${reminderId}`);

export const subscribeReminders = (uid, callback) =>
  subscribeUserCollection(uid, "reminders", callback);

// ── Medicine Orders ───────────────────────────────────────────────────────────

export const saveOrder = (uid, order) =>
  setDoc(doc(db, "users", uid, "orders", order.id), { ...order, createdAt: serverTimestamp() }, { merge: true });

export const getOrders = (uid) => getUserCollection(uid, "orders");

export const updateOrderStatus = (uid, orderId, status) =>
  updateUserDoc(uid, `orders/${orderId}`, { status });

// ── Health Profile ────────────────────────────────────────────────────────────

export const saveHealthProfile = (uid, profile) =>
  setDoc(doc(db, "users", uid, "healthProfile", "main"), { ...profile, updatedAt: serverTimestamp() }, { merge: true });

export const getHealthProfile = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid, "healthProfile", "main"));
  return snap.exists() ? snap.data() : null;
};

// ── Doctor profile (separate top-level collection) ────────────────────────────

export const saveDoctorProfile = (uid, profile) =>
  setDoc(doc(db, "doctors", uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
export const saveDoctorNotification = async (doctorUid, notification) => {
  await addDoc(collection(db, "doctors", doctorUid, "notifications"), {
    ...notification,
    createdAt: serverTimestamp(),
    read: false,
  });
};

export const getDoctorNotifications = async (doctorUid) => {
  const snap = await getDocs(
    query(collection(db, "doctors", doctorUid, "notifications"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const saveNewPrescription = async (prescriptionData) => {
  const docRef = await addDoc(collection(db, "prescriptions"), {
    ...prescriptionData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getPrescriptionsByStudent = async (studentEmail) => {
  const snap = await getDocs(
    query(collection(db, "prescriptions"), where("studentEmail", "==", studentEmail))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getPrescriptionsByDoctor = async (doctorUid) => {
  const snap = await getDocs(
    query(collection(db, "prescriptions"), where("doctorUid", "==", doctorUid))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
export const getDoctorProfile = async (uid) => {
  const snap = await getDoc(doc(db, "doctors", uid));
  return snap.exists() ? snap.data() : null;
};
export const getAllDoctors = async () => {
  const snap = await getDocs(collection(db, "doctors"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllStudents = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateDoctorStatus = async (uid, status) => {
  await updateDoc(doc(db, "doctors", uid), { status });
};

export const deleteDoctor = async (uid) => {
  await deleteDoc(doc(db, "doctors", uid));
};
