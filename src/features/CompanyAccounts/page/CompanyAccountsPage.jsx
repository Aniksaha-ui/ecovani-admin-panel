/* eslint-disable react-hooks/set-state-in-effect */
import {
  History,
  Landmark,
  Eye,
  Pencil,
  Plus,
  Printer,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../constants/routes";
import AdminDataTable, {
  AdminTableButton,
} from "../../../components/ui/AdminDataTable";
import { useToast } from "../../../components/common/Toaster";
import {
  deleteCompanyAccount,
  getAccountHistoryOptions,
  getCompanyAccountSummary,
  listAccountHistory,
  listCompanyAccounts,
  saveCompanyAccount,
} from "../service/companyAccountsService";

const money = (value) =>
  `৳${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function AccountHistoryDetailModal({ entry, onClose }) {
  const isCredit = String(entry.transaction_type).toLowerCase() === "c";
  const date = entry.tran_date
    ? new Date(entry.tran_date).toLocaleString()
    : "—";
  return (
    <div className="admin-modal-backdrop">
      <article className="admin-modal admin-modal--wide document-invoice legacy-invoice account-history-invoice">
        <header className="document-invoice__header">
          <div className="document-invoice__reference">
            <span>History entry #</span>
            <strong>{entry.id}</strong>
            <small>Recorded {date}</small>
          </div>
          <div className="document-invoice__brand">
            <strong>ECOVANI</strong>
            <span>Company account activity record</span>
            <small>Finance &amp; account history</small>
          </div>
        </header>
        <section className="document-invoice__summary">
          <div>
            <span>Company account</span>
            <strong>{entry.com_account_no || "—"}</strong>
          </div>
          <div>
            <span>Transaction date</span>
            <strong>{date}</strong>
          </div>
          <div>
            <span>Reference</span>
            <strong>{entry.transaction_reference || "—"}</strong>
          </div>
          <div>
            <span>Gateway</span>
            <strong>{entry.getaway || "—"}</strong>
          </div>
          <div>
            <span>User account type</span>
            <strong>{entry.user_account_type || "—"}</strong>
          </div>
          <div>
            <span>User account no.</span>
            <strong>{entry.user_account_no || "—"}</strong>
          </div>
          <div className="document-invoice__summary-wide">
            <span>Purpose</span>
            <strong>{entry.purpose || "No purpose provided"}</strong>
          </div>
        </section>
        <section className="document-invoice__items">
          <table>
            <thead>
              <tr>
                <th>Entry</th>
                <th>Transaction type</th>
                <th>Recorded by</th>
                <th>IP address</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Account movement</td>
                <td>{isCredit ? "Credit" : "Debit"}</td>
                <td>{entry.user_name || entry.user_email || "System"}</td>
                <td>{entry.ip_address || "—"}</td>
                <td>{money(entry.amount)}</td>
              </tr>
              {Array.from({ length: 4 }).map((_, index) => (
                <tr className="document-invoice__blank-row" key={index}>
                  <td>&nbsp;</td><td></td><td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <footer className="document-invoice__footer">
          <div className="document-invoice__notes">
            <span>Notes</span>
            <p>
              {entry.user_name || "System"} recorded this {isCredit ? "credit" : "debit"} entry.
            </p>
            <small>Reference: {entry.transaction_reference || "—"}</small>
          </div>
          <div className="document-invoice__totals">
            <p><span>Credit</span><strong>{isCredit ? money(entry.amount) : money(0)}</strong></p>
            <p><span>Debit</span><strong>{isCredit ? money(0) : money(entry.amount)}</strong></p>
            <p className="document-invoice__grand-total"><span>Total amount</span><strong>{money(entry.amount)}</strong></p>
          </div>
        </footer>
        <div className="admin-modal__actions document-invoice__actions">
          <button className="routes-control" onClick={() => window.print()}>
            <Printer size={15} /> Print
          </button>
          <button className="routes-control" onClick={onClose}>Close</button>
        </div>
      </article>
    </div>
  );
}

function AccountForm({ account, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    account_name: account?.account_name || "",
    account_number: account?.account_number || "",
    amount: account?.amount || "",
    type: account?.type || "",
  }));
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    const saved = await onSave(
      { ...form, amount: Number(form.amount) },
      account?.id,
    );
    if (saved) onClose();
  };
  return (
    <div className="admin-modal-backdrop">
      <form className="admin-modal" onSubmit={submit}>
        <header className="admin-modal__header">
          <div>
            <h2>{account ? "Edit company account" : "New company account"}</h2>
            <p>Maintain accounts used for company payments and balances.</p>
          </div>
          <button
            type="button"
            className="admin-icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>
        <div className="admin-form-grid">
          <label className="admin-field admin-field--full">
            Account name
            <input
              required
              value={form.account_name}
              onChange={(event) => set("account_name", event.target.value)}
              placeholder="e.g. Main operating account"
            />
          </label>
          <label className="admin-field">
            Account number
            <input
              required
              value={form.account_number}
              onChange={(event) => set("account_number", event.target.value)}
            />
          </label>
          <label className="admin-field">
            Account type
            <input
              required
              value={form.type}
              onChange={(event) => set("type", event.target.value)}
              placeholder="e.g. bank, cash, mobile banking"
            />
          </label>
          <label className="admin-field admin-field--full">
            Current balance (৳)
            <input
              required
              min="0"
              step="0.01"
              type="number"
              value={form.amount}
              onChange={(event) => set("amount", event.target.value)}
            />
          </label>
        </div>
        <footer className="admin-modal__actions">
          <button className="routes-control" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="routes-control routes-control--blue"
            disabled={saving}
          >
            {saving ? "Saving..." : account ? "Save changes" : "Create account"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function CompanyAccountsPage() {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [historyItems, setHistoryItems] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({});
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [historyUserId, setHistoryUserId] = useState("");
  const [historyMonth, setHistoryMonth] = useState("");
  const [historyOptions, setHistoryOptions] = useState({ users: [] });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [summary, setSummary] = useState({});
  const [historyDetail, setHistoryDetail] = useState(null);
  const activeTab = location.pathname === APP_ROUTES.companyAccountHistory
    ? "history"
    : "accounts";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listCompanyAccounts({ page, search });
      setItems(result.rows);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);
  useEffect(() => {
    if (activeTab === "accounts") void load();
  }, [activeTab, load]);
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const result = await listAccountHistory({
        page: historyPage,
        search: historySearch,
        userId: historyUserId,
        month: historyMonth,
      });
      setHistoryItems(result.rows);
      setHistoryPagination(result.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyMonth, historyPage, historySearch, historyUserId, toast]);
  useEffect(() => {
    if (activeTab === "history") void loadHistory();
  }, [activeTab, loadHistory]);
  const loadSummary = useCallback(async () => {
    try {
      setSummary(
        await getCompanyAccountSummary({
          userId: activeTab === "history" ? historyUserId : "",
          month: activeTab === "history" ? historyMonth : "",
        }),
      );
    } catch (error) {
      toast.error(error.message);
    }
  }, [activeTab, historyMonth, historyUserId, toast]);
  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);
  useEffect(() => {
    getAccountHistoryOptions()
      .then(setHistoryOptions)
      .catch((error) => toast.error(error.message));
  }, [toast]);
  const save = async (values, id) => {
    setSaving(true);
    try {
      const result = await saveCompanyAccount(values, id);
      toast.success(
        id ? "Company account updated." : "Company account created.",
      );
      await load();
      return result;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setSaving(false);
    }
  };
  const remove = async (account) => {
    if (
      !window.confirm(
        `Delete “${account.account_name}”? Payment history may still reference this account.`,
      )
    )
      return;
    try {
      await deleteCompanyAccount(account.id);
      toast.success("Company account deleted.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const columns = [
    {
      id: "account_name",
      label: "Account",
      render: (row) => (
        <div>
          <strong className="text-white">{row.account_name}</strong>
          <p className="mt-1 text-xs text-[var(--color-text-faint)]">
            {row.account_number}
          </p>
        </div>
      ),
    },
    { id: "type", label: "Type", accessor: "type" },
    {
      id: "amount",
      label: "Balance",
      render: (row) => (
        <strong className="text-[#b9d0ff]">{money(row.amount)}</strong>
      ),
    },
    {
      id: "updated_at",
      label: "Updated",
      render: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—",
    },
  ];
  const actions = (row) => (
    <div className="flex justify-end gap-2">
      <button
        className="admin-row-action"
        title="Edit account"
        onClick={() => {
          setEditing(row);
          setFormOpen(true);
        }}
      >
        <Pencil size={15} />
      </button>
      <button
        className="admin-row-action admin-row-action--danger"
        title="Delete account"
        onClick={() => void remove(row)}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
  const historyColumns = [
    { id: "id", label: "ID", accessor: "id", width: "70px" },
    {
      id: "tran_date",
      label: "Date",
      render: (row) =>
        row.tran_date ? new Date(row.tran_date).toLocaleString() : "—",
      width: "18%",
    },
    {
      id: "transaction_reference",
      label: "Reference",
      render: (row) => (
        <div>
          <strong className="text-[var(--color-text-primary)]">
            {row.transaction_reference || "—"}
          </strong>
          <p className="mt-1 text-xs text-[var(--color-text-faint)]">
            {row.purpose || "No purpose provided"}
          </p>
        </div>
      ),
      width: "22%",
    },
    {
      id: "com_account_no",
      label: "Company account",
      render: (row) => row.com_account_no || "—",
      width: "18%",
    },
    {
      id: "user_account_type",
      label: "User account type",
      accessor: "user_account_type",
      width: "140px",
    },
    {
      id: "user_account_no",
      label: "User account no.",
      accessor: "user_account_no",
      width: "150px",
    },
    { id: "getaway", label: "Gateway", accessor: "getaway", width: "120px" },
    {
      id: "transaction_type",
      label: "Type",
      render: (row) => {
        const isCredit = String(row.transaction_type).toLowerCase() === "c";
        return (
          <span
            className={`account-history-type account-history-type--${isCredit ? "credit" : "debit"}`}
          >
            {isCredit ? "Credit" : "Debit"}
          </span>
        );
      },
      width: "11%",
    },
    {
      id: "amount",
      label: "Amount",
      render: (row) => (
        <strong className="text-[var(--color-text-primary)]">
          {money(row.amount)}
        </strong>
      ),
      width: "14%",
    },
    {
      id: "user_name",
      label: "Recorded by",
      render: (row) => row.user_name || row.user_email || "System",
      width: "17%",
    },
    { id: "ip_address", label: "IP address", accessor: "ip_address", width: "130px" },
  ];
  const historyActions = (row) => (
    <button
      className="admin-row-action"
      onClick={() => setHistoryDetail(row)}
      title="View history details"
      aria-label="View history details"
    >
      <Eye size={15} />
    </button>
  );
  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="routes-page__title">
                <Landmark size={20} color="var(--color-accent)" />
                <h1>Company Accounts</h1>
              </div>
              <p className="routes-page__subtitle">
                Manage account details and current balances used for company
                payments.
              </p>
            </div>
            <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text-secondary)]">
              <Landmark size={16} />
              {pagination.total || 0} accounts
            </div>
          </div>
        </header>
        <nav className="company-accounts-tabs" aria-label="Company accounts">
          <button
            className={activeTab === "accounts" ? "is-active" : ""}
            onClick={() => navigate(APP_ROUTES.companyAccounts)}
            type="button"
          >
            <Landmark size={15} /> Accounts
          </button>
          <button
            className={activeTab === "history" ? "is-active" : ""}
            onClick={() => navigate(APP_ROUTES.companyAccountHistory)}
            type="button"
          >
            <History size={15} /> Account history
          </button>
        </nav>
        <section className="account-summary" aria-label="Account totals">
          <div><span>Total balance</span><strong>{money(summary.total_balance)}</strong></div>
          <div><span>Total credit</span><strong>{money(summary.credits)}</strong></div>
          <div><span>Total debit</span><strong>{money(summary.debits)}</strong></div>
        </section>
        {activeTab === "accounts" ? (
          <AdminDataTable
            columns={columns}
            data={items}
            isLoading={loading}
            pagination={pagination}
            search={search}
            searchPlaceholder="Search company accounts"
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            onPageChange={setPage}
            resultLabel={`Showing ${items.length} of ${pagination.total || 0} accounts`}
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
                    setFormOpen(true);
                  }}
                >
                  <Plus size={14} />
                  New account
                </AdminTableButton>
              </>
            }
            emptyMessage="No company accounts found."
          />
        ) : (
          <AdminDataTable
            columns={historyColumns}
            data={historyItems}
            isLoading={historyLoading}
            pagination={historyPagination}
            search={historySearch}
            searchPlaceholder="Search references, accounts, or purposes"
            onSearchChange={(value) => {
              setHistoryPage(1);
              setHistorySearch(value);
            }}
            onPageChange={setHistoryPage}
            resultLabel={`Showing ${historyItems.length} of ${historyPagination.total || 0} history entries`}
            renderRowActions={historyActions}
            rowActionsWidth="64px"
            filters={
              <div className="account-history-filters">
                <select
                  aria-label="Filter history by user"
                  value={historyUserId}
                  onChange={(event) => {
                    setHistoryPage(1);
                    setHistoryUserId(event.target.value);
                  }}
                >
                  <option value="">All users</option>
                  {(historyOptions.users || []).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email || `User #${user.id}`}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Filter history by month"
                  type="month"
                  value={historyMonth}
                  onChange={(event) => {
                    setHistoryPage(1);
                    setHistoryMonth(event.target.value);
                  }}
                />
              </div>
            }
            actions={
              <AdminTableButton onClick={loadHistory}>
                <RefreshCcw size={14} />
                Refresh
              </AdminTableButton>
            }
            emptyMessage="No account history found."
          />
        )}
      </div>
      {formOpen ? (
        <AccountForm
          account={editing}
          saving={saving}
          onClose={() => setFormOpen(false)}
          onSave={save}
        />
      ) : null}
      {historyDetail ? (
        <AccountHistoryDetailModal
          entry={historyDetail}
          onClose={() => setHistoryDetail(null)}
        />
      ) : null}
    </main>
  );
}
