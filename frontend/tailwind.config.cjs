module.exports = {
  content: ['./index.html', './apps/**/*.html', './apps/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: { themes: ['light', 'dark'] },
}
