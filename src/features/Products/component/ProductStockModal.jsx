import CommonDrawer from "../../../components/ui/CommonDrawer";

const formatDate = (value) => (value ? new Date(value).toLocaleString() : "—");
const quantity = (value) =>
  `${Number(value || 0) > 0 ? "+" : ""}${Number(value || 0).toLocaleString()}`;

export default function ProductStockModal({ product, onClose }) {
  const history = product?.stock_history || [];
  const stockByWarehouse = new Map(
    (product?.stock_breakdown || []).map((entry) => [
      entry.warehouse_location || "",
      entry.stock_quantity,
    ]),
  );
  return (
    <CommonDrawer
      title="Product stock details"
      subtitle={`${product.name}${product.sku ? ` · ${product.sku}` : ""}`}
      onClose={onClose}
    >
      <div className="product-stock-total">
        {Number(product.stock_quantity || 0).toLocaleString()} units total
      </div>
      <section className="stock-summary">
        <h3>Current warehouse stock</h3>
        <div className="stock-history__table-wrap">
          <table>
            <thead><tr><th>Warehouse</th><th>Stock quantity</th></tr></thead>
            <tbody>{(product.stock_breakdown || []).length ? product.stock_breakdown.map((entry) => <tr key={entry.id}><td>{entry.warehouse_location || "Unassigned warehouse"}</td><td>{Number(entry.stock_quantity || 0).toLocaleString()} units</td></tr>) : <tr><td colSpan="2" className="stock-history__empty">No stock records found.</td></tr>}</tbody>
          </table>
        </div>
      </section>
      <section className="stock-history">
        <h3>Stock history</h3>
        <div className="stock-history__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Req. no.</th>
                <th>Procurement no.</th>
                <th>Warehouse</th>
                <th>Date</th>
                <th>Quantity</th>
                <th>Stock after</th>
                <th>Current stock quantity</th>
                <th>By / reason</th>
              </tr>
            </thead>
            <tbody>
              {history.length ? (
                history.map((item) => (
                  <tr key={`${item.transaction_type}-${item.id}`}>
                    <td>{item.transaction_type}</td>
                    <td>{item.requisition_number || "—"}</td>
                    <td>{item.procurement_number || "—"}</td>
                    <td>{item.warehouse_location || "—"}</td>
                    <td>{formatDate(item.transaction_date)}</td>
                    <td
                      className={
                        Number(item.quantity_change) >= 0
                          ? "stock-history__positive"
                          : "stock-history__negative"
                      }
                    >
                      {quantity(item.quantity_change)}
                    </td>
                    <td>{Number(item.stock_after || 0).toLocaleString()}</td>
                    <td>
                      {Number(
                        stockByWarehouse.get(item.warehouse_location || "") ||
                          0,
                      ).toLocaleString()}
                    </td>
                    <td>
                      <strong>{item.performed_by || "System"}</strong>
                      {item.reason ? <small>{item.reason}</small> : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="stock-history__empty">
                    No receipt or adjustment history is available for this
                    product.
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
