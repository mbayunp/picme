// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Pastikan path ini mencakup semua file JS, JSX, TS, TSX di folder src.
    "./src/AnimatedBackgroundParticles.jsx" // Opsional, tapi pastikan path ini benar jika file tidak di-catch oleh glob di atas.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}