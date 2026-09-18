import { Boxes, Plus, RefreshCcw } from "lucide-react";
import { useState } from "react";
import AdminDataTable, {
  AdminTableButton,
} from "../../../components/ui/AdminDataTable";
import ProductFormModal from "../component/ProductFormModal";
import ProductStockModal from "../component/ProductStockModal";
import ProductReportDrawer from "../component/ProductReportDrawer";
import { productActions, productColumns } from "../component/productColumns";
import useProducts from "../hooks/useProducts";

export default function ProductsPage() {
  const api = useProducts();
  const [editing, setEditing] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [productReport, setProductReport] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loadingEditId, setLoadingEditId] = useState(null);
  const openEdit = async (item) => {
    setLoadingEditId(item.id);
    const product = await api.edit(item.id);
    setLoadingEditId(null);
    if (product) {
      setEditing(product);
      setFormOpen(true);
    }
  };
  const openStock = async (item) => {
    setLoadingEditId(item.id);
    const product = await api.edit(item.id);
    setLoadingEditId(null);
    if (product) setStockProduct(product);
  };
  const openReport = async (item) => {
    setLoadingEditId(item.id);
    const report = await api.report(item.id);
    setLoadingEditId(null);
    if (report) setProductReport(report);
  };
  const actions = productActions({
    onEdit: openEdit,
    onViewStock: openStock,
    onViewReport: openReport,
    onDelete: async (item) => {
      if (window.confirm(`Delete “${item.name}”? This cannot be undone.`))
        await api.destroy(item.id);
    },
  });
  return (
    <main className="routes-page products-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="routes-page__title">
                <Boxes size={20} color="var(--color-accent)" />
                <h1>Products</h1>
              </div>
              <p className="routes-page__subtitle">
                Manage products, inventory, images, discounts, and homepage
                placement.
              </p>
            </div>
            <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text-secondary)]">
              <Boxes size={16} />
              {api.pagination.total} products
            </div>
          </div>
        </header>
        {api.error ? <p className="month-balance-alert">{api.error}</p> : null}
        <AdminDataTable
          columns={productColumns()}
          data={api.items}
          isLoading={api.isLoading}
          pagination={api.pagination}
          search={api.search}
          searchPlaceholder="Search products, SKU, or category"
          onPageChange={api.setPage}
          onSearchChange={(value) => {
            api.setPage(1);
            api.setSearch(value);
          }}
          resultLabel={`Showing ${api.items.length} of ${api.pagination.total} products`}
          renderRowActions={actions}
          rowActionsWidth="252px"
          actions={
            <>
              <AdminTableButton
                disabled={api.isLoading}
                onClick={() => api.refresh()}
              >
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
                New product
              </AdminTableButton>
            </>
          }
          emptyMessage="No products found."
        />
      </div>
      {formOpen ? (
        <ProductFormModal
          key={editing?.id ?? "new"}
          product={editing}
          options={api.options}
          isSaving={api.isSaving}
          onClose={() => setFormOpen(false)}
          onSave={api.save}
        />
      ) : null}
      {stockProduct ? (
        <ProductStockModal
          product={stockProduct}
          onClose={() => setStockProduct(null)}
        />
      ) : null}
      {productReport ? (
        <ProductReportDrawer
          report={productReport}
          onClose={() => setProductReport(null)}
        />
      ) : null}
      {loadingEditId ? (
        <div className="admin-loading-note">
          Loading product #{loadingEditId}…
        </div>
      ) : null}
    </main>
  );
}
