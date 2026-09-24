import {
  Ban,
  Bookmark,
  History,
  RotateCcw,
  ShoppingCart,
  Wallet,
  Pause,
  Printer,
  TrendingUp,
} from "lucide-react";
export default function PosToolbar({
  onHold,
  onHolds,
  onVoid,
  onPayment,
  onOrders,
  onReset,
  onTransactions,
  onProfit,
  onPrint,
  disabled,
}) {
  return (
    <footer className="pos-toolbar">
      <button className="hold" disabled={disabled} onClick={onHold}>
        <Pause size={14} /> Hold
      </button>
      <button className="held" onClick={onHolds}>
        <Bookmark size={14} /> Held
      </button>
      <button className="void" disabled={disabled} onClick={onVoid}>
        <Ban size={14} /> Void
      </button>
      <button className="payment" disabled={disabled} onClick={onPayment}>
        <Wallet size={14} /> Payment
      </button>
      <button className="orders" onClick={onOrders}>
        <ShoppingCart size={14} /> View Orders
      </button>
      <button className="reset" onClick={onReset}>
        <RotateCcw size={14} /> Reset
      </button>
      <button className="transaction" onClick={onTransactions}>
        <History size={14} /> Transaction
      </button>
      <button className="profit" onClick={onProfit}>
        <TrendingUp size={14} /> Profit
      </button>
      <button className="print" onClick={onPrint}>
        <Printer size={14} /> Last Order
      </button>
    </footer>
  );
}
