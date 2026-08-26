/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./options.html", "./src/**/*.{ts,tsx}"],
  corePlugins: {
    // Disabled: this stylesheet is injected into arbitrary third-party pages
    // via the content script. Preflight would reset margins/typography/etc.
    // on the whole host page, not just our widgets.
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
