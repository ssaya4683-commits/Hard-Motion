import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/Hard-Motion/",

  plugins: [
    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "Hard Motion Inventory",
        short_name: "Hard Motion",
        description: "Aplikasi inventory Hard Motion",

        theme_color: "#059669",
        background_color: "#0f172a",

        display: "standalone",

        start_url: "/Hard-Motion/",

        icons: [
          {
            src: "/Hard-Motion/favicon.svg",
            sizes: "any",
            type: "image/svg+xml"
          }
        ]
      }
    })
  ]
});
