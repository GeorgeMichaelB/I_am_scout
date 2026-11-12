import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: "I'm Scout",
                short_name: 'Scout',
                theme_color: '#6B21A8',
                background_color: '#FAF5FF',
                display: 'standalone',
                start_url: '/',
                icons: [
                    { src: '/images/logo.jpg', sizes: '192x192', type: 'image/jpeg' },
                    { src: '/images/logo.jpg', sizes: '512x512', type: 'image/jpeg' },
                ],
            },
        }),
    ],
});
