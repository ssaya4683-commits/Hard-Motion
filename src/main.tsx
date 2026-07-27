import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

import { initializeSettings } from "./services/settingsService";
import { registerSW } from "virtual:pwa-register";

async function bootstrap() {
  await initializeSettings();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
registerSW({
  immediate: true,

  onOfflineReady() {
    console.log("Hard Motion siap digunakan secara offline.");
  },

  onNeedRefresh() {
    console.log("Versi baru tersedia. Refresh halaman untuk memperbarui.");
  },
});