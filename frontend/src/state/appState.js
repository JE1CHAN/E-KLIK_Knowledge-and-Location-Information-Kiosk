const state = {
  health: {
    status: "loading", // "loading" | "online" | "degraded" | "offline"
    data: null,
    error: null,
    checkedAt: null,
  },
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setHealth(patch) {
  state.health = { ...state.health, ...patch };
  for (const listener of listeners) listener(state);
}

/** Subscribe to state changes. Calls the listener immediately and returns an unsubscribe function. */
export function subscribe(listener) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}
