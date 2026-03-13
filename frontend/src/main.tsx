import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { registerSW } from "virtual:pwa-register";

// Register service worker with update prompt
if ("serviceWorker" in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Show a kid-friendly update banner
      const banner = document.createElement("div");
      banner.id = "sw-update-banner";
      banner.style.cssText =
        "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:99999;background:#2ecc71;border:3px solid #222;border-radius:999px;padding:8px 20px;font-family:'Comic Neue',cursive;font-weight:700;font-size:14px;box-shadow:4px 4px 0 #222;display:flex;align-items:center;gap:10px;";
      banner.textContent = "✨ New version available! ";
      const btn = document.createElement("button");
      btn.textContent = "Update";
      btn.style.cssText =
        "background:#fff;border:2px solid #222;border-radius:999px;padding:4px 12px;font-weight:800;font-size:13px;cursor:pointer;";
      btn.onclick = () => updateSW(true);
      banner.appendChild(btn);
      document.body.appendChild(banner);
    },
    onOfflineReady() {
      // Silently ready for offline — no UI needed
    },
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
