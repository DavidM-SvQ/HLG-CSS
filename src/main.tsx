import { ErrorBoundary } from "./components/ErrorBoundary";
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/auth/AuthContext';
import { TooltipProvider } from './components/ui/tooltip';

if (typeof window.ResizeObserver !== "undefined") {
  const _ResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      super((entries, observer) => {
        window.requestAnimationFrame(() => {
          try {
            callback(entries, observer);
          } catch (e) {
            // ignore
          }
        });
      });
    }
  };
}

const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("ResizeObserver loop")
  ) {
    return;
  }
  originalError(...args);
};

window.onerror = function (message, source, lineno, colno, error) {
  const msgStr = typeof message === "string" ? message : "";
  if (
    msgStr.includes("ResizeObserver") ||
    msgStr.includes("WebSocket") ||
    msgStr.includes("vite")
  ) {
    return true; 
  }
  console.error("Global Error:", message, error);
  return false;
};

window.addEventListener("unhandledrejection", (e) => {
  const reason = e.reason?.message || String(e.reason || "");
  if (
    reason.includes("WebSocket") ||
    reason.includes("vite") ||
    reason.includes("ResizeObserver") ||
    reason.includes("aborted") ||
    reason.includes("canceled")
  ) {
    e.preventDefault();
    return;
  }
  console.warn("Unhandled promise rejection:", e.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <ErrorBoundary><App /></ErrorBoundary>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
