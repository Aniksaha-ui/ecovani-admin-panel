export const STATUS_COLOR_CONFIG = {
  success: {
    light: { background: "#e8f8f0", border: "#86d5b5", text: "#087443" },
    dark: { background: "#123d2d", border: "#247858", text: "#8ee5b9" },
  },
  warning: {
    light: { background: "#fff7df", border: "#f0c970", text: "#9a5c00" },
    dark: { background: "#422f11", border: "#806127", text: "#fbd56f" },
  },
  danger: {
    light: { background: "#fff0f2", border: "#efadb8", text: "#b4233a" },
    dark: { background: "#482027", border: "#8d3b4a", text: "#ffadba" },
  },
  info: {
    light: { background: "#edf5ff", border: "#9fc7f5", text: "#1d5fae" },
    dark: { background: "#172f52", border: "#2c609f", text: "#9bc8ff" },
  },
  neutral: {
    light: { background: "#f1f5f9", border: "#cbd5e1", text: "#475569" },
    dark: { background: "#252c38", border: "#465466", text: "#c3cfde" },
  },
};

const STATUS_TONES = {
  success: [
    "active",
    "approved",
    "completed",
    "delivered",
    "paid",
    "processed",
    "received",
    "shipped",
    "on hand",
    "on_hand",
  ],
  warning: [
    "pending",
    "processing",
    "requested",
    "medium",
    "in progress",
    "in_progress",
  ],
  danger: [
    "inactive",
    "cancelled",
    "canceled",
    "failed",
    "rejected",
    "high",
    "overdue",
  ],
  info: ["refunded", "scheduled", "low"],
};

export function getStatusTone(value) {
  const normalized = String(value || "unknown")
    .toLowerCase()
    .replaceAll("_", " ");
  return (
    Object.entries(STATUS_TONES).find(([, statuses]) =>
      statuses.includes(normalized),
    )?.[0] || "neutral"
  );
}

export function getStatusColors(value, theme) {
  return STATUS_COLOR_CONFIG[getStatusTone(value)][
    theme === "light" ? "light" : "dark"
  ];
}
