import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize analytics and error tracking
import { initSentry } from "./lib/sentry";
import { initPostHog } from "./lib/posthog";

// Generate session ID if one doesn't exist
if (!localStorage.getItem('sessionId')) {
  localStorage.setItem('sessionId', crypto.randomUUID());
}

// Initialize Sentry first (catches errors during initialization)
initSentry();

// Initialize PostHog
initPostHog();

createRoot(document.getElementById("root")!).render(<App />);
