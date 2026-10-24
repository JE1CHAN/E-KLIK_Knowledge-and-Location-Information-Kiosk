export function describeHealth(health) {
  switch (health.status) {
    case "online":
      return { label: "Server online", tone: "success" };
    case "degraded":
      return { label: "Database unavailable", tone: "warning" };
    case "offline":
      return { label: "Server offline", tone: "danger" };
    default:
      return { label: "Checking server…", tone: "neutral" };
  }
}

export function formatTime(date) {
  if (!(date instanceof Date)) return "—";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}
