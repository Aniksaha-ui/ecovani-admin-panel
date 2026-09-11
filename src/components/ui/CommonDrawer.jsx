import { X } from "lucide-react";

export default function CommonDrawer({ title, subtitle, children, onClose }) {
  return (
    <div className="common-drawer" role="presentation">
      <button
        className="common-drawer__backdrop"
        onClick={onClose}
        aria-label="Close drawer"
      />
      <aside
        className="common-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="common-drawer__header">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>
        <div className="common-drawer__body">{children}</div>
      </aside>
    </div>
  );
}
