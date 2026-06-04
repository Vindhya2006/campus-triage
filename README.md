# 🏥 CampusTriage

> Healthcare support platform for hostel students — doctor consultations, prescriptions, medicine delivery, and emergency support.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server (opens at http://localhost:3000)
npm run dev
```

## 📁 Project Structure

```
campus-triage/
├── index.html          # Vite HTML entry point
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies & scripts
├── .gitignore
├── public/
│   └── favicon.svg     # App favicon
└── src/
    ├── main.jsx        # React entry point (mounts App)
    └── App.jsx         # Full CampusTriage application
```

## 🛠 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (`dist/`) |
| `npm run preview` | Preview production build locally |

## ✨ Features

- 👤 **Student & Doctor Authentication** — role-based login/signup
- 👨‍⚕️ **Doctor Directory** — browse & book verified specialists
- 📅 **Appointment Management** — book, track, and manage consultations
- 📋 **Digital Prescriptions** — view doctor-issued prescriptions
- 💊 **Medicine Ordering** — order from nearby pharmacies with tracking
- 📍 **Nearby Services** — locate hospitals & pharmacies with directions
- 🩺 **Health Profile** — allergies, conditions, medications, history
- 📊 **Health Tracker** — log sleep, water, meals, mood
- 🤖 **AI Triage** — symptom assessment with severity guidance
- 🚨 **Emergency Mode** — one-tap emergency contacts & hospital directions

## ⚠️ Disclaimer

This platform provides preliminary healthcare guidance only and does not replace professional medical advice, diagnosis, or treatment. In emergencies, contact a doctor or nearest hospital immediately.

## 🔧 Tech Stack

- **React 18** + **Vite 5**
- Pure inline styles (no CSS framework dependency)
- Leaflet.js for map directions (loaded dynamically)
- Browser Geolocation API
