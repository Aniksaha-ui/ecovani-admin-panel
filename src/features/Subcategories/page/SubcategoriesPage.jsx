import {
  FolderTree,
  Pencil,
  Plus,
  RefreshCcw,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminDataTable, {
  AdminTableButton,
} from "../../../components/ui/AdminDataTable";
import { useToast } from "../../../components/common/Toaster";
import {
  deleteSubcategory,
  listCategoryOptions,
  listSubcategories,
  saveSubcategory,
} from "../service/subcategoriesService";

function Form({ item, categories, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    category_id: item?.category_id || "",
    name: item?.name || "",
    description: item?.description || "",
  }));
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (
      await onSave({ ...form, category_id: Number(form.category_id) }, item?.id)
    )
      onClose();
  };
  return (
    <div className="admin-modal-backdrop">
      <form className="admin-modal" onSubmit={submit}>
        <header className="admin-modal__header">
          <div>
            <h2>{item ? "Edit subcategory" : "New subcategory"}</h2>
            <p>Organize products beneath their parent category.</p>
          </div>
          <button type="button" className="admin-icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="admin-form-grid">
          <label className="admin-field admin-field--full">
            Parent category
            <select
              required
              value={form.category_id}
              onChange={(event) => set("category_id", event.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field admin-field--full">
            Subcategory name
            <input
              required
              maxLength="100"
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
            />
          </label>
          <label className="admin-field admin-field--full">
            Description
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Optional description"
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
            {saving
              ? "Saving..."
              : item
                ? "Save changes"
                : "Create subcategory"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function SubcategoriesPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
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
      const result = await listSubcategories({ page, search });
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
    void listCategoryOptions()
      .then(setCategories)
      .catch((error) => toast.error(error.message));
  }, [load, toast]);
  const save = async (values, id) => {
    setSaving(true);
    try {
      const result = await saveSubcategory(values, id);
      toast.success(id ? "Subcategory updated." : "Subcategory created.");
      await load();
      return result;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setSaving(false);
    }
  };
  const remove = async (item) => {
    if (!window.confirm(`Delete “${item.name}”?`)) return;
    try {
      await deleteSubcategory(item.id);
      toast.success("Subcategory deleted.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const columns = [
    {
      id: "name",
      label: "Subcategory",
      render: (row) => (
        <div>
          <strong className="text-white">{row.name}</strong>
          <p className="mt-1 max-w-80 truncate text-xs text-[#7d8ca5]">
            {row.description || "No description"}
          </p>
        </div>
      ),
    },
    { id: "category_name", label: "Category", accessor: "category_name" },
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
        title="Edit subcategory"
        onClick={() => {
          setEditing(row);
          setOpen(true);
        }}
      >
        <Pencil size={15} />
      </button>
      <button
        className="admin-row-action admin-row-action--danger"
        title="Delete subcategory"
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
                <Tags size={20} color="#4f83ff" />
                <h1>Subcategories</h1>
              </div>
              <p className="routes-page__subtitle">
                Manage product subcategories and their parent categories.
              </p>
            </div>
            <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#332d30] bg-[#171314] px-4 text-sm font-semibold text-[#c5d9f7]">
              <FolderTree size={16} />
              {pagination.total || 0} subcategories
            </div>
          </div>
        </header>
        <AdminDataTable
          columns={columns}
          data={items}
          isLoading={loading}
          pagination={pagination}
          search={search}
          searchPlaceholder="Search subcategories"
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          onPageChange={setPage}
          resultLabel={`Showing ${items.length} of ${pagination.total || 0} subcategories`}
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
                New subcategory
              </AdminTableButton>
            </>
          }
          emptyMessage="No subcategories found."
        />
      </div>
      {open ? (
        <Form
          item={editing}
          categories={categories}
          saving={saving}
          onClose={() => setOpen(false)}
          onSave={save}
        />
      ) : null}
    </main>
  );
}
