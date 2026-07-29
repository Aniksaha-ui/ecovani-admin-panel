import {
  Eye,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminDataTable, {
  AdminTableButton,
} from "../../../components/ui/AdminDataTable";
import { useToast } from "../../../components/common/Toaster";
import {
  deleteProductBundle,
  getProductBundle,
  listProductBundles,
  saveProductBundle,
} from "../service/productBundlesService";

const money = (value) => `৳${Number(value || 0).toLocaleString()}`;
const date = (value) => (value ? new Date(value).toLocaleString() : "—");

function BundleForm({ bundle, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    name: bundle?.name || "",
    description: bundle?.description || "",
    price: bundle?.price || "",
    discount_price: bundle?.discount_price || "",
    is_active: Boolean(Number(bundle?.is_active ?? 1)),
  }));
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    const saved = await onSave(
      {
        ...form,
        price: Number(form.price),
        discount_price:
          form.discount_price === "" ? null : Number(form.discount_price),
      },
      bundle?.id,
    );
    if (saved) onClose();
  };
  return (
    <div className="admin-modal-backdrop">
      <form className="admin-modal admin-modal--wide" onSubmit={submit}>
        <header className="admin-modal__header">
          <div>
            <h2>{bundle ? "Edit product bundle" : "New product bundle"}</h2>
            <p>Set bundle pricing and availability for your storefront.</p>
          </div>
          <button
            type="button"
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>
        <div className="admin-form-grid">
          <label className="admin-field admin-field--full">
            Bundle name
            <input
              required
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              placeholder="e.g. Home essentials bundle"
            />
          </label>
          <label className="admin-field admin-field--full">
            Description
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Optional bundle description"
            />
          </label>
          <label className="admin-field">
            Regular price (৳)
            <input
              required
              min="0"
              step="0.01"
              type="number"
              value={form.price}
              onChange={(event) => set("price", event.target.value)}
            />
          </label>
          <label className="admin-field">
            Discount price (৳)
            <input
              min="0"
              step="0.01"
              type="number"
              value={form.discount_price}
              onChange={(event) => set("discount_price", event.target.value)}
            />
          </label>
          <label className="admin-toggle admin-field--full">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => set("is_active", event.target.checked)}
            />
            <span>Bundle is active and available for sale</span>
          </label>
        </div>
        <footer className="admin-modal__actions">
          <button className="routes-control" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="routes-control routes-control--blue"
            disabled={saving}
          >
            {saving ? "Saving..." : bundle ? "Save changes" : "Create bundle"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function BundleDetails({ bundle, onClose }) {
  return (
    <div className="admin-modal-backdrop">
      <article className="admin-modal admin-modal--wide commerce-transaction-modal">
        <header className="admin-modal__header">
          <div>
            <h2>Bundle details</h2>
            <p>Complete product-bundle record.</p>
          </div>
          <button
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close bundle details"
          >
            <X size={18} />
          </button>
        </header>
        <section className="commerce-transaction-summary">
          <div>
            <span>Bundle</span>
            <strong>{bundle.name}</strong>
            <small>#{bundle.id}</small>
          </div>
          <div>
            <span>Regular price</span>
            <strong>{money(bundle.price)}</strong>
            <small>
              {bundle.discount_price
                ? `Offer: ${money(bundle.discount_price)}`
                : "No offer price"}
            </small>
          </div>
          <div>
            <span>Status</span>
            <strong>{Number(bundle.is_active) ? "Active" : "Inactive"}</strong>
            <small>Last updated {date(bundle.updated_at)}</small>
          </div>
        </section>
        <section className="commerce-transaction-fields">
          <p>
            <span>Description</span>
            <strong>{bundle.description || "No description provided."}</strong>
          </p>
          <p>
            <span>Created</span>
            <strong>{date(bundle.created_at)}</strong>
          </p>
          <p>
            <span>Updated</span>
            <strong>{date(bundle.updated_at)}</strong>
          </p>
        </section>
        <footer className="admin-modal__actions">
          <button
            className="routes-control routes-control--blue"
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </article>
    </div>
  );
}

export default function ProductBundlesPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [details, setDetails] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listProductBundles({ page, search });
      setItems(result.rows);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);
  useEffect(() => {
    void load();
  }, [load]);
  const save = async (values, id) => {
    setSaving(true);
    try {
      const result = await saveProductBundle(values, id);
      toast.success(id ? "Product bundle updated." : "Product bundle created.");
      await load();
      return result;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setSaving(false);
    }
  };
  const view = async (bundle) => {
    try {
      setDetails(await getProductBundle(bundle.id));
    } catch (error) {
      toast.error(error.message);
    }
  };
  const remove = async (bundle) => {
    if (!window.confirm(`Delete “${bundle.name}”? This cannot be undone.`))
      return;
    try {
      await deleteProductBundle(bundle.id);
      toast.success("Product bundle deleted.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const columns = [
    { id: "id", label: "ID", render: (row) => `#${row.id}` },
    {
      id: "name",
      label: "Bundle",
      render: (row) => (
        <div>
          <strong className="text-white">{row.name}</strong>
          <p className="mt-1 max-w-80 truncate text-xs text-[#7d8ca5]">
            {row.description || "No description"}
          </p>
        </div>
      ),
    },
    { id: "price", label: "Price", render: (row) => money(row.price) },
    {
      id: "discount_price",
      label: "Offer price",
      render: (row) => (row.discount_price ? money(row.discount_price) : "—"),
    },
    {
      id: "is_active",
      label: "Status",
      render: (row) => (
        <span className="operations-badge">
          {Number(row.is_active) ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "updated_at",
      label: "Updated",
      render: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—",
    },
  ];
  const actions = (row) => (
    <div className="flex justify-end gap-2">
      <button
        className="admin-row-action"
        title="View details"
        onClick={() => void view(row)}
      >
        <Eye size={15} />
      </button>
      <button
        className="admin-row-action"
        title="Edit bundle"
        onClick={() => {
          setEditing(row);
          setFormOpen(true);
        }}
      >
        <Pencil size={15} />
      </button>
      <button
        className="admin-row-action admin-row-action--danger"
        title="Delete bundle"
        onClick={() => void remove(row)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="routes-page__title">
                <PackagePlus size={20} color="#4f83ff" />
                <h1>Product Bundles</h1>
              </div>
              <p className="routes-page__subtitle">
                Create and manage bundled offers, pricing, and availability.
              </p>
            </div>
            <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#332d30] bg-[#171314] px-4 text-sm font-semibold text-[#c5d9f7]">
              <PackagePlus size={16} />
              {pagination.total || 0} bundles
            </div>
          </div>
        </header>
        <AdminDataTable
          columns={columns}
          data={items}
          isLoading={loading}
          pagination={pagination}
          search={search}
          searchPlaceholder="Search product bundles"
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          onPageChange={setPage}
          resultLabel={`Showing ${items.length} of ${pagination.total || 0} bundles`}
          renderRowActions={actions}
          actions={
            <>
              <AdminTableButton onClick={load}>
                <RefreshCcw size={14} />
                Refresh
              </AdminTableButton>
              <AdminTableButton
                variant="blue"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus size={14} />
                New bundle
              </AdminTableButton>
            </>
          }
          emptyMessage="No product bundles found."
        />
      </div>
      {formOpen ? (
        <BundleForm
          bundle={editing}
          saving={saving}
          onClose={() => setFormOpen(false)}
          onSave={save}
        />
      ) : null}
      {details ? (
        <BundleDetails bundle={details} onClose={() => setDetails(null)} />
      ) : null}
    </main>
  );
}
