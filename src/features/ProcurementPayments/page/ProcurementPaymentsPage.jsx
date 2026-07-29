import {
  BanknoteArrowDown,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminDataTable, {
  AdminTableButton,
} from "../../../components/ui/AdminDataTable";
import { useToast } from "../../../components/common/Toaster";
import {
  deleteProcurementPayment,
  listProcurementPayments,
  paymentOptions,
  saveProcurementPayment,
} from "../service/procurementPaymentsService";

const money = (value) => `৳${Number(value || 0).toLocaleString()}`;

function PaymentForm({ payment, options, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    procurement_id: payment?.procurement_id || "",
    company_account_id: payment?.company_account_id || "",
    amount: payment?.amount || "",
    payment_reference: payment?.payment_reference || "",
    paid_at: payment?.paid_at
      ? payment.paid_at.slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  }));
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (
      await onSave(
        {
          ...form,
          procurement_id: Number(form.procurement_id),
          company_account_id: Number(form.company_account_id),
          amount: Number(form.amount),
          paid_at: new Date(form.paid_at).toISOString(),
        },
        payment?.id,
      )
    )
      onClose();
  };
  return (
    <div className="admin-modal-backdrop">
      <form className="admin-modal admin-modal--wide" onSubmit={submit}>
        <header className="admin-modal__header">
          <div>
            <h2>
              {payment ? "Edit procurement payment" : "New procurement payment"}
            </h2>
            <p>Record a payment against a procurement and company account.</p>
          </div>
          <button className="admin-icon-button" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="admin-form-grid">
          <label className="admin-field">
            Procurement
            <select
              required
              value={form.procurement_id}
              onChange={(event) => set("procurement_id", event.target.value)}
            >
              <option value="">Select procurement</option>
              {(options.procurements || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.procurement_number}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Company account
            <select
              required
              value={form.company_account_id}
              onChange={(event) =>
                set("company_account_id", event.target.value)
              }
            >
              <option value="">Select account</option>
              {(options.accounts || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.account_name} · {money(item.amount)}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Amount
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={form.amount}
              onChange={(event) => set("amount", event.target.value)}
            />
          </label>
          <label className="admin-field">
            Payment reference
            <input
              required
              maxLength="100"
              value={form.payment_reference}
              onChange={(event) => set("payment_reference", event.target.value)}
            />
          </label>
          <label className="admin-field admin-field--full">
            Paid at
            <input
              required
              type="datetime-local"
              value={form.paid_at}
              onChange={(event) => set("paid_at", event.target.value)}
            />
          </label>
        </div>
        <footer className="admin-modal__actions">
          <button type="button" className="routes-control" onClick={onClose}>
            Cancel
          </button>
          <button
            className="routes-control routes-control--blue"
            disabled={saving}
          >
            {saving ? "Saving..." : payment ? "Save changes" : "Record payment"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function ProcurementPaymentsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState({});
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listProcurementPayments({ page, search });
      setItems(result.rows);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);
  useEffect(() => {
    void load();
    void paymentOptions()
      .then(setOptions)
      .catch((error) => toast.error(error.message));
  }, [load, toast]);
  const save = async (values, id) => {
    setSaving(true);
    try {
      const result = await saveProcurementPayment(values, id);
      toast.success(id ? "Payment updated." : "Payment recorded.");
      await load();
      return result;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setSaving(false);
    }
  };
  const remove = async (item) => {
    if (!window.confirm(`Delete payment ${item.payment_reference}?`)) return;
    try {
      await deleteProcurementPayment(item.id);
      toast.success("Payment deleted.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const columns = [
    {
      id: "procurement_number",
      label: "Procurement",
      accessor: "procurement_number",
    },
    {
      id: "account_name",
      label: "Account",
      render: (row) => (
        <div>
          <strong className="text-white">{row.account_name}</strong>
          <p className="mt-1 text-xs text-[#7d8ca5]">{row.account_number}</p>
        </div>
      ),
    },
    { id: "amount", label: "Amount", render: (row) => money(row.amount) },
    {
      id: "payment_reference",
      label: "Reference",
      accessor: "payment_reference",
    },
    {
      id: "paid_at",
      label: "Paid at",
      render: (row) => new Date(row.paid_at).toLocaleDateString(),
    },
  ];
  const actions = (row) => (
    <div className="flex justify-end gap-2">
      <button
        className="admin-row-action"
        onClick={() => {
          setEditing(row);
          setOpen(true);
        }}
      >
        <Pencil size={15} />
      </button>
      <button
        className="admin-row-action admin-row-action--danger"
        onClick={() => void remove(row)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <BanknoteArrowDown size={20} color="#4f83ff" />
            <h1>Procurement Payments</h1>
          </div>
          <p className="routes-page__subtitle">
            Manage payments made for procurement records.
          </p>
        </header>
        <AdminDataTable
          columns={columns}
          data={items}
          isLoading={loading}
          pagination={pagination}
          search={search}
          searchPlaceholder="Search payments"
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          onPageChange={setPage}
          resultLabel={`Showing ${items.length} of ${pagination.total || 0} payments`}
          renderRowActions={actions}
          actions={
            <>
              <AdminTableButton onClick={load}>
                <RefreshCcw size={14} />
                Refresh
              </AdminTableButton>
              <AdminTableButton
                variant="blue"
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus size={14} />
                New payment
              </AdminTableButton>
            </>
          }
          emptyMessage="No procurement payments found."
        />
      </div>
      {open ? (
        <PaymentForm
          payment={editing}
          options={options}
          saving={saving}
          onClose={() => setOpen(false)}
          onSave={save}
        />
      ) : null}
    </main>
  );
}
