import { money, formatPosDate } from "../service/posService";

export default function TodayTransactions({ transactions = [] }) {
  return (
    <>
      <h3 className="pos-dialog-subheading">Today's transaction history</h3>
      <div className="pos-report-list">
        {transactions.map((item) => (
          <div className="pos-transaction-row" key={item.id}>
            <strong>#{item.order_id}</strong>
            <span>
              {item.customer_name}
              <small>
                {item.transaction_type} · {item.payment_method} ·{" "}
                {item.bank_ssl_id || "No reference"}
              </small>
            </span>
            <span>
              {formatPosDate(item.created_at, {
                year: undefined,
                month: undefined,
                day: undefined,
              })}
            </span>
            <b className={item.transaction_type === "refund" ? "pos-red" : ""}>
              {item.transaction_type === "refund" ? "−" : ""}
              {money(item.amount)}
            </b>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="pos-empty">No payments or refunds today.</div>
        )}
      </div>
    </>
  );
}
