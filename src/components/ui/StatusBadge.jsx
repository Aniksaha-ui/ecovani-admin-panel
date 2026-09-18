import { getStatusColors, getStatusTone } from "../../config/statusColors";
import { useTheme } from "../../contexts/ThemeContext";

export default function StatusBadge({ value, className = "operations-badge" }) {
  const { theme } = useTheme();
  const label = String(value || "unknown").replaceAll("_", " ");
  const colors = getStatusColors(value, theme);
  return (
    <span
      className={`${className} ${className}--${getStatusTone(value)}`}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      {label}
    </span>
  );
}
