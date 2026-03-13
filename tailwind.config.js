/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                indigo: {
                    500: '#6366f1', // Primary Action
                    900: '#312e81', // Deep Interaction
                }
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            fontSize: {
                'dtse-caption': ['10px', { letterSpacing: '0.2em', fontWeight: '800' }],
                'dtse-label': ['11px', { letterSpacing: '0.18em', fontWeight: '800' }],
            },
            borderRadius: {
                'dtse-badge': '4px',
            },
        },
    },
    plugins: [],
}
