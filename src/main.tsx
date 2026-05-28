import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/auth/AuthContext';
import { TooltipProvider } from './components/ui/tooltip';

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

window.onerror = function (message) {
  if (message === "ResizeObserver loop completed with undelivered notifications." || message === "ResizeObserver loop limit exceeded") {
    return true; // suppresses the error
  }
};

window.addEventListener("error", (e) => {
  if (e.message === "ResizeObserver loop completed with undelivered notifications." || e.message === "ResizeObserver loop limit exceeded") {
    e.stopImmediatePropagation();
  }
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
