import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import util from './utils/util';
import reportWebVitals from './reportWebVitals';
import themeLoader from './utils/themeLoader';

// Suppress ResizeObserver error (harmless warning from Ant Design components)
const resizeObserverErr = window.console.error;
window.console.error = (...args) => {
  if (args[0]?.includes?.('ResizeObserver loop')) {
    return;
  }
  resizeObserverErr(...args);
};

const originalErrorHandler = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (typeof message === 'string' && message.includes('ResizeObserver loop')) {
    return true;
  }
  if (originalErrorHandler) {
    return originalErrorHandler(message, source, lineno, colno, error);
  }
  return false;
};

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('ResizeObserver loop')) {
    event.preventDefault();
  }
});

// ─── Theme Initialization Strategy ────────────────────────────────────────────
// Step 1: Instantly apply cached theme from localStorage (zero-latency, no flash)
//         This runs synchronously BEFORE React mounts so there is no FOUC.
themeLoader.loadFromCache();

// Step 2: Asynchronously fetch the active theme from the backend (public endpoint,
//         no auth required). This ensures the theme is always in sync with whatever
//         the admin has set, for ALL pages (login, registration, dashboard, etc.).
//         We fire-and-forget — the render is not blocked.
themeLoader.loadActiveTheme().catch(() => {/* silent — cache already applied */ });
// ──────────────────────────────────────────────────────────────────────────────

// Clear any stale global loader overlay from a prior failed navigation or hot reload.
util.hideLoader();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

reportWebVitals();