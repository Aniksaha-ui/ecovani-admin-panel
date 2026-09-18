import { BarChart3, Boxes, Pencil, Trash2 } from "lucide-react";
import { APP_CONFIG } from "../../../services/config";
import StatusBadge from "../../../components/ui/StatusBadge";

const productImageUrl = (path) =>
  path && /^https?:\/\//i.test(path)
    ? path
    : path
      ? `${APP_CONFIG.imageBaseUrl.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`
      : "";

export const productColumns = () => [
  { id: "serial", label: "SL", accessor: "serial", width: "65px" },
  {
    id: "image_url",
    label: "Image",
    width: "86px",
    render: (item) => {
      const src = productImageUrl(item.image_url);
      return src ? (
        <img className="product-table-image" src={src} alt="" />
      ) : (
        <span className="product-table-image product-table-image--empty">—</span>
      );
    },
  },
  {
    id: "name",
    label: "Product",
    width: "27%",
    render: (item) => (
      <div className="product-cell">
        <p className="product-cell__name font-semibold text-white">{item.name}</p>
        <p className="text-xs text-[var(--color-text-faint)]">
          {item.sku || "No SKU"}
        </p>
      </div>
    ),
  },
  {
    id: "category_name",
    label: "Category",
    render: (item) => (
      <div className="text-sm text-[var(--color-text-secondary)]">
        <p>{item.category_name}</p>
        <p className="text-xs text-[var(--color-text-faint)]">
          {item.subcategory_name}
        </p>
      </div>
    ),
    width: "19%",
  },
  {
    id: "price",
    label: "Price",
    render: (item) => `৳${Number(item.price || 0).toLocaleString()}`,
    width: "12%",
  },
  {
    id: "stock_quantity",
    label: "Stock",
    render: (item) => (
      <span
        className={`product-stock-value ${Number(item.stock_quantity) > 0 ? "product-stock-value--available" : "product-stock-value--empty"}`}
      >
        {item.stock_quantity ?? 0}
      </span>
    ),
    width: "10%",
  },
  {
    id: "is_active",
    label: "Status",
    render: (item) => (
      <StatusBadge value={item.is_active ? "Active" : "Inactive"} />
    ),
    width: "11%",
  },
];
export const productActions =
  ({ onEdit, onDelete, onViewStock, onViewReport }) =>
  (item) => (
    <div className="product-row-actions">
      <button
        className="product-stock-action"
        onClick={() => onViewStock(item)}
      >
        <Boxes size={14} />
        Stock
      </button>
      <button
        className="product-report-action"
        onClick={() => onViewReport(item)}
      >
        <BarChart3 size={14} /> Report
      </button>
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
