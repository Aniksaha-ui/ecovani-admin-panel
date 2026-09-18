import { Pencil, Trash2 } from "lucide-react";
import { APP_CONFIG } from "../../../services/config";

const categoryImageUrl = (path) =>
  path && /^https?:\/\//i.test(path)
    ? path
    : path
      ? `${APP_CONFIG.imageBaseUrl.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`
      : "";

export const categoryColumns = [
  { id: "serial", label: "SL", accessor: "serial", width: "70px" },
  {
    id: "image",
    label: "Image",
    render: (item) => {
      const src = categoryImageUrl(item.image);
      return src ? (
        <img className="category-table-image" src={src} alt="" />
      ) : (
        <span className="category-table-image category-table-image--empty">
          —
        </span>
      );
    },
    width: "92px",
  },
  {
    id: "name",
    label: "Category",
    render: (item) => (
      <div>
        <p className="font-semibold text-white">{item.name}</p>
        <p className="text-xs text-[var(--color-text-faint)]">ID: {item.id}</p>
      </div>
    ),
    width: "30%",
  },
  {
    id: "description",
    label: "Description",
    render: (item) => (
      <span className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">
        {item.description || "—"}
      </span>
    ),
    width: "50%",
  },
  {
    id: "created_at",
    label: "Created",
    render: (item) =>
      item.created_at ? new Date(item.created_at).toLocaleDateString() : "—",
    width: "15%",
  },
];
export const categoryActions =
  ({ onEdit, onDelete }) =>
  (item) => (
    <div className="flex justify-end gap-2">
      <button
        className="admin-row-action"
        onClick={() => onEdit(item)}
        aria-label={`Edit ${item.name}`}
      >
        <Pencil size={15} />
      </button>
      <button
        className="admin-row-action admin-row-action--danger"
        onClick={() => onDelete(item)}
        aria-label={`Delete ${item.name}`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
