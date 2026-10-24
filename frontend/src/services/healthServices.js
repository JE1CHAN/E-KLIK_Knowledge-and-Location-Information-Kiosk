import { apiRequest, ApiError } from "./apiClient.js";
import { getState, setHealth } from "../state/appState.js";

let inFlight = false;
let timerId = null;

export async function refreshHealth() {
  if (inFlight) return;
  inFlight = true;

  if (!getState().health.data) {
    setHealth({ status: "loading", error: null });
  }

  try {
    const data = await apiRequest("/api/health");
    setHealth({
      status: data.status === "ok" ? "online" : "degraded",
      data,
      error: null,
      checkedAt: new Date(),
    });
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "Unexpected error.";
    setHealth({
      status: "offline",
      data: null,
      error: message,
      checkedAt: new Date(),
    });
  } finally {
    inFlight = false;
  }
}

export function startHealthMonitor(intervalMs = 30000) {
  if (timerId !== null) return;
  refreshHealth();
  timerId = window.setInterval(() => {
    if (!document.hidden) refreshHealth();
  }, intervalMs);
}
