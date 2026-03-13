import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["fonts/**/*.ttf", "icons/**/*"],
      manifest: {
        name: "Inspiror - Build Anything!",
        short_name: "Inspiror",
        description:
          "AI-powered coding for kids ages 8-12. Build games, apps, and animations with your Builder Buddy!",
        start_url: "/",
        display: "standalone",
        background_color: "#fdfbf7",
        theme_color: "#4ecdc4",
        icons: [
          {
            src: "/icons/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
        categories: ["education", "kids"],
      },
      workbox: {
        // Precache app shell assets (JS, CSS, HTML, fonts)
        globPatterns: ["**/*.{js,css,html,svg,ttf,woff,woff2,png,ico}"],
        // Runtime caching for API calls
        runtimeCaching: [
          {
            urlPattern: /\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
