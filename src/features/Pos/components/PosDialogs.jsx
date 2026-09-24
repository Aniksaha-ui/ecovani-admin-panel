import { Plus, Trash2, X } from "lucide-react";
import { money, formatPosDate } from "../service/posService";
import TodayTransactions from "./TodayTransactions";
import { paymentMethods } from "./PaymentPicker";
import PosReceipt from "./PosReceipt";

export function PosModal({ title, onClose, children, wide = false }) {
  return (
    <div
      className="pos-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`pos-modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="pos-modal-head">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
        <div className="pos-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function CustomerDialog({ value, onChange, onClose }) {
  return (
    <PosModal title="Walk-in customer" onClose={onClose}>
      <p className="pos-modal-help">
        Customer details appear on the invoice. They are optional for walk-in
        sales.
      </p>
      <label className="pos-field">
        Name
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Walk-in Customer"
        />
      </label>
      <label className="pos-field">
        Phone
        <input
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          placeholder="Phone number"
        />
      </label>
      <button className="pos-primary-wide" onClick={onClose}>
        Apply customer details
      </button>
    </PosModal>
  );
}

export function SplitDialog({ total, rows, onChange, onClose }) {
  const used = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const update = (index, field, value) =>
    onChange(
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  return (
    <PosModal title="Split payment" onClose={onClose}>
      <p className="pos-modal-help">
        Add each payment amount. The combined amount must equal {money(total)}.
      </p>
      <div className="pos-split-rows">
        {rows.map((row, index) => (
          <div className="pos-split-row" key={index}>
            <select
              value={row.method}
              onChange={(e) => update(index, "method", e.target.value)}
            >
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={row.amount}
              onChange={(e) => update(index, "amount", e.target.value)}
              placeholder="Amount"
            />
            <input
              value={row.reference || ""}
              onChange={(e) => update(index, "reference", e.target.value)}
              placeholder="Reference"
            />
            <button
              title="Remove payment"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
      <button
        className="pos-soft-button"
        onClick={() =>
          onChange([
            ...rows,
            {
              method: "card",
              amount: Math.max(0, Math.round((total - used) * 100) / 100),
              reference: "",
            },
          ])
        }
      >
        <Plus size={15} /> Add payment
      </button>
      <div className="pos-split-total">
        <span>Assigned</span>
        <strong>{money(used)}</strong>
        <span>Remaining</span>
        <strong className={Math.abs(total - used) > 0.009 ? "pos-red" : ""}>
          {money(total - used)}
        </strong>
      </div>
      <button
        className="pos-primary-wide"
        disabled={!rows.length || Math.abs(total - used) > 0.009}
        onClick={onClose}
      >
        Use split payment
      </button>
    </PosModal>
  );
}

export function OrdersDialog({
  orders,
  selected,
  onSelect,
  search,
  onSearch,
  onClose,
  onReturn,
  onPrint,
  onCollect,
}) {
  return (
    <PosModal title="POS orders" onClose={onClose} wide>
      <div className="pos-orders-dialog">
        <div className="pos-order-browser">
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by order ID or customer"
          />
          {orders.map((order) => (
            <button
              key={order.order_id}
              className={selected?.id === order.order_id ? "active" : ""}
              onClick={() => onSelect(order.order_id)}
            >
              <strong>#{order.order_id}</strong>
              <span>{order.customer_name}</span>
              <small>{formatPosDate(order.created_at)}</small>
              <b>{money(order.total_amount)}</b>
            </button>
          ))}
          {orders.length === 0 && (
            <p className="pos-modal-help">No POS orders found.</p>
          )}
        </div>
        <div className="pos-order-detail">
          {selected ? (
            <>
              <div className="pos-detail-stats">
                <span>
                  Status: <b>{selected.status}</b>
                </span>
                <span>
                  Payment: <b>{selected.payment_status}</b>
                </span>
              </div>
              <table className="pos-detail-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{money(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="pos-order-detail-total">
                Total: {money(selected.total_amount)}
              </p>
              <div className="pos-modal-actions">
                <button onClick={() => onPrint(selected)}>
                  Invoice / Print
                </button>
                <button
                  disabled={
                    Number(selected.total_amount) -
                      Number(selected.returned_amount || 0) -
                      (selected.payments || [])
                        .filter(
                          (item) =>
                            item.kind === "payment" &&
                            item.method !== "pay_later",
                        )
                        .reduce((sum, item) => sum + Number(item.amount), 0) <
                    0.01
                  }
                  onClick={() => onCollect(selected)}
                >
                  Collect balance
                </button>
                <button className="danger" onClick={() => onReturn(selected)}>
                  Return items
                </button>
              </div>
            </>
          ) : (
            <div className="pos-empty">
              Choose an order to view its details.
            </div>
          )}
        </div>
      </div>
    </PosModal>
  );
}

export function HoldsDialog({ holds, onResume, onDelete, onClose }) {
  return (
    <PosModal title="Held transactions" onClose={onClose}>
      <p className="pos-modal-help">
        Held carts do not reserve stock. Product prices and stock are checked
        again at checkout.
      </p>
      {holds.length ? (
        <div className="pos-hold-list">
          {holds.map((hold) => (
            <div key={hold.id}>
              <div>
                <b>{hold.reference}</b>
                <span>
                  {hold.cart_data?.items?.length || 0} products ·{" "}
                  {formatPosDate(hold.created_at)}
                </span>
              </div>
              <button onClick={() => onResume(hold)}>Resume</button>
              <button
                className="danger"
                onClick={() => onDelete(hold.id)}
                title="Delete hold"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="pos-empty">No held transactions.</div>
      )}
    </PosModal>
  );
}

export function ReportDialog({ report, profit, onClose, onSelect }) {
  return (
    <PosModal
      title={profit ? "Today's profit report" : "Today's sales & transactions"}
      onClose={onClose}
      wide
    >
      <div className="pos-report-cards">
        <div>
          <span>Orders</span>
          <strong>{report.count || 0}</strong>
        </div>
        <div>
          <span>Gross sales</span>
          <strong>{money(report.gross_sales)}</strong>
        </div>
        <div>
          <span>Returns</span>
          <strong>{money(report.refunds)}</strong>
        </div>
        <div>
          <span>Net sales</span>
          <strong>{money(report.net_sales)}</strong>
        </div>
        <div>
          <span>Estimated cost</span>
          <strong>{money(report.estimated_cost)}</strong>
        </div>
        <div>
          <span>Estimated profit</span>
          <strong>{money(report.estimated_profit)}</strong>
        </div>
      </div>
      {profit && (
        <p className="pos-modal-help">
          Profit uses weighted average receipt cost captured when each sale is
          placed. Products without receipt cost are estimated at zero cost.
        </p>
      )}
      <h3 className="pos-dialog-subheading">Today's orders</h3>
      <div className="pos-report-list">
        {(report.orders || []).map((order) => (
          <button key={order.order_id} onClick={() => onSelect(order.order_id)}>
            <strong>#{order.order_id}</strong>
            <span>{order.customer_name}</span>
            <span>
              {formatPosDate(order.created_at, {
                year: undefined,
                month: undefined,
                day: undefined,
              })}
            </span>
            <b>
              {money(
                Number(order.total_amount) - Number(order.returned_amount),
              )}
            </b>
          </button>
        ))}
        {!report.orders?.length && (
          <div className="pos-empty">No sales today.</div>
        )}
      </div>
      <TodayTransactions transactions={report.transactions || []} />
    </PosModal>
  );
}

export function PreviewDialog({
  order,
  draft,
  totals,
  customerName,
  payments,
  onClose,
}) {
  return (
    <PosModal
      title={order ? `Invoice #${order.id}` : "Print preview"}
      onClose={onClose}
    >
      <PosReceipt
        order={order}
        draft={draft}
        totals={totals}
        customerName={customerName}
        payments={payments}
      />
      <button
        className="pos-primary-wide pos-print-button"
        onClick={() => window.print()}
      >
        Print invoice
      </button>
    </PosModal>
  );
}

export function ReturnDialog({
  order,
  lines,
  onLines,
  method,
  onMethod,
  reference,
  onReference,
  reason,
  onReason,
  onSubmit,
  onClose,
  saving,
}) {
  const returned = (productId) =>
    (order.returns || [])
      .filter(
        (item) =>
          item.product_id === productId &&
          ["approved", "refunded"].includes(item.status),
      )
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  return (
    <PosModal title={`Return items from order #${order.id}`} onClose={onClose}>
      <p className="pos-modal-help">
        Enter the quantities being returned. Inventory and refund records update
        when you confirm.
      </p>
      {order.items.map((item) => {
        const available = item.quantity - returned(item.product_id);
        return (
          <label className="pos-return-row" key={item.id}>
            <span>
              {item.name}
              <small>
                {available} available · {money(item.price)} each
              </small>
            </span>
            <input
              type="number"
              min="0"
              max={available}
              value={lines[item.id] || 0}
              onChange={(e) => onLines({ ...lines, [item.id]: e.target.value })}
            />
          </label>
        );
      })}
      <label className="pos-field">
        Reason
        <input
          required
          value={reason}
          onChange={(e) => onReason(e.target.value)}
          placeholder="Reason for return"
        />
      </label>
      <label className="pos-field">
        Refund method
        <select value={method} onChange={(e) => onMethod(e.target.value)}>
          {paymentMethods
            .filter((item) => item.id !== "pay_later")
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
        </select>
      </label>
      <label className="pos-field">
        Refund reference
        <input
          value={reference}
          onChange={(e) => onReference(e.target.value)}
          placeholder="Optional"
        />
      </label>
      <button
        className="pos-primary-wide"
        disabled={
          saving || !reason.trim() || !Object.values(lines).some(Number)
        }
        onClick={onSubmit}
      >
        {saving ? "Processing..." : "Confirm return & refund"}
      </button>
    </PosModal>
  );
}

export function CollectDialog({
  order,
  method,
  onMethod,
  amount,
  onAmount,
  reference,
  onReference,
  onSubmit,
  onClose,
  saving,
}) {
  const paid = (order.payments || [])
    .filter((item) => item.kind === "payment" && item.method !== "pay_later")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const due = Math.max(
    0,
    Number(order.total_amount) - Number(order.returned_amount || 0) - paid,
  );
  return (
    <PosModal title={`Collect balance for #${order.id}`} onClose={onClose}>
      <p className="pos-modal-help">
        Outstanding balance: <strong>{money(due)}</strong>
      </p>
      <label className="pos-field">
        Payment method
        <select value={method} onChange={(e) => onMethod(e.target.value)}>
          {paymentMethods
            .filter((item) => item.id !== "pay_later")
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
        </select>
      </label>
      <label className="pos-field">
        Amount
        <input
          type="number"
          min="0.01"
          max={due}
          step="0.01"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
        />
      </label>
      <label className="pos-field">
        Reference
        <input
          value={reference}
          onChange={(e) => onReference(e.target.value)}
          placeholder="Optional"
        />
      </label>
      <button
        className="pos-primary-wide"
        disabled={saving || Number(amount) <= 0 || Number(amount) > due}
        onClick={onSubmit}
      >
        {saving ? "Recording..." : "Record payment"}
      </button>
    </PosModal>
  );
}

export function SettingsDialog({ values, onValues, onClose }) {
  return (
    <PosModal title="POS settings" onClose={onClose}>
      <p className="pos-modal-help">
        These amounts apply to the current transaction.
      </p>
      <label className="pos-field">
        Default tax
        <input
          type="number"
          min="0"
          step="0.01"
          value={values.tax_amount}
          onChange={(e) => onValues("tax_amount", e.target.value)}
        />
      </label>
      <label className="pos-field">
        Default shipping
        <input
          type="number"
          min="0"
          step="0.01"
          value={values.shipping_amount}
          onChange={(e) => onValues("shipping_amount", e.target.value)}
        />
      </label>
      <label className="pos-field">
        <input
          type="checkbox"
          checked={values.roundoff}
          onChange={(e) => onValues("roundoff", e.target.checked)}
        />{" "}
        Round total to nearest taka
      </label>
      <button className="pos-primary-wide" onClick={onClose}>
        Apply settings
      </button>
    </PosModal>
  );
}
