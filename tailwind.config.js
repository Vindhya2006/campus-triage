/** @type {import('tailwindcss').Config} */
export default {
  // Only scan files that actually exist in this project.
  // The CampusTriage UI uses inline styles, so Tailwind generates
  // no CSS classes in practice — keeping the bundle minimal.
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
