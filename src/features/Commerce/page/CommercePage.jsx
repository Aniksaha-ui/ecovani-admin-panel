/* eslint-disable react-hooks/set-state-in-effect */
import {
  Download,
  Eye,
  Pencil,
  Plus,
  Printer,
  RefreshCcw,
  Truck,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminDataTable, {
  AdminTableButton,
} from "../../../components/ui/AdminDataTable";
import { useToast } from "../../../components/common/Toaster";
import * as service from "../service/commerceService";
import TransactionDetailModal from "../component/TransactionDetailModal";
import StatusBadge from "../../../components/ui/StatusBadge";

const money = (value) => `৳${Number(value || 0).toLocaleString()}`;
const badge = (value) => <StatusBadge value={value} />;
const names = {
  orders: "Orders",
  transactions: "Transactions",
  coupons: "Coupons",
};
const configs = {
  orders: service.getOrders,
  transactions: service.getTransactions,
  coupons: service.getCoupons,
};

function CouponModal({ coupon, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    code: coupon?.code || "",
    discount_type: coupon?.discount_type || "flat",
    discount_value: coupon?.discount_value || "",
    start_date: coupon?.start_date?.slice(0, 10) || "",
    end_date: coupon?.end_date?.slice(0, 10) || "",
    max_usage: coupon?.max_usage ?? 0,
  }));
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (
      await onSave(
        {
          ...form,
          discount_value: Number(form.discount_value),
          max_usage: Number(form.max_usage || 0),
        },
        coupon?.id,
      )
    )
      onClose();
  };
  return (
    <div className="admin-modal-backdrop">
      <form className="admin-modal" onSubmit={submit}>
        <div className="admin-modal__header">
          <div>
            <h2>{coupon ? "Edit coupon" : "New coupon"}</h2>
            <p>Configure promotion rules and validity dates.</p>
          </div>
          <button className="admin-icon-button" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field">
            Code
            <input
              required
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
            />
          </label>
          <label className="admin-field">
            Discount type
            <select
              value={form.discount_type}
              onChange={(e) => update("discount_type", e.target.value)}
            >
              <option value="flat">Flat amount</option>
              <option value="percentage">Percentage</option>
            </select>
          </label>
          <label className="admin-field">
            Discount value
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={form.discount_value}
              onChange={(e) => update("discount_value", e.target.value)}
            />
          </label>
          <label className="admin-field">
            Maximum uses
            <input
              min="0"
              type="number"
              value={form.max_usage}
              onChange={(e) => update("max_usage", e.target.value)}
            />
          </label>
          <label className="admin-field">
            Starts
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => update("start_date", e.target.value)}
            />
          </label>
          <label className="admin-field">
            Ends
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => update("end_date", e.target.value)}
            />
          </label>
        </div>
        <div className="admin-modal__actions">
          <button type="button" className="routes-control" onClick={onClose}>
            Cancel
          </button>
          <button
            className="routes-control routes-control--blue"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save coupon"}
          </button>
        </div>
      </form>
    </div>
  );
}

function OrderInvoice({ order, onClose }) {
  const invoiceRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const date = order.created_at
    ? new Date(order.created_at).toLocaleString()
    : "—";
  const shippingAddress = [
    order.address_line1,
    order.address_line2,
    order.address_city,
    order.address_state,
    order.postal_code,
    order.address_country,
  ]
    .filter(Boolean)
    .join(", ");
  const customerPhone = order.address_phone || order.customer_phone || "—";
  const exportPdf = async () => {
    if (!invoiceRef.current) return;
    setIsExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        ignoreElements: (element) =>
          element.dataset.html2canvasIgnore === "true",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 10;
      const printableWidth = 210 - margin * 2;
      const printableHeight = 297 - margin * 2;
      const scale = Math.min(
        printableWidth / canvas.width,
        printableHeight / canvas.height,
      );
      const width = canvas.width * scale;
      const height = canvas.height * scale;
      const image = canvas.toDataURL("image/png");
      pdf.addImage(image, "PNG", (210 - width) / 2, margin, width, height);
      pdf.save(`ecovani-invoice-${order.id}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <div className="admin-modal-backdrop">
      <article
        ref={invoiceRef}
        className="admin-modal admin-modal--wide document-invoice legacy-invoice commerce-order-invoice"
      >
        <header className="document-invoice__header">
          <div className="document-invoice__reference">
            <span>Invoice #</span>
            <strong>{order.id}</strong>
            <small>Issued {date}</small>
          </div>
          <div className="document-invoice__brand">
            <strong>ECOVANI</strong>
            <span>Modern essentials, thoughtfully delivered</span>
            <small>
              Mirpur 11, Dhaka 1216, Bangladesh
              <br />
              support@ecovani.com
            </small>
          </div>
        </header>
        <section className="document-invoice__summary">
          <div>
            <span>Name</span>
            <strong>{order.customer_name || "—"}</strong>
          </div>
          <div>
            <span>Order date</span>
            <strong>{date}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{customerPhone}</strong>
          </div>
          <div>
            <span>Payment method</span>
            <strong>
              {String(order.payment_status || "—").replaceAll("_", " ")}
            </strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{order.customer_email || "—"}</strong>
          </div>
          <div>
            <span>Shipping status</span>
            <strong>{String(order.status || "—").replaceAll("_", " ")}</strong>
          </div>
          <div className="document-invoice__summary-wide">
            <span>Address</span>
            <strong>{shippingAddress || "Address not provided"}</strong>
          </div>
        </section>
        <section className="document-invoice__items">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name || "Product unavailable"}</td>
                  <td>{item.sku || "—"}</td>
                  <td>{item.quantity}</td>
                  <td>{money(item.price)}</td>
                  <td>
                    {money(
                      Number(item.price || 0) * Number(item.quantity || 0),
                    )}
                  </td>
                </tr>
              ))}
              {Array.from({
                length: Math.max(0, 14 - (order.items?.length || 0)),
              }).map((_, index) => (
                <tr
                  className="document-invoice__blank-row"
                  key={`blank-${index}`}
                >
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <footer className="document-invoice__footer">
          <div className="document-invoice__notes">
            <span>Notes</span>
            <p>
              Thank you for choosing Ecovani. This is a computer-generated
              invoice.
            </p>
            <small>Company policy: No refunds after 24 hours.</small>
          </div>
          <div className="document-invoice__totals">
            <p>
              <span>Subtotal</span>
              <strong>{money(order.total_amount)}</strong>
            </p>
            <p>
              <span>Discount</span>
              <strong>{money(0)}</strong>
            </p>
            <p>
              <span>Tax</span>
              <strong>{money(0)}</strong>
            </p>
            <p className="document-invoice__grand-total">
              <span>Grand total</span>
              <strong>{money(order.total_amount)}</strong>
            </p>
          </div>
        </footer>
        <div
          data-html2canvas-ignore="true"
          className="admin-modal__actions commerce-order-invoice__actions"
        >
          <button className="routes-control" onClick={() => window.print()}>
            <Printer size={15} />
            Print
          </button>
          <button
            className="routes-control routes-control--blue"
            onClick={exportPdf}
            disabled={isExporting}
          >
            <Download size={15} />
            {isExporting ? "Preparing PDF…" : "Download PDF"}
          </button>
          <button className="routes-control" onClick={onClose}>
            Close
          </button>
        </div>
      </article>
    </div>
  );
}

export default function CommercePage({ section }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [order, setOrder] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await configs[section]({ page, search });
      setItems(result.rows);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, section, toast]);
  useEffect(() => {
    void load();
  }, [load]);
  const run = async (work, success) => {
    setSaving(true);
    try {
      const result = await work();
      toast.success(success);
      await load();
      return result;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setSaving(false);
    }
  };
  const columns =
    section === "orders"
      ? [
          { id: "serial", label: "SL", accessor: "serial" },
          { id: "id", label: "Order", render: (row) => `#${row.id}` },
          {
            id: "customer_name",
            label: "Customer",
            render: (row) => (
              <div>
                <p>{row.customer_name}</p>
                <p className="text-xs text-[var(--color-text-faint)]">
                  {row.customer_email}
                </p>
              </div>
            ),
          },
          { id: "item_count", label: "Items", accessor: "item_count" },
          {
            id: "total_amount",
            label: "Total",
            render: (row) => money(row.total_amount),
          },
          {
            id: "payment_status",
            label: "Payment",
            render: (row) => badge(row.payment_status),
          },
          { id: "status", label: "Status", render: (row) => badge(row.status) },
          {
            id: "created_at",
            label: "Date",
            render: (row) => new Date(row.created_at).toLocaleDateString(),
          },
        ]
      : section === "transactions"
        ? [
            { id: "serial", label: "SL", accessor: "serial" },
            { id: "id", label: "Transaction", render: (row) => `#${row.id}` },
            {
              id: "order_id",
              label: "Order",
              render: (row) => `#${row.order_id}`,
            },
            {
              id: "customer_name",
              label: "Customer",
              accessor: "customer_name",
            },
            {
              id: "amount",
              label: "Amount",
              render: (row) => money(row.amount),
            },
            {
              id: "payment_method",
              label: "Method",
              accessor: "payment_method",
            },
            {
              id: "status",
              label: "Status",
              render: (row) => badge(row.status || row.payment_status),
            },
            { id: "bank_ssl_id", label: "Reference", accessor: "bank_ssl_id" },
          ]
        : [
            { id: "serial", label: "SL", accessor: "serial" },
            {
              id: "code",
              label: "Code",
              render: (row) => (
                <strong className="text-white">{row.code}</strong>
              ),
            },
            {
              id: "discount_type",
              label: "Discount",
              render: (row) =>
                row.discount_type === "percentage"
                  ? `${row.discount_value}%`
                  : money(row.discount_value),
            },
            { id: "max_usage", label: "Max uses", accessor: "max_usage" },
            {
              id: "start_date",
              label: "Starts",
              render: (row) => row.start_date?.slice(0, 10) || "—",
            },
            {
              id: "end_date",
              label: "Ends",
              render: (row) => row.end_date?.slice(0, 10) || "—",
            },
          ];
  const actions = (row) => (
    <div className="flex justify-end gap-2">
      {section === "orders" ? (
        <button
          className="admin-row-action"
          title="View order"
          onClick={async () => {
            const detail = await run(
              () => service.getOrder(row.id),
              "Order loaded.",
            );
            if (detail) setOrder(detail);
          }}
        >
          <Eye size={15} />
        </button>
      ) : null}
      {section === "transactions" ? (
        <button
          className="admin-row-action"
          title="View transaction"
          onClick={async () => {
            const detail = await run(
              () => service.getTransaction(row.id),
              "Transaction loaded.",
            );
            if (detail) setTransaction(detail);
          }}
        >
          <Eye size={15} />
        </button>
      ) : null}
      {section === "coupons" ? (
        <>
          <button className="admin-row-action" onClick={() => setCoupon(row)}>
            <Pencil size={15} />
          </button>
          <button
            className="admin-row-action admin-row-action--danger"
            onClick={() => {
              if (window.confirm(`Delete coupon ${row.code}?`))
                void run(() => service.deleteCoupon(row.id), "Coupon deleted.");
            }}
          >
            <Trash2 size={15} />
          </button>
        </>
      ) : null}
    </div>
  );
  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <Truck size={20} color="var(--color-accent)" />
            <h1>{names[section]}</h1>
          </div>
          <p className="routes-page__subtitle">
            Manage customer orders, payment records, and promotional coupons.
          </p>
        </header>
        <AdminDataTable
          columns={columns}
          data={items}
          isLoading={loading}
          pagination={pagination}
          search={search}
          searchPlaceholder={`Search ${names[section].toLowerCase()}`}
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          onPageChange={setPage}
          resultLabel={`Showing ${items.length} of ${pagination.total || 0} ${names[section].toLowerCase()}`}
          renderRowActions={actions}
          actions={
            <>
              <AdminTableButton onClick={load}>
                <RefreshCcw size={14} />
                Refresh
              </AdminTableButton>
              {section === "coupons" ? (
                <AdminTableButton variant="blue" onClick={() => setCoupon({})}>
                  <Plus size={14} />
                  New coupon
                </AdminTableButton>
              ) : null}
            </>
          }
          emptyMessage={`No ${names[section].toLowerCase()} found.`}
        />
      </div>
      {coupon ? (
        <CouponModal
          coupon={coupon.id ? coupon : null}
          onClose={() => setCoupon(null)}
          saving={saving}
          onSave={(values, id) =>
            run(
              () => service.saveCoupon(values, id),
              id ? "Coupon updated." : "Coupon created.",
            )
          }
        />
      ) : null}
      {order ? (
        <OrderInvoice order={order} onClose={() => setOrder(null)} />
      ) : null}
      {transaction ? (
        <TransactionDetailModal
          transaction={transaction}
          onClose={() => setTransaction(null)}
        />
      ) : null}
    </main>
  );
}
