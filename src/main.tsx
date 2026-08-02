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
  if (message === "ResizeObserver loop completed with undelivered notifications." || message === "ResizeObserver loop limit exceeded") {
    return true; 
  }
  const div = document.createElement("div");
  div.style.padding = "20px";
  div.style.background = "#fee";
  div.style.color = "#900";
  div.innerHTML = "<h3>Fatal Global Error</h3><pre>" + (error?.stack || message) + "</pre>";
  document.body.prepend(div);
};

window.addEventListener("unhandledrejection", (e) => {
  const div = document.createElement("div");
  div.style.padding = "20px";
  div.style.background = "#fee";
  div.style.color = "#900";
  div.innerHTML = "<h3>Unhandled Promise Rejection</h3><pre>" + (e.reason?.stack || e.reason) + "</pre>";
  document.body.prepend(div);
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
