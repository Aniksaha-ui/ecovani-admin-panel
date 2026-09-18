/* eslint-disable react-hooks/set-state-in-effect */
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

function DetailRow({ label, value }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--color-text-muted)]">
        {label}
      </span>
      <div className="break-words text-sm text-white">{value}</div>
    </div>
  );
}

export function MobileDisclosureCards({
  emptyMessage = "No records found.",
  items,
}) {
  const [openItemId, setOpenItemId] = useState(null);

  useEffect(() => {
    setOpenItemId(null);
  }, [items]);

  if (!items.length) {
    return (
      <div className="grid gap-3 md:hidden">
        <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-5 text-center text-sm font-medium text-[var(--color-text-muted)]">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:hidden">
      {items.map((item) => {
        const isOpen = openItemId === item.id;

        return (
          <article
            key={item.id}
            className="overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)]"
          >
            <button
              type="button"
              className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
              onClick={() => setOpenItemId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--color-text-muted)]">
                  {item.summaryLabel}
                </p>
                <div className="mt-2 break-words text-sm font-semibold text-white">
                  {item.summaryValue}
                </div>
                {item.secondaryValue ? (
                  <div className="mt-2 break-words text-xs text-[var(--color-text-secondary)]">
                    {item.secondaryValue}
                  </div>
                ) : null}
              </div>

              <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]">
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {isOpen ? (
              <div className="grid gap-3 border-t border-[var(--color-border)] px-4 py-4">
                {item.rows.map((row) => (
                  <DetailRow
                    key={`${item.id}-${row.label}`}
                    label={row.label}
                    value={row.value}
                  />
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
