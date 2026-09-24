import {
  Clock3,
  Expand,
  LayoutDashboard,
  Printer,
  ReceiptText,
  Settings2,
  Store,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../../constants/routes";

export default function PosHeader({
  time,
  onReports,
  onPreview,
  onPrint,
  onSettings,
}) {
  const fullscreen = () =>
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen?.();
  return (
    <header className="pos-header">
      <div className="pos-brand">
        <span className="pos-brand-mark">
          <Store size={25} />
        </span>
        <span>
          ECOVANI<small>POS</small>
        </span>
      </div>
      <div className="pos-clock">
        <Clock3 size={15} />
        {time}
      </div>
      <div className="pos-header-spacer" />
      <Link className="pos-dashboard" to={APP_ROUTES.commerce}>
        <LayoutDashboard size={14} /> Dashboard
      </Link>
      <span className="pos-store">
        <Store size={16} /> Main Store
      </span>
      <span className="pos-header-divider" />
      <button title="Today's reports" onClick={onReports}>
        <WalletCards size={17} />
      </button>
      <button title="Full screen" onClick={fullscreen}>
        <Expand size={17} />
      </button>
      <button title="Print preview" onClick={onPreview}>
        <ReceiptText size={17} />
      </button>
      <button title="Print last order" onClick={onPrint}>
        <Printer size={17} />
      </button>
      <button title="POS settings" onClick={onSettings}>
        <Settings2 size={17} />
      </button>
    </header>
  );
}
