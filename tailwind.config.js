/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#1E3A8A', // 🎨 Синий (основной)
                secondary: '#F59E0B', // 🟡 Жёлтый (акцент)
                accent: '#E11D48', // ❤️ Красный (доп)
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            screens: {
                xs: '480px', // 📱 Кастомный брейкпоинт
            },
        },
    },
    darkMode: 'class',
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
};