import { money, formatPosDate } from "../service/posService";

export default function PosReceipt({
  order,
  draft,
  totals,
  customerName,
  payments,
}) {
  const items = order?.items || draft || [];
  const subtotal = Number(order?.subtotal ?? totals?.subtotal ?? 0);
  const discount = Number(order?.discount_amount ?? totals?.discount ?? 0);
  const tax = Number(order?.tax_amount ?? totals?.tax ?? 0);
  const shipping = Number(order?.shipping_amount ?? totals?.shipping ?? 0);
  const total = Number(order?.total_amount ?? totals?.total ?? 0);
  const rows = order?.payments || payments || [];
  return (
    <article className="pos-receipt pos-print-area">
      <div className="pos-receipt-brand">
        ECOVANI <span>POS</span>
      </div>
      <p>Mirpur 11, Dhaka 1216, Bangladesh</p>
      <p>support@ecovani.com</p>
      <div className="pos-receipt-rule" />
      <h2>{order ? "SALES INVOICE" : "ORDER PREVIEW"}</h2>
      <div className="pos-receipt-meta">
        <span>Invoice</span>
        <strong>{order ? `#${order.id}` : "Draft"}</strong>
        <span>Date</span>
        <strong>
          {order?.created_at
            ? formatPosDate(order.created_at)
            : "Draft (not placed)"}
        </strong>
        <span>Customer</span>
        <strong>
          {order?.customer_name || customerName || "Walk-in Customer"}
        </strong>
        <span>Payment</span>
        <strong>{order?.payment_status || "Pending"}</strong>
      </div>
      <div className="pos-receipt-rule" />
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{money(Number(item.price) * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pos-receipt-rule" />
      <div className="pos-receipt-totals">
        <span>Subtotal</span>
        <strong>{money(subtotal)}</strong>
        <span>Discount</span>
        <strong>-{money(discount)}</strong>
        <span>Tax</span>
        <strong>{money(tax)}</strong>
        <span>Shipping</span>
        <strong>{money(shipping)}</strong>
        <span>Total</span>
        <strong>{money(total)}</strong>
      </div>
      {rows.length > 0 && (
        <div className="pos-receipt-payments">
          <b>Payments</b>
          {rows.map((row, index) => (
            <p key={row.id || index}>
              {row.kind === "refund" ? "Refund · " : ""}
              {String(row.method).replaceAll("_", " ")} ·{" "}
              {row.kind === "refund" ? "−" : ""}
              {money(row.amount)}
              {row.reference ? ` · ${row.reference}` : ""}
            </p>
          ))}
        </div>
      )}
      <div className="pos-receipt-rule" />
      <p className="pos-receipt-thanks">Thank you for shopping with Ecovani.</p>
    </article>
  );
}
