import { Layers3, Pencil, Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminDataTable, {
  AdminTableButton,
} from "../../../components/ui/AdminDataTable";
import { useToast } from "../../../components/common/Toaster";
import {
  deleteSectionProduct,
  getSectionProductOptions,
  listSectionProducts,
  saveSectionProduct,
} from "../service/sectionProductsService";

function Form({ item, options, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    section_id: item?.section_id || "",
    product_id: item?.product_id || "",
    bundle_id: item?.bundle_id || "",
    display_order: item?.display_order || 1,
  }));
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (
      await onSave(
        {
          ...form,
          section_id: Number(form.section_id),
          product_id: Number(form.product_id),
          bundle_id: form.bundle_id ? Number(form.bundle_id) : null,
          display_order: Number(form.display_order),
        },
        item?.id,
      )
    )
      onClose();
  };
  return (
    <div className="admin-modal-backdrop">
      <form className="admin-modal admin-modal--wide" onSubmit={submit}>
        <header className="admin-modal__header">
          <div>
            <h2>{item ? "Edit section product" : "Add product to section"}</h2>
            <p>
              Configure the joined section, product, optional bundle, and
              display order.
            </p>
          </div>
          <button className="admin-icon-button" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="admin-form-grid">
          <label className="admin-field">
            Section
            <select
              required
              value={form.section_id}
              onChange={(event) => set("section_id", event.target.value)}
            >
              <option value="">Select section</option>
              {(options.sections || []).map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
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
              {(options.products || []).map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                  {row.sku ? ` · ${row.sku}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Bundle (optional)
            <select
              value={form.bundle_id}
              onChange={(event) => set("bundle_id", event.target.value)}
            >
              <option value="">No bundle</option>
              {(options.bundles || []).map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Display order
            <input
              required
              min="1"
              type="number"
              value={form.display_order}
              onChange={(event) => set("display_order", event.target.value)}
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
            {saving ? "Saving..." : item ? "Save changes" : "Add product"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function SectionProductsPage() {
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
      const result = await listSectionProducts({ page, search });
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
    void getSectionProductOptions()
      .then(setOptions)
      .catch((error) => toast.error(error.message));
  }, [load, toast]);
  const save = async (values, id) => {
    setSaving(true);
    try {
      const result = await saveSectionProduct(values, id);
      toast.success(
        id ? "Section product updated." : "Product added to section.",
      );
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
    if (
      !window.confirm(
        `Remove “${item.product_name}” from ${item.section_name}?`,
      )
    )
      return;
    try {
      await deleteSectionProduct(item.id);
      toast.success("Product removed from section.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const columns = [
    { id: "section_name", label: "Section", accessor: "section_name" },
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
      id: "bundle_name",
      label: "Bundle",
      render: (row) => row.bundle_name || "—",
    },
    { id: "display_order", label: "Order", accessor: "display_order" },
  ];
  const actions = (row) => (
    <div className="flex justify-end gap-2">
      <button
        className="admin-row-action"
        title="Edit assignment"
        onClick={() => {
          setEditing(row);
          setOpen(true);
        }}
      >
        <Pencil size={15} />
      </button>
      <button
        className="admin-row-action admin-row-action--danger"
        title="Remove product"
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
                <Layers3 size={20} color="#4f83ff" />
                <h1>Section Products</h1>
              </div>
              <p className="routes-page__subtitle">
                Assign products to sections with bundles and display ordering.
              </p>
            </div>
            <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#332d30] bg-[#171314] px-4 text-sm font-semibold text-[#c5d9f7]">
              <Layers3 size={16} />
              {pagination.total || 0} assignments
            </div>
          </div>
        </header>
        <AdminDataTable
          columns={columns}
          data={items}
          isLoading={loading}
          pagination={pagination}
          search={search}
          searchPlaceholder="Search sections, products, or bundles"
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          onPageChange={setPage}
          resultLabel={`Showing ${items.length} of ${pagination.total || 0} assignments`}
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
                Add product
              </AdminTableButton>
            </>
          }
          emptyMessage="No section product assignments found."
        />
      </div>
      {open ? (
        <Form
          item={editing}
          options={options}
          saving={saving}
          onClose={() => setOpen(false)}
          onSave={save}
        />
      ) : null}
    </main>
  );
}
