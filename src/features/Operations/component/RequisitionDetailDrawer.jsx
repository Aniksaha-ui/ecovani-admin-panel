import { Download, MessageSquare, Printer } from "lucide-react";
import { useRef, useState } from "react";
import CommonDrawer from "../../../components/ui/CommonDrawer";

const date = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const dateTime = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";
const money = (value) =>
  `৳${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function RequisitionDetailDrawer({ record, onClose }) {
  const invoiceRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const items = record.items || [];
  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unit_cost || 0),
    0,
  );
  const units = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const details = [
    ["Requested by", record.requested_by],
    ["Department", record.department],
    ["Priority", record.priority],
    ["Requisition status", record.status],
    ["Required by", date(record.required_by)],
    ["Supplier", record.supplier_name],
    ["Supplier reference", record.reference_no],
    ["Accepted at", dateTime(record.accepted_at)],
    ["Accepted by", record.approved_by_name || record.accepted_by],
    ["Created at", dateTime(record.created_at)],
    ["Last updated", dateTime(record.updated_at)],
    ["Procurement number", record.procurement_number],
    ["Procurement status", record.procurement_status],
    ["Received by", record.received_by_name],
  ];

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
      pdf.save(
        `ecovani-requisition-${record.requisition_number || record.id}.pdf`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  const sendSms = () => {
    window.open(
      `sms:?&body=${encodeURIComponent(`Requisition ${record.requisition_number}: ${units} units, total ${money(total)}. Status: ${record.procurement_status || record.status}.`)}`,
      "_self",
    );
  };

  return (
    <CommonDrawer
      title="Requisition details"
      subtitle={`${record.requisition_number}${record.procurement_number ? ` · ${record.procurement_number}` : ""}`}
      onClose={onClose}
    >
      <article ref={invoiceRef} className="document-invoice legacy-invoice">
        <header className="document-invoice__header">
          <div className="document-invoice__reference">
            <span>Requisition #</span>
            <strong>{record.requisition_number || record.id}</strong>
            <small>Created {date(record.created_at)}</small>
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
            <span>Requested by</span>
            <strong>{record.requested_by || "—"}</strong>
          </div>
          <div>
            <span>Department</span>
            <strong>{record.department || "—"}</strong>
          </div>
          <div>
            <span>Supplier</span>
            <strong>{record.supplier_name || "Not assigned"}</strong>
          </div>
          <div>
            <span>Required by</span>
            <strong>{date(record.required_by)}</strong>
          </div>
          <div>
            <span>Procurement no.</span>
            <strong>{record.procurement_number || "Not created"}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>
              {String(
                record.procurement_status || record.status || "pending",
              ).replaceAll("_", " ")}
            </strong>
          </div>
        </section>
        <section className="document-invoice__details">
          <h3>Requisition details</h3>
          <div>
            {details.map(([label, value]) => (
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
                <th>SKU</th>
                <th>Requested</th>
                <th>Received</th>
                <th>Unit price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.requisition_product_id || item.id}>
                    <td>{item.product_name || "Product unavailable"}</td>
                    <td>{item.sku || "—"}</td>
                    <td>{item.quantity || 0}</td>
                    <td>{item.quantity_received || 0}</td>
                    <td>{money(item.unit_cost)}</td>
                    <td>
                      {money(
                        Number(item.quantity || 0) *
                          Number(item.unit_cost || 0),
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="document-invoice__empty">
                    No requisition items found.
                  </td>
                </tr>
              )}
              {Array.from({ length: Math.max(0, 14 - items.length) }).map(
                (_, index) => (
                  <tr
                    className="document-invoice__blank-row"
                    key={`blank-${index}`}
                  >
                    <td>&nbsp;</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </section>
        <footer className="document-invoice__footer">
          <div className="document-invoice__notes">
            <span>Notes</span>
            <p>{record.notes || "No additional notes provided."}</p>
            <small>
              Company policy: Please verify the received quantities before
              closing the procurement.
            </small>
          </div>
          <div className="document-invoice__totals">
            <p>
              <span>Items</span>
              <strong>{units}</strong>
            </p>
            <p>
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
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
              <strong>{money(total)}</strong>
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
            disabled={isExporting}
            onClick={exportPdf}
          >
            <Download size={14} />
            {isExporting ? "Preparing PDF…" : "Download PDF"}
          </button>
          <button type="button" className="routes-control" onClick={sendSms}>
            <MessageSquare size={14} /> SMS
          </button>
        </div>
      </article>
    </CommonDrawer>
  );
}
