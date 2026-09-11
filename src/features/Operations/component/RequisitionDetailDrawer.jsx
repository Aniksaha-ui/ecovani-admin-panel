import { MessageSquare, Printer } from "lucide-react";
import CommonDrawer from "../../../components/ui/CommonDrawer";

const date = (value) => (value ? new Date(value).toLocaleDateString() : "—");
const dateTime = (value) => value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
const money = (value) => `৳${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const escapeHtml = (value) => String(value ?? "—").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

export default function RequisitionDetailDrawer({ record, onClose }) {
  const items = record.items || [];
  const total = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost || 0), 0);
  const units = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const details = [
    ["Requisition ID", record.id], ["Requisition number", record.requisition_number],
    ["Requested by", record.requested_by], ["Department", record.department],
    ["Priority", record.priority], ["Status", record.status],
    ["Required by", date(record.required_by)], ["Supplier", record.supplier_name],
    ["Supplier reference", record.reference_no], ["Accepted at", dateTime(record.accepted_at)],
    ["Accepted by", record.approved_by_name || record.accepted_by],
    ["Created at", dateTime(record.created_at)], ["Last updated", dateTime(record.updated_at)],
    ["Procurement number", record.procurement_number], ["Procurement status", record.procurement_status],
    ["Received by", record.received_by_name],
  ];
  const printInvoice = () => {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) return;
    const rows = items.map((item) => `<tr><td>${escapeHtml(item.product_name)}</td><td>${escapeHtml(item.sku)}</td><td>${item.quantity}</td><td>${item.quantity_received}</td><td>${money(item.unit_cost)}</td><td>${money(Number(item.quantity || 0) * Number(item.unit_cost || 0))}</td></tr>`).join("");
    const infoRows = details.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("");
    popup.document.write(`<!doctype html><html><head><title>${escapeHtml(record.requisition_number)} invoice</title><style>body{font:14px Arial;color:#172033;padding:32px}header{display:flex;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:18px}h1{margin:0;font-size:24px}small{color:#64748b}h2{margin-top:28px;font-size:16px}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{padding:10px;border:1px solid #cbd5e1;text-align:left}th{background:#eff6ff}tfoot td{font-weight:700}.info th{width:30%}</style></head><body><header><div><small>REQUISITION INVOICE</small><h1>${escapeHtml(record.requisition_number)}</h1><small>${escapeHtml(record.procurement_number || "No procurement created")}</small></div><div><strong>${escapeHtml(record.status)}</strong><br><small>${escapeHtml(dateTime(record.created_at))}</small></div></header><h2>Requisition information</h2><table class="info"><tbody>${infoRows}</tbody></table>${record.notes ? `<h2>Notes</h2><p>${escapeHtml(record.notes)}</p>` : ""}<h2>Requested items</h2><table><thead><tr><th>Product</th><th>SKU</th><th>Requested</th><th>Received</th><th>Unit cost</th><th>Line total</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="2">Total</td><td>${units}</td><td></td><td></td><td>${money(total)}</td></tr></tfoot></table></body></html>`);
    popup.document.close(); popup.focus(); window.setTimeout(() => popup.print(), 250);
  };
  const sendSms = () => { window.location.href = `sms:?&body=${encodeURIComponent(`Requisition ${record.requisition_number}: ${units} units, total ${money(total)}. Status: ${record.procurement_status || record.status}.`)}`; };
  return <CommonDrawer title="Requisition details" subtitle={`${record.requisition_number}${record.procurement_number ? ` · ${record.procurement_number}` : ""}`} onClose={onClose}>
    <article className="requisition-invoice">
      <header className="requisition-invoice__header"><div><span>REQUISITION INVOICE</span><h3>{record.requisition_number}</h3><p>{record.procurement_number || "Procurement not created yet"}</p></div><div className="requisition-invoice__actions"><button type="button" className="routes-control" onClick={printInvoice}><Printer size={14} /> Print</button><button type="button" className="routes-control routes-control--blue" onClick={sendSms}><MessageSquare size={14} /> SMS</button></div></header>
      <section className="requisition-detail-section"><h3>Requisition information</h3><div className="requisition-detail-table-wrap"><table className="requisition-detail-table"><tbody>{details.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value || "—"}</td></tr>)}</tbody></table></div></section>
      <section className="requisition-detail-section"><h3>Notes</h3><p className="requisition-detail-notes">{record.notes || "No notes provided."}</p></section>
      <section className="stock-history requisition-detail-items"><h3>Requested items</h3><div className="stock-history__table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>Requested</th><th>Received</th><th>Unit cost</th><th>Line total</th></tr></thead><tbody>{items.map((item) => <tr key={item.requisition_product_id}><td>{item.product_name}</td><td>{item.sku || "—"}</td><td>{item.quantity}</td><td>{item.quantity_received}</td><td>{money(item.unit_cost)}</td><td>{money(Number(item.quantity || 0) * Number(item.unit_cost || 0))}</td></tr>)}</tbody><tfoot><tr><td colSpan="2">Total</td><td>{units}</td><td></td><td></td><td>{money(total)}</td></tr></tfoot></table></div></section>
    </article>
  </CommonDrawer>;
}
