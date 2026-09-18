import {
  ClipboardList,
  Download,
  Eye,
  PackageCheck,
  Plus,
  Printer,
  RefreshCcw,
} from "lucide-react";
import { useRef, useState } from "react";
import AdminDataTable, {
  AdminTableButton,
} from "../../../components/ui/AdminDataTable";
import { APP_ROUTES } from "../../../constants/routes";
import {
  AdjustmentDetailModal,
  RequisitionModal,
  ReceiveModal,
  StockModal,
} from "../component/OperationsModal";
import RequisitionDetailDrawer from "../component/RequisitionDetailDrawer";
import StatusBadge from "../../../components/ui/StatusBadge";
import { useAuthContext } from "../../../contexts/AuthContext";
import useOperations from "../hooks/useOperations";
import {
  acceptRequisition,
  adjustProductStock,
  createRequisition,
  getInventoryAdjustment,
  getProcurement,
  getRequisition,
  getReceipt,
  markProcurementOnHand,
  saveProductStock,
} from "../service/operationsService";

const names = {
  requisitions: "Requisitions",
  procurements: "Procurements",
  receipts: "Stock receipts",
  stocks: "Product stock",
  adjustments: "Inventory adjustments",
};
const routes = [
  ["requisitions", APP_ROUTES.requisitions],
  ["procurements", APP_ROUTES.procurements],
  ["receipts", APP_ROUTES.stockReceipts],
  ["stocks", APP_ROUTES.productStocks],
  ["adjustments", APP_ROUTES.inventoryAdjustments],
];
const badge = (value) => <StatusBadge value={value || "pending"} />;
const money = (value) =>
  `৳${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const columnsFor = (section) => {
  const serial = {
    id: "serial",
    label: "SL",
    accessor: "serial",
    width: "65px",
  };
  if (section === "requisitions")
    return [
      serial,
      {
        id: "requisition_number",
        label: "Requisition",
        render: (row) => (
          <div>
            <p className="font-semibold text-white">{row.requisition_number}</p>
            <p className="text-xs text-[var(--color-text-faint)]">
              {row.requested_by}
            </p>
          </div>
        ),
      },
      {
        id: "priority",
        label: "Priority",
        render: (row) => badge(row.priority),
      },
      {
        id: "department",
        label: "Department",
        render: (row) => row.department || "—",
      },
      { id: "items_count", label: "Items", accessor: "items_count" },
      {
        id: "total_amount",
        label: "Total",
        render: (row) => `৳${Number(row.total_amount || 0).toLocaleString()}`,
      },
      { id: "status", label: "Status", render: (row) => badge(row.status) },
    ];
  if (section === "procurements")
    return [
      serial,
      {
        id: "procurement_number",
        label: "Procurement",
        width: "210px",
        render: (row) => (
          <div>
            <p className="font-semibold text-white">{row.procurement_number}</p>
            <p className="text-xs text-[var(--color-text-faint)]">
              {row.requisition_number}
            </p>
          </div>
        ),
      },
      {
        id: "supplier_name",
        label: "Supplier",
        accessor: "supplier_name",
        width: "180px",
      },
      {
        id: "items_count",
        label: "Items",
        accessor: "items_count",
        width: "75px",
      },
      {
        id: "total_amount",
        label: "Total",
        width: "125px",
        render: (row) => `৳${Number(row.total_amount || 0).toLocaleString()}`,
      },
      {
        id: "status",
        label: "Status",
        render: (row) => badge(row.status),
        width: "110px",
      },
    ];
  if (section === "receipts")
    return [
      serial,
      {
        id: "procurement_number",
        label: "Procurement",
        accessor: "procurement_number",
      },
      {
        id: "product_name",
        label: "Product",
        render: (row) => (
          <div>
            <p className="font-semibold text-white">{row.product_name}</p>
            <p className="text-xs text-[var(--color-text-faint)]">
              {row.product_sku || "—"}
            </p>
          </div>
        ),
      },
      {
        id: "warehouse_location",
        label: "Warehouse",
        accessor: "warehouse_location",
      },
      {
        id: "quantity_received",
        label: "Received",
        accessor: "quantity_received",
      },
      { id: "stock_after", label: "Stock after", accessor: "stock_after" },
    ];
  if (section === "adjustments")
    return [
      serial,
      {
        id: "product_name",
        label: "Product",
        render: (row) => (
          <div>
            <p className="font-semibold text-white">{row.product_name}</p>
            <p className="text-xs text-[var(--color-text-faint)]">
              {row.sku || "—"}
            </p>
          </div>
        ),
      },
      {
        id: "warehouse_location",
        label: "Warehouse",
        accessor: "warehouse_location",
      },
      {
        id: "previous_quantity",
        label: "Before",
        accessor: "previous_quantity",
      },
      { id: "new_quantity", label: "After", accessor: "new_quantity" },
      {
        id: "adjustment_quantity",
        label: "Change",
        render: (row) => (
          <strong
            className={
              Number(row.adjustment_quantity) >= 0
                ? "text-emerald-300"
                : "text-rose-300"
            }
          >
            {Number(row.adjustment_quantity) > 0 ? "+" : ""}
            {row.adjustment_quantity}
          </strong>
        ),
      },
      { id: "reason", label: "Reason", render: (row) => row.reason || "—" },
      {
        id: "adjusted_by_name",
        label: "Adjusted by",
        render: (row) => (
          <div>
            <p>{row.adjusted_by_name || "System"}</p>
            <p className="text-xs text-[var(--color-text-faint)]">
              {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
            </p>
          </div>
        ),
      },
    ];
  return [
    serial,
    {
      id: "product_name",
      label: "Product",
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.product_name}</p>
          <p className="text-xs text-[var(--color-text-faint)]">
            {row.sku || "—"}
          </p>
        </div>
      ),
    },
    {
      id: "warehouse_location",
      label: "Warehouse",
      accessor: "warehouse_location",
    },
    {
      id: "stock_quantity",
      label: "Available",
      render: (row) => (
        <strong className="text-emerald-300">{row.stock_quantity}</strong>
      ),
    },
  ];
};

export default function OperationsPage({ section }) {
  const { auth } = useAuthContext();
  const [adjustmentDetail, setAdjustmentDetail] = useState(null);
  const [requisitionDetail, setRequisitionDetail] = useState(null);
  const api = useOperations(section);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [receiptDetail, setReceiptDetail] = useState(null);
  const receiptInvoiceRef = useRef(null);
  const [isReceiptExporting, setIsReceiptExporting] = useState(false);
  const onSaveRequisition = (data) =>
    api.run(() => createRequisition(data), "Requisition created.");
  const onHand = (data) =>
    api.run(
      () => markProcurementOnHand(selected.id, data),
      "Stock received, payment recorded, and procurement marked on hand.",
    );
  const onStock = (data) =>
    api.run(
      () =>
        selected
          ? adjustProductStock(selected.id, data)
          : saveProductStock(data),
      selected ? "Stock adjusted." : "Stock saved.",
    );
  const openRequisitionDetail = async (row) => {
    const detail = await api.run(
      () =>
        section === "procurements"
          ? getProcurement(row.id)
          : getRequisition(row.id),
      "Requisition details loaded.",
    );
    if (detail) setRequisitionDetail(detail);
  };
  const rowActions = (row) => (
    <div className="operations-row-actions">
      {section === "requisitions" || section === "procurements" ? (
        <button
          className="admin-row-action"
          title="View requisition details"
          onClick={() => void openRequisitionDetail(row)}
        >
          <Eye size={15} />
        </button>
      ) : null}
      {section === "requisitions" && row.status === "pending" ? (
        <button
          className="routes-control routes-control--blue"
          onClick={() =>
            void api.run(
              () => acceptRequisition(row.id),
              "Requisition accepted and procurement created.",
            )
          }
        >
          Accept
        </button>
      ) : null}
      {section === "procurements" && row.status !== "on_hand" ? (
        <button
          className="operations-receive-pay-button"
          onClick={() => {
            setSelected(row);
            setModal("onHand");
          }}
          title="Receive stock and record payment"
        >
          <PackageCheck size={16} />
          <span>Receive & pay</span>
        </button>
      ) : null}
      {section === "receipts" ? (
        <button
          className="admin-row-action"
          onClick={async () => {
            const detail = await api.run(
              () => getReceipt(row.id),
              "Receipt loaded.",
            );
            if (detail) setReceiptDetail(detail);
          }}
        >
          <Eye size={15} />
        </button>
      ) : null}
      {section === "adjustments" ? (
        <button
          className="admin-row-action"
          title="View adjustment details"
          onClick={async () => {
            const detail = await api.run(
              () => getInventoryAdjustment(row.id),
              "Inventory adjustment loaded.",
            );
            if (detail) setAdjustmentDetail(detail);
          }}
        >
          <Eye size={15} />
        </button>
      ) : null}
      {section === "stocks" ? (
        <button
          className="routes-control"
          onClick={() => {
            setSelected(row);
            setModal("stock");
          }}
        >
          Adjust
        </button>
      ) : null}
    </div>
  );
  const invoice = receiptDetail?.procurement;
  const lineTotal = (item) =>
    Number(item.quantity_received || 0) * Number(item.unit_cost || 0);
  const receivedValue =
    receiptDetail?.items?.reduce((total, item) => total + lineTotal(item), 0) ||
    0;
  const receivedUnits =
    receiptDetail?.items?.reduce(
      (total, item) => total + Number(item.quantity_received || 0),
      0,
    ) || 0;
  const formatDate = (value, withTime = false) =>
    value
      ? new Date(value).toLocaleString(
          undefined,
          withTime
            ? { dateStyle: "medium", timeStyle: "short" }
            : { dateStyle: "medium" },
        )
      : "—";
  const invoiceDetails = invoice
    ? [
        ["Requested by", invoice.requested_by],
        ["Department", invoice.department],
        ["Priority", invoice.priority],
        ["Required by", formatDate(invoice.required_by)],
        ["Requisition created", formatDate(invoice.requested_at, true)],
        ["Supplier reference", invoice.reference_no],
        ["Payment date", formatDate(invoice.paid_at, true)],
        ["Payment reference", invoice.payment_reference],
      ]
    : [];
  const exportReceiptPdf = async () => {
    if (!receiptInvoiceRef.current || !receiptDetail) return;
    setIsReceiptExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(receiptInvoiceRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        ignoreElements: (element) =>
          element.dataset.html2canvasIgnore === "true",
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 9;
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
      pdf.save(`ecovani-stock-receipt-${receiptDetail.receipt_id}.pdf`);
    } finally {
      setIsReceiptExporting(false);
    }
  };
  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <ClipboardList size={20} color="var(--color-accent)" />
            <h1>Operations · {names[section]}</h1>
          </div>
          <p className="routes-page__subtitle">
            Control requisition approval, procurement receiving, and warehouse
            inventory.
          </p>
        </header>
        <nav className="operations-tabs">
          {routes.map(([key, route]) => (
            <a
              key={key}
              className={section === key ? "is-active" : ""}
              href={route}
            >
              {names[key]}
            </a>
          ))}
        </nav>
        {api.error ? <p className="month-balance-alert">{api.error}</p> : null}
        <AdminDataTable
          columns={columnsFor(section)}
          data={api.items}
          isLoading={api.loading}
          pagination={api.pagination}
          search={api.search}
          searchPlaceholder={`Search ${names[section].toLowerCase()}`}
          onPageChange={api.setPage}
          onSearchChange={(value) => {
            api.setPage(1);
            api.setSearch(value);
          }}
          resultLabel={`Showing ${api.items.length} of ${api.pagination.total} ${names[section].toLowerCase()}`}
          renderRowActions={rowActions}
          rowActionsWidth={
            section === "procurements" || section === "requisitions"
              ? "220px"
              : "112px"
          }
          actions={
            <>
              <AdminTableButton
                onClick={() => api.refresh()}
                disabled={api.loading}
              >
                <RefreshCcw size={14} />
                Refresh
              </AdminTableButton>
              {section === "requisitions" ? (
                <AdminTableButton
                  variant="blue"
                  onClick={() => setModal("requisition")}
                >
                  <Plus size={14} />
                  New requisition
                </AdminTableButton>
              ) : null}
              {section === "stocks" ? (
                <AdminTableButton
                  variant="blue"
                  onClick={() => {
                    setSelected(null);
                    setModal("stock");
                  }}
                >
                  <Plus size={14} />
                  Add stock
                </AdminTableButton>
              ) : null}
            </>
          }
          emptyMessage={`No ${names[section].toLowerCase()} found.`}
        />
      </div>
      {modal === "requisition" ? (
        <RequisitionModal
          options={api.options}
          requestedBy={auth.user?.name}
          saving={api.saving}
          onClose={() => setModal(null)}
          onSave={onSaveRequisition}
        />
      ) : null}
      {modal === "onHand" ? (
        <ReceiveModal
          procurement={selected}
          accounts={api.options.company_accounts || []}
          onHand
          saving={api.saving}
          onClose={() => setModal(null)}
          onSave={onHand}
        />
      ) : null}
      {modal === "stock" ? (
        <StockModal
          record={selected}
          options={api.options}
          saving={api.saving}
          onClose={() => setModal(null)}
          onSave={onStock}
        />
      ) : null}
      <>
        {adjustmentDetail ? (
          <AdjustmentDetailModal
            adjustment={adjustmentDetail}
            onClose={() => setAdjustmentDetail(null)}
          />
        ) : null}
      </>
      {requisitionDetail ? (
        <RequisitionDetailDrawer
          record={requisitionDetail}
          onClose={() => setRequisitionDetail(null)}
        />
      ) : null}
      {receiptDetail ? (
        <div className="admin-modal-backdrop">
          <article
            ref={receiptInvoiceRef}
            className="admin-modal admin-modal--wide document-invoice legacy-invoice"
          >
            <header className="document-invoice__header">
              <div className="document-invoice__reference">
                <span>Receipt #</span>
                <strong>{receiptDetail.receipt_id}</strong>
                <small>
                  Received {formatDate(receiptDetail.received_at, true)}
                </small>
              </div>
              <div className="document-invoice__brand">
                <strong>ECOVANI</strong>
                <span>Procurement & inventory</span>
                <small>
                  Mirpur 11, Dhaka 1216, Bangladesh
                  <br />
                  support@ecovani.com
                </small>
              </div>
            </header>
            <section className="document-invoice__summary">
              <div>
                <span>Supplier</span>
                <strong>{invoice?.supplier_name || "Not specified"}</strong>
              </div>
              <div>
                <span>Procurement no.</span>
                <strong>{invoice?.procurement_number || "—"}</strong>
              </div>
              <div>
                <span>Requisition no.</span>
                <strong>{invoice?.requisition_number || "—"}</strong>
              </div>
              <div>
                <span>Receipt date</span>
                <strong>{formatDate(receiptDetail.received_at, true)}</strong>
              </div>
              <div>
                <span>Received by</span>
                <strong>
                  {invoice?.received_by_name ||
                    receiptDetail.received_by_name ||
                    "—"}
                </strong>
              </div>
              <div>
                <span>Status</span>
                <strong>
                  {String(invoice?.status || "on hand").replaceAll("_", " ")}
                </strong>
              </div>
            </section>
            <section className="document-invoice__details">
              <h3>Receipt details</h3>
              <div>
                {invoiceDetails.map(([label, value]) => (
                  <p key={label}>
                    <span>{label}</span>
                    <strong>{value || "—"}</strong>
                  </p>
                ))}
              </div>
            </section>
            <section className="document-invoice__items">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>SKU / warehouse</th>
                    <th>Quantity</th>
                    <th>Unit cost</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptDetail.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>
                        {item.product_sku || "—"} ·{" "}
                        {item.warehouse_location || "—"}
                      </td>
                      <td>{item.quantity_received}</td>
                      <td>{money(item.unit_cost)}</td>
                      <td>{money(lineTotal(item))}</td>
                    </tr>
                  ))}
                  {Array.from({
                    length: Math.max(
                      0,
                      14 - (receiptDetail.items?.length || 0),
                    ),
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
                  {invoice?.notes ||
                    "Stock receipt verified and recorded against the procurement."}
                </p>
                <small>
                  Approved by: {invoice?.approved_by_name || "—"} · Received by:{" "}
                  {invoice?.received_by_name ||
                    receiptDetail.received_by_name ||
                    "—"}
                </small>
              </div>
              <div className="document-invoice__totals">
                <p>
                  <span>Items received</span>
                  <strong>{receivedUnits}</strong>
                </p>
                <p>
                  <span>Subtotal</span>
                  <strong>{money(receivedValue)}</strong>
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
                  <strong>{money(receivedValue)}</strong>
                </p>
              </div>
            </footer>
            <div
              className="document-invoice__actions"
              data-html2canvas-ignore="true"
            >
              <button
                type="button"
                className="routes-control"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print
              </button>
              <button
                type="button"
                className="routes-control routes-control--blue"
                disabled={isReceiptExporting}
                onClick={exportReceiptPdf}
              >
                <Download size={14} />
                {isReceiptExporting ? "Preparing PDF…" : "Download PDF"}
              </button>
              <button
                type="button"
                className="routes-control"
                onClick={() => setReceiptDetail(null)}
              >
                Close
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </main>
  );
}
