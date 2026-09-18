import CommonDrawer from "../../../components/ui/CommonDrawer";

const money = (value) =>
  `৳${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value) => (value ? new Date(value).toLocaleDateString() : "—");

export default function ProductReportDrawer({ report, onClose }) {
  const summary = report.summary || {};
  const product = report.product || {};
  return (
    <CommonDrawer
      title="Product performance report"
      subtitle={`${product.name}${product.sku ? ` · ${product.sku}` : ""}`}
      onClose={onClose}
    >
      <div className="product-report-metrics">
        <div>
          <span>Total sold</span>
          <strong>
            {Number(summary.units_sold || 0).toLocaleString()} units
          </strong>
        </div>
        <div>
          <span>Sales revenue</span>
          <strong>{money(summary.sales_amount)}</strong>
        </div>
        <div>
          <span>Orders</span>
          <strong>{Number(summary.orders_count || 0).toLocaleString()}</strong>
        </div>
        <div>
          <span>Total profit</span>
          <strong
            className={
              Number(summary.profit) >= 0
                ? "product-report-metrics__profit"
                : "product-report-metrics__loss"
            }
          >
            {money(summary.profit)}
          </strong>
        </div>
      </div>
      <p className="product-report-note">
        Profit uses the weighted average cost from received requisition stock:{" "}
        {money(summary.average_unit_cost)} per unit · cost of sold goods:{" "}
        {money(summary.cost_of_sold)}.
      </p>
      <section className="stock-history">
        <h3>All product requisitions</h3>
        <div className="stock-history__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Req. no.</th>
                <th>Procurement no.</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Requested by</th>
                <th>Requested qty</th>
                <th>Received qty</th>
                <th>Unit cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(report.requisitions || []).length ? (
                report.requisitions.map((item, index) => (
                  <tr key={`${item.requisition_number}-${index}`}>
                    <td>{item.requisition_number}</td>
                    <td>{item.procurement_number || "—"}</td>
                    <td>{date(item.requisition_date)}</td>
                    <td>{item.supplier_name || "—"}</td>
                    <td>{item.requested_by || "—"}</td>
                    <td>{item.requested_quantity}</td>
                    <td>{item.quantity_received}</td>
                    <td>{money(item.unit_cost)}</td>
                    <td>
                      <span className="product-report-status">
                        {item.procurement_status || item.requisition_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="stock-history__empty">
                    No requisitions found for this product.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </CommonDrawer>
  );
}
