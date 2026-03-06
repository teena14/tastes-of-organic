/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1B5E20",
                "primary-dark": "#0F3D15",
                sage: "#B5C98A",
                "sage-pale": "#C8D9B0",
                accent: "#D4C85A",
                "accent-soft": "#F5EDBB",
                cream: "#F8F6F0",
                brown: "#6B3A1F",
            },
            fontFamily: {
                abel: ["Abel", "sans-serif"],
                poppins: ["Poppins", "sans-serif"],
                // legacy aliases kept for compatibility
                heading: ["Abel", "sans-serif"],
                subheading: ["Abel", "sans-serif"],
                body: ["Poppins", "sans-serif"],
            },
        },
    },
    plugins: [],
}