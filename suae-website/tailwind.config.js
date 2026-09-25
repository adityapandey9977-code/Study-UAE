/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pearl: "#f7f9fc",
        sand: "#e9eef5",
        dune: "#c8d3e2",
        gold: "#7fb2e5",
        lagoon: "#174a8b",
        tide: "#516b88",
        night: "#10233f",
        mint: "#d9eaf6"
      },
      fontFamily: {
        heading: ["Merriweather", "serif"],
        body: ["Source Sans 3", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 44px rgba(16, 35, 63, 0.10)",
        glow: "0 18px 40px rgba(23, 74, 139, 0.16)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 18% 18%, rgba(217,234,246,0.18), transparent 36%), radial-gradient(circle at 82% 0%, rgba(127,178,229,0.14), transparent 24%), linear-gradient(140deg, rgba(16,35,63,0.98), rgba(23,74,139,0.94) 54%, rgba(31,96,153,0.90))"
      }
    }
  },
  plugins: []
};
