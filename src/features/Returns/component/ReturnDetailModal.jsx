import {
  Boxes,
  CircleDollarSign,
  ClipboardList,
  History,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

const emptyValue = (value) =>
  value === null || value === undefined || value === "" ? "—" : value;

const money = (amount) =>
  amount === null || amount === undefined || amount === ""
    ? "—"
    : `৳${Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

const dateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const humanize = (value) =>
  emptyValue(value) === "—"
    ? "—"
    : String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

function DetailField({ label, value, wide = false }) {
  return (
    <p className={wide ? "returns-detail-field--wide" : undefined}>
      <span>{label}</span>
      <strong>{emptyValue(value)}</strong>
    </p>
  );
}

function DetailSection({ children, icon: Icon, title }) {
  return (
    <section className="returns-detail-section">
      <header>
        <Icon size={16} />
        <h3>{title}</h3>
      </header>
      <div className="returns-detail-grid">{children}</div>
    </section>
  );
}

function LoadingContent({ error }) {
  return (
    <div className={`returns-detail-state ${error ? "is-error" : ""}`}>
      {error ? (
        <>
          <strong>Details could not be loaded</strong>
          <p>{error}</p>
        </>
      ) : (
        <>
          <span className="returns-detail-spinner" aria-hidden="true" />
          <strong>Loading complete record…</strong>
          <p>
            Retrieving the order, customer, product, refund, and inventory
            audit.
          </p>
        </>
      )}
    </div>
  );
}

export default function ReturnDetailModal({
  detail,
  error,
  isLoading,
  onClose,
  type = "returns",
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const returnRecord = detail?.return;
  const refund = detail?.refund;
  const order = detail?.order;
  const product = detail?.product;
  const orderItems = detail?.order_items || [];
  const inventory = detail?.inventory || [];
  const restorations = detail?.stock_restorations || [];
  const quantity = orderItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );
  const lineTotal = orderItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0) * Number(item.price || 0),
    0,
  );
  const title =
    type === "refunds"
      ? `Refund ${refund?.refund_reference || (refund?.id ? `#${refund.id}` : "details")}`
      : `Return ${returnRecord?.id ? `#${returnRecord.id}` : "details"}`;
  const titleId = `return-detail-title-${refund?.id || returnRecord?.id || "loading"}`;

  return (
    <div
      className="admin-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article
        className="admin-modal admin-modal--wide returns-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="admin-modal__header returns-detail-header">
          <div>
            <span className="returns-detail-eyebrow">
              {type === "refunds"
                ? "Refund ledger record"
                : "Product return record"}
            </span>
            <h2 id={titleId}>
              {type === "refunds" ? (
                <ReceiptText size={19} />
              ) : (
                <PackageCheck size={19} />
              )}
              {title}
            </h2>
            <p>
              Complete linked order, customer, product, payment, and inventory
              information.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </header>

        {isLoading || error || !detail ? (
          <LoadingContent error={error} />
        ) : (
          <>
            <section className="returns-detail-summary">
              <div>
                <span>Return status</span>
                <strong
                  className={`returns-status returns-status--${returnRecord?.status || "unknown"}`}
                >
                  {humanize(returnRecord?.status)}
                </strong>
                <small>Return #{returnRecord?.id}</small>
              </div>
              <div>
                <span>Refund amount</span>
                <strong>
                  {money(refund?.amount ?? returnRecord?.refund_amount)}
                </strong>
                <small>
                  {refund ? humanize(refund.status) : "No refund record"}
                </small>
              </div>
              <div>
                <span>Order</span>
                <strong>#{order?.id || returnRecord?.order_id}</strong>
                <small>
                  {humanize(order?.status)} · {humanize(order?.payment_status)}
                </small>
              </div>
              <div>
                <span>Product</span>
                <strong>{emptyValue(product?.name)}</strong>
                <small>
                  {emptyValue(product?.sku)} · {quantity} unit
                  {quantity === 1 ? "" : "s"}
                </small>
              </div>
            </section>

            <div className="returns-detail-sections">
              <DetailSection icon={ClipboardList} title="Return information">
                <DetailField label="Return ID" value={`#${returnRecord.id}`} />
                <DetailField
                  label="Order ID"
                  value={`#${returnRecord.order_id}`}
                />
                <DetailField
                  label="Product ID"
                  value={`#${returnRecord.product_id}`}
                />
                <DetailField
                  label="Status"
                  value={humanize(returnRecord.status)}
                />
                <DetailField
                  label="Requested refund"
                  value={money(returnRecord.refund_amount)}
                />
                <DetailField
                  label="Requested at"
                  value={dateTime(returnRecord.created_at)}
                />
                <DetailField
                  label="Last updated"
                  value={dateTime(returnRecord.updated_at)}
                />
                <DetailField label="Reason" value={returnRecord.reason} wide />
              </DetailSection>

              <DetailSection icon={CircleDollarSign} title="Refund information">
                {refund ? (
                  <>
                    <DetailField label="Refund ID" value={`#${refund.id}`} />
                    <DetailField
                      label="Return ID"
                      value={`#${refund.return_id}`}
                    />
                    <DetailField
                      label="Customer ID"
                      value={`#${refund.user_id}`}
                    />
                    <DetailField label="Amount" value={money(refund.amount)} />
                    <DetailField
                      label="Status"
                      value={humanize(refund.status)}
                    />
                    <DetailField
                      label="Processed at"
                      value={dateTime(refund.processed_at)}
                    />
                    <DetailField
                      label="Created at"
                      value={dateTime(refund.created_at)}
                    />
                    <DetailField
                      label="Last updated"
                      value={dateTime(refund.updated_at)}
                    />
                    <DetailField
                      label="Refund reference"
                      value={refund.refund_reference}
                      wide
                    />
                  </>
                ) : (
                  <div className="returns-detail-empty returns-detail-field--wide">
                    No refund has been recorded for this return.
                  </div>
                )}
              </DetailSection>

              <DetailSection icon={ShoppingBag} title="Order and payment">
                <DetailField label="Order ID" value={`#${order?.id}`} />
                <DetailField
                  label="Order status"
                  value={humanize(order?.status)}
                />
                <DetailField
                  label="Payment status"
                  value={humanize(order?.payment_status)}
                />
                <DetailField
                  label="Order total"
                  value={money(order?.total_amount)}
                />
                <DetailField
                  label="Address ID"
                  value={order?.address_id ? `#${order.address_id}` : "—"}
                />
                <DetailField
                  label="Placed at"
                  value={dateTime(order?.created_at)}
                />
                <DetailField
                  label="Last updated"
                  value={dateTime(order?.updated_at)}
                />
                <DetailField
                  label="Transaction reference"
                  value={order?.tran_id}
                  wide
                />
              </DetailSection>

              <DetailSection icon={UserRound} title="Customer and delivery">
                <DetailField
                  label="Customer ID"
                  value={order?.user_id ? `#${order.user_id}` : "—"}
                />
                <DetailField
                  label="Customer name"
                  value={order?.customer_name}
                />
                <DetailField
                  label="Customer email"
                  value={order?.customer_email}
                />
                <DetailField
                  label="Customer phone"
                  value={order?.customer_phone}
                />
                <DetailField
                  label="Delivery phone"
                  value={order?.address_phone}
                />
                <DetailField label="City" value={order?.address_city} />
                <DetailField
                  label="State / area"
                  value={order?.address_state}
                />
                <DetailField label="Postal code" value={order?.postal_code} />
                <DetailField label="Country" value={order?.address_country} />
                <DetailField
                  label="Delivery address"
                  value={[order?.address_line1, order?.address_line2]
                    .filter(Boolean)
                    .join(", ")}
                  wide
                />
              </DetailSection>

              <DetailSection icon={Boxes} title="Product and ordered item">
                <DetailField label="Product ID" value={`#${product?.id}`} />
                <DetailField label="Product name" value={product?.name} />
                <DetailField label="SKU" value={product?.sku} />
                <DetailField
                  label="Catalog price"
                  value={money(product?.price)}
                />
                <DetailField label="Ordered quantity" value={quantity} />
                <DetailField
                  label="Unit price"
                  value={money(orderItems.length ? orderItems[0].price : null)}
                />
                <DetailField label="Line total" value={money(lineTotal)} />
                <DetailField
                  label="Active product"
                  value={Number(product?.is_active) ? "Yes" : "No"}
                />
                <DetailField
                  label="Product created"
                  value={dateTime(product?.created_at)}
                />
                <DetailField
                  label="Product updated"
                  value={dateTime(product?.updated_at)}
                />
                <DetailField
                  label="Description"
                  value={product?.description}
                  wide
                />
                <DetailField
                  label="Order item IDs"
                  value={orderItems.map((item) => `#${item.id}`).join(", ")}
                  wide
                />
              </DetailSection>

              <DetailSection icon={History} title="Inventory restoration audit">
                {inventory.length ? (
                  inventory.map((stock) => (
                    <div className="returns-inventory-card" key={stock.id}>
                      <span>{emptyValue(stock.warehouse_location)}</span>
                      <strong>
                        {Number(stock.stock_quantity || 0).toLocaleString()}{" "}
                        units
                      </strong>
                      <small>Inventory #{stock.id}</small>
                    </div>
                  ))
                ) : (
                  <div className="returns-detail-empty returns-detail-field--wide">
                    No inventory row is linked to this product.
                  </div>
                )}
                {restorations.length ? (
                  restorations.map((restoration, index) => (
                    <div
                      className="returns-restoration-card returns-detail-field--wide"
                      key={
                        restoration.id || `${restoration.inventory_id}-${index}`
                      }
                    >
                      <div>
                        <span>Restored quantity</span>
                        <strong>
                          +{Number(restoration.adjustment_quantity || 0)} units
                        </strong>
                      </div>
                      <div>
                        <span>Warehouse</span>
                        <strong>
                          {emptyValue(restoration.warehouse_location)}
                        </strong>
                      </div>
                      <div>
                        <span>Stock movement</span>
                        <strong>
                          {emptyValue(restoration.previous_quantity)} →{" "}
                          {emptyValue(restoration.new_quantity)}
                        </strong>
                      </div>
                      <div>
                        <span>Restored by</span>
                        <strong>
                          {emptyValue(restoration.adjusted_by_name || "System")}
                        </strong>
                      </div>
                      <p>{emptyValue(restoration.reason)}</p>
                      <small>
                        {humanize(restoration.source)} ·{" "}
                        {dateTime(restoration.created_at)}
                      </small>
                    </div>
                  ))
                ) : (
                  <div className="returns-detail-empty returns-detail-field--wide">
                    No stock restoration was required or recorded for this
                    return.
                  </div>
                )}
              </DetailSection>
            </div>
          </>
        )}

        <div className="admin-modal__actions">
          <button
            type="button"
            className="routes-control routes-control--blue"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </article>
    </div>
  );
}
