import { CreditCard, X } from "lucide-react";

const value = (input) =>
  input === null || input === undefined || input === "" ? "—" : input;
const money = (amount, currency = "৳") =>
  `${currency === "BDT" ? "৳" : currency || "৳"}${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TransactionDetailModal({ transaction, onClose }) {
  const fields = [
    ["Transaction ID", transaction.id],
    ["Type", transaction.transaction_type],
    ["Status", transaction.status],
    ["Payment method", transaction.payment_method],
    ["Amount", money(transaction.amount, transaction.currency)],
    ["Store amount", money(transaction.store_amount, transaction.currency)],
    ["Currency", transaction.currency],
    ["Transaction date", transaction.tran_date],
    ["Gateway reference", transaction.bank_ssl_id],
    ["Bank approval ID", transaction.bank_approval_id],
    ["Card number", transaction.card_no],
    ["Settlement status", transaction.settlement_status],
    ["Risk title", transaction.risk_title],
    ["Discount percentage", transaction.discount_percentage],
    ["Discount remarks", transaction.discount_remarks],
    ["Gateway", transaction.method],
    [
      "Created at",
      transaction.created_at
        ? new Date(transaction.created_at).toLocaleString()
        : null,
    ],
  ];
  return (
    <div className="admin-modal-backdrop">
      <section className="admin-modal admin-modal--wide commerce-transaction-modal">
        <header className="admin-modal__header">
          <div>
            <h2>
              <CreditCard size={18} /> Transaction #{transaction.id}
            </h2>
            <p>Complete payment gateway and linked order record.</p>
          </div>
          <button
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close transaction details"
          >
            <X size={18} />
          </button>
        </header>
        <section className="commerce-transaction-table-wrap commerce-transaction-summary-table-wrap">
          <table className="commerce-transaction-table">
            <thead>
              <tr>
                <th colSpan="2">Customer details</th>
                <th colSpan="2">Order &amp; payment summary</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Customer</th>
                <td>{value(transaction.customer_name)}</td>
                <th scope="row">Order</th>
                <td>#{value(transaction.order_id)}</td>
              </tr>
              <tr>
                <th scope="row">Email</th>
                <td>{value(transaction.customer_email)}</td>
                <th scope="row">Order status</th>
                <td>{value(transaction.order_status)}</td>
              </tr>
              <tr>
                <th scope="row">Phone</th>
                <td>{value(transaction.customer_phone)}</td>
                <th scope="row">Order total</th>
                <td>
                  {money(transaction.order_total_amount, transaction.currency)}
                </td>
              </tr>
              <tr>
                <th scope="row">Transaction amount</th>
                <td>{money(transaction.amount, transaction.currency)}</td>
                <th scope="row">Payment status</th>
                <td>{value(transaction.status)}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="commerce-transaction-table-wrap">
          <table className="commerce-transaction-table">
            <thead>
              <tr>
                <th colSpan="2">Transaction details</th>
                <th colSpan="2">Gateway &amp; settlement details</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(
                { length: Math.ceil(fields.length / 2) },
                (_, index) => fields.slice(index * 2, index * 2 + 2),
              ).map(([leftField, rightField]) => (
                <tr key={leftField[0]}>
                  <th scope="row">{leftField[0]}</th>
                  <td>{value(leftField[1])}</td>
                  {rightField ? (
                    <>
                      <th scope="row">{rightField[0]}</th>
                      <td>{value(rightField[1])}</td>
                    </>
                  ) : (
                    <td colSpan="2" />
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <div className="admin-modal__actions">
          <button
            className="routes-control routes-control--blue"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
