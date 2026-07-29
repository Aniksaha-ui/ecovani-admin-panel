import {
  MessageSquare,
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
  deleteReview,
  listReviews,
  reviewOptions,
  saveReview,
} from "../service/productReviewsService";

function ReviewForm({ review, options, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    user_id: review?.user_id || "",
    product_id: review?.product_id || "",
    rating: review?.rating || 5,
    review: review?.review || "",
  }));
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (
      await onSave(
        {
          ...form,
          user_id: Number(form.user_id),
          product_id: Number(form.product_id),
          rating: Number(form.rating),
        },
        review?.id,
      )
    )
      onClose();
  };
  return (
    <div className="admin-modal-backdrop">
      <form className="admin-modal admin-modal--wide" onSubmit={submit}>
        <header className="admin-modal__header">
          <div>
            <h2>{review ? "Edit product review" : "New product review"}</h2>
            <p>Manage customer feedback for your product catalog.</p>
          </div>
          <button type="button" className="admin-icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="admin-form-grid">
          <label className="admin-field">
            Customer
            <select
              required
              value={form.user_id}
              onChange={(event) => set("user_id", event.target.value)}
            >
              <option value="">Select customer</option>
              {(options.users || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.email}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Product
            <select
              required
              value={form.product_id}
              onChange={(event) => set("product_id", event.target.value)}
            >
              <option value="">Select product</option>
              {(options.products || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.sku ? ` · ${item.sku}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Rating
            <select
              value={form.rating}
              onChange={(event) => set("rating", event.target.value)}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} star{rating === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field admin-field--full">
            Review
            <textarea
              required
              rows="5"
              value={form.review}
              onChange={(event) => set("review", event.target.value)}
            />
          </label>
        </div>
        <footer className="admin-modal__actions">
          <button type="button" className="routes-control" onClick={onClose}>
            Cancel
          </button>
          <button
            className="routes-control routes-control--blue"
            disabled={saving}
          >
            {saving ? "Saving..." : review ? "Save changes" : "Create review"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function ProductReviewsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState({});
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listReviews({ page, search });
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
    void reviewOptions()
      .then(setOptions)
      .catch((error) => toast.error(error.message));
  }, [load, toast]);
  const save = async (values, id) => {
    setSaving(true);
    try {
      const result = await saveReview(values, id);
      toast.success(id ? "Review updated." : "Review created.");
      await load();
      return result;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setSaving(false);
    }
  };
  const remove = async (review) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(review.id);
      toast.success("Review deleted.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const columns = [
    {
      id: "product_name",
      label: "Product",
      render: (row) => (
        <div>
          <strong className="text-white">{row.product_name}</strong>
          <p className="mt-1 text-xs text-[#7d8ca5]">
            {row.product_sku || "No SKU"}
          </p>
        </div>
      ),
    },
    {
      id: "user_name",
      label: "Customer",
      render: (row) => (
        <div>
          <strong>{row.user_name}</strong>
          <p className="mt-1 text-xs text-[#7d8ca5]">{row.user_email}</p>
        </div>
      ),
    },
    {
      id: "rating",
      label: "Rating",
      render: (row) => (
        <span className="text-[#ffb400]">
          {"★".repeat(row.rating)}
          <span className="text-[#778397]">{"★".repeat(5 - row.rating)}</span>
        </span>
      ),
    },
    {
      id: "review",
      label: "Review",
      render: (row) => (
        <span className="line-clamp-2 max-w-80">{row.review}</span>
      ),
    },
    {
      id: "created_at",
      label: "Date",
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];
  const actions = (row) => (
    <div className="flex justify-end gap-2">
      <button
        className="admin-row-action"
        onClick={() => {
          setEditing(row);
          setOpen(true);
        }}
      >
        <Pencil size={15} />
      </button>
      <button
        className="admin-row-action admin-row-action--danger"
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
          <div className="routes-page__title">
            <MessageSquare size={20} color="#4f83ff" />
            <h1>Product Reviews</h1>
          </div>
          <p className="routes-page__subtitle">
            Manage customer ratings and product feedback.
          </p>
        </header>
        <AdminDataTable
          columns={columns}
          data={items}
          isLoading={loading}
          pagination={pagination}
          search={search}
          searchPlaceholder="Search reviews"
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          onPageChange={setPage}
          resultLabel={`Showing ${items.length} of ${pagination.total || 0} reviews`}
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
                  setOpen(true);
                }}
              >
                <Plus size={14} />
                New review
              </AdminTableButton>
            </>
          }
          emptyMessage="No product reviews found."
        />
      </div>
      {open ? (
        <ReviewForm
          review={editing}
          options={options}
          saving={saving}
          onClose={() => setOpen(false)}
          onSave={save}
        />
      ) : null}
    </main>
  );
}
