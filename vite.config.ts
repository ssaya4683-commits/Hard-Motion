import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base:
    process.env.NODE_ENV === "production"
      ? "/Hard-Motion/"
      : "/",

  plugins: [
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
      ],

      manifest: {
        id: "/Hard-Motion/",
        scope: "/Hard-Motion/",
        start_url: "/Hard-Motion/",

        name: "Hard Motion Inventory",
        short_name: "Hard Motion",
        description: "Aplikasi inventory Hard Motion",

        display: "standalone",
        orientation: "portrait",

        theme_color: "#059669",
        background_color: "#0f172a",

        categories: [
          "business",
          "productivity",
        ],

        icons: [
          {
            src: "/Hard-Motion/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],

        shortcuts: [
          {
            name: "POS",
            short_name: "POS",
            description: "Buka halaman kasir",
            url: "/Hard-Motion/sales",
          },
          {
            name: "Produk",
            short_name: "Produk",
            description: "Kelola produk",
            url: "/Hard-Motion/products",
          },
          {
            name: "Laporan",
            short_name: "Laporan",
            description: "Lihat laporan",
            url: "/Hard-Motion/reports",
          },
          {
            name: "Pengaturan",
            short_name: "Setting",
            description: "Buka pengaturan",
            url: "/Hard-Motion/settings",
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,json,woff2}"
        ],

        runtimeCaching: [
          {
            urlPattern: ({ request }: { request: Request }) =>
  request.mode === "navigate",

            handler: "NetworkFirst",

            options: {
              cacheName: "pages",

              networkTimeoutSeconds: 3,

              expiration: {
                maxEntries: 20,
              },
            },
          },

          {
            urlPattern: ({ request }: { request: Request }) =>
  request.destination === "script" ||
  request.destination === "style",

            handler: "StaleWhileRevalidate",

            options: {
              cacheName: "assets",

              expiration: {
                maxEntries: 50,
              },
            },
          },

          {
            urlPattern: ({ request }: { request: Request }) =>
  request.destination === "image",

            handler: "CacheFirst",

            options: {
              cacheName: "images",

              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },

          {
            urlPattern: ({ request }: { request: Request }) =>
  request.destination === "font",

            handler: "CacheFirst",

            options: {
              cacheName: "fonts",

              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
});