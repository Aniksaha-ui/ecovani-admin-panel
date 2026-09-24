/* eslint-disable react-refresh/only-export-components */
import {
  Banknote,
  CreditCard,
  Gift,
  HandCoins,
  Landmark,
  Receipt,
  ScanLine,
  Split,
  Wallet,
} from "lucide-react";
export const paymentMethods = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "points", label: "Points", icon: Gift },
  { id: "deposit", label: "Deposit", icon: Wallet },
  { id: "cheque", label: "Cheque", icon: Receipt },
  { id: "gift_card", label: "Gift Card", icon: Gift },
  { id: "scan", label: "Scan", icon: ScanLine },
  { id: "pay_later", label: "Pay Later", icon: HandCoins },
  { id: "external", label: "External", icon: Landmark },
  { id: "bank", label: "Bank", icon: Landmark },
  { id: "mobile", label: "Mobile", icon: Wallet },
];
export default function PaymentPicker({ method, onChange, onSplit, split }) {
  return (
    <section className="pos-payment-box">
      <h3>Select Payment</h3>
      <div className="pos-payment-grid">
        {paymentMethods.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={method === id && !split ? "active" : ""}
            onClick={() => onChange(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
        <button className={split ? "active" : ""} onClick={onSplit}>
          <Split size={17} />
          Split Bill
        </button>
      </div>
    </section>
  );
}
