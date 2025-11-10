import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize analytics and error tracking
import { initSentry } from "./lib/sentry";
import { initPostHog } from "./lib/posthog";

// Initialize Sentry first (catches errors during initialization)
initSentry();

// Initialize PostHog
initPostHog();

createRoot(document.getElementById("root")!).render(<App />);
