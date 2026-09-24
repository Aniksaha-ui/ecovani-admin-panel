import {
  Minus,
  Pencil,
  Plus,
  Printer,
  ShoppingCart,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import PaymentPicker from "./PaymentPicker";
import { money } from "../service/posService";

export default function OrderPanel({
  cart,
  customers,
  customerId,
  onCustomer,
  walkIn,
  onCustomerDialog,
  onQty,
  onRemove,
  onClear,
  values,
  onValues,
  totals,
  method,
  onMethod,
  split,
  onSplit,
  onPreview,
  onPlace,
  saving,
}) {
  return (
    <aside className="pos-order-panel">
      <div className="pos-order-scroll">
        <section className="pos-order-list">
          <div className="pos-order-title">
            <h2>Order List</h2>
            <span>New sale</span>
            <button title="Clear all" onClick={onClear}>
              <Trash2 size={16} />
            </button>
          </div>
          <div className="pos-customer">
            <h3>Customer Information</h3>
            <div className="pos-customer-select">
              <select
                value={customerId || ""}
                onChange={(e) => onCustomer(e.target.value)}
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.email}
                  </option>
                ))}
              </select>
              <button title="Walk-in details" onClick={onCustomerDialog}>
                <UserRoundPlus size={17} />
              </button>
            </div>
            {!customerId && (walkIn.name || walkIn.email || walkIn.phone) && (
              <p className="pos-customer-note">
                {walkIn.name || "Walk-in Customer"}
                {walkIn.phone ? ` · ${walkIn.phone}` : ""}
                {walkIn.email ? ` · ${walkIn.email}` : ""}
              </p>
            )}
          </div>
          <div className="pos-order-details">
            <div className="pos-section-heading">
              <h3>Order Details</h3>
              <span>
                Items : {cart.reduce((n, item) => n + item.quantity, 0)}
              </span>
              <button onClick={onClear}>Clear all</button>
            </div>
            <div className="pos-cart-head">
              <span>Item</span>
              <span>QTY</span>
              <span>Cost</span>
            </div>
            {cart.length ? (
              cart.map((item) => (
                <div className="pos-cart-row" key={item.id}>
                  <div className="pos-cart-name">
                    <button
                      title={`Remove ${item.name}`}
                      onClick={() => onRemove(item.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                    <span>{item.name}</span>
                  </div>
                  <div className="pos-qty">
                    <button
                      title="Decrease quantity"
                      onClick={() => onQty(item.id, -1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      title="Increase quantity"
                      onClick={() => onQty(item.id, 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <strong>{money(Number(item.price) * item.quantity)}</strong>
                </div>
              ))
            ) : (
              <div className="pos-cart-empty">
                <ShoppingCart size={22} />
                Select products to start an order.
              </div>
            )}
          </div>
          <div className="pos-discount-card">
            <div className="pos-discount-icon">%</div>
            <div>
              <strong>Discount facilities</strong>
              <p>Coupon or manual discount at checkout</p>
            </div>
            <Pencil size={15} />
          </div>
          <div className="pos-summary">
            <h3>Payment Summary</h3>
            <div className="pos-summary-fields">
              <label>
                Shipping <Pencil size={12} />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.shipping_amount}
                  onChange={(e) => onValues("shipping_amount", e.target.value)}
                />
              </label>
              <label>
                Tax <Pencil size={12} />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.tax_amount}
                  onChange={(e) => onValues("tax_amount", e.target.value)}
                />
              </label>
              <label>
                Coupon <Pencil size={12} />
                <input
                  type="text"
                  placeholder="Code"
                  value={values.coupon_code}
                  onChange={(e) => onValues("coupon_code", e.target.value)}
                />
              </label>
              <label className="pos-red">
                Discount <Pencil size={12} />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.discount_amount}
                  onChange={(e) => onValues("discount_amount", e.target.value)}
                />
              </label>
              <label>
                Roundoff{" "}
                <input
                  type="checkbox"
                  checked={values.roundoff}
                  onChange={(e) => onValues("roundoff", e.target.checked)}
                />
                <span>{values.roundoff ? money(totals.rounding) : "—"}</span>
              </label>
            </div>
            <div className="pos-summary-line">
              <span>Sub Total</span>
              <strong>{money(totals.subtotal)}</strong>
            </div>
            {totals.couponDiscount > 0 && (
              <div className="pos-summary-line pos-red">
                <span>Coupon discount</span>
                <strong>-{money(totals.couponDiscount)}</strong>
              </div>
            )}
            <div className="pos-summary-total">
              <span>Total Payable</span>
              <strong>{money(totals.total)}</strong>
            </div>
          </div>
        </section>
        <PaymentPicker
          method={method}
          onChange={onMethod}
          onSplit={onSplit}
          split={split}
        />
        <div className="pos-payment-reference">
          <label>
            Payment reference
            <input
              value={values.payment_reference}
              onChange={(e) => onValues("payment_reference", e.target.value)}
              placeholder="Optional, e.g. terminal slip number"
            />
          </label>
        </div>
        <div className="pos-place-actions">
          <button onClick={onPreview} disabled={!cart.length}>
            <Printer size={15} /> Print Preview
          </button>
          <button onClick={onPlace} disabled={!cart.length || saving}>
            <ShoppingCart size={15} />
            {saving ? "Placing..." : "Place Order"}
          </button>
        </div>
      </div>
    </aside>
  );
}
