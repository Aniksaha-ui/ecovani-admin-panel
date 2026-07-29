/* eslint-disable react-hooks/set-state-in-effect */
import { Eye, RefreshCcw, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../../components/common/Toaster";
import AdminDataTable, {
  AdminTableButton,
} from "../../../components/ui/AdminDataTable";
import ReturnDetailModal from "../component/ReturnDetailModal";
import {
  getRefundDetails,
  getReturnDetails,
  listRefunds,
  listReturns,
  updateReturn,
} from "../service/returnsService";

const money = (amount) =>
  amount === null || amount === undefined || amount === ""
    ? "—"
    : `৳${Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const badge = (status) => (
  <span className={`returns-status returns-status--${status || "unknown"}`}>
    {String(status || "unknown").replaceAll("_", " ")}
  </span>
);

export default function ReturnsPage({ tab = "returns" }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    isLoading: false,
    data: null,
    error: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await (tab === "refunds" ? listRefunds : listReturns)({
        page,
        search,
      });
      setItems(result.rows);
      setPagination(result.pagination);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, tab, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetails = async (row) => {
    setDetailModal({
      isOpen: true,
      isLoading: true,
      data: null,
      error: "",
    });

    try {
      const data = await (tab === "refunds"
        ? getRefundDetails(row.id)
        : getReturnDetails(row.id));
      setDetailModal({
        isOpen: true,
        isLoading: false,
        data,
        error: "",
      });
    } catch (error) {
      setDetailModal({
        isOpen: true,
        isLoading: false,
        data: null,
        error: error.message,
      });
    }
  };

  const closeDetails = useCallback(() => {
    setDetailModal({
      isOpen: false,
      isLoading: false,
      data: null,
      error: "",
    });
  }, []);

  const change = async (row, status) => {
    try {
      const updatedDetail = await updateReturn(row, status);
      toast.success(`Return ${status}.`);
      if (detailModal.data?.return?.id === row.id) {
        setDetailModal((current) => ({ ...current, data: updatedDetail }));
      }
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const columns =
    tab === "refunds"
      ? [
          {
            id: "refund_reference",
            label: "Refund",
            accessor: "refund_reference",
          },
          {
            id: "product_name",
            label: "Product",
            accessor: "product_name",
          },
          {
            id: "customer_name",
            label: "Customer",
            accessor: "customer_name",
          },
          {
            id: "status",
            label: "Status",
            render: (row) => badge(row.status),
          },
          {
            id: "amount",
            label: "Amount",
            render: (row) => money(row.amount),
          },
          {
            id: "processed_at",
            label: "Processed",
            render: (row) => formatDate(row.processed_at),
          },
        ]
      : [
          {
            id: "id",
            label: "Return",
            render: (row) => `#${row.id}`,
          },
          {
            id: "order_id",
            label: "Order",
            render: (row) => `#${row.order_id}`,
          },
          {
            id: "product_name",
            label: "Product",
            render: (row) => (
              <span className="returns-product-cell">
                <strong>{row.product_name}</strong>
                <small>{row.product_sku || "No SKU"}</small>
              </span>
            ),
          },
          {
            id: "customer_name",
            label: "Customer",
            render: (row) => (
              <span className="returns-product-cell">
                <strong>{row.customer_name}</strong>
                <small>{row.customer_email || "—"}</small>
              </span>
            ),
          },
          {
            id: "reason",
            label: "Reason",
            render: (row) => (
              <span className="line-clamp-2 max-w-80">{row.reason || "—"}</span>
            ),
          },
          {
            id: "status",
            label: "Status",
            render: (row) => badge(row.status),
          },
          {
            id: "refund_amount",
            label: "Refund",
            render: (row) => money(row.refund_amount),
          },
        ];

  const actions = (row) => (
    <div className="returns-row-actions">
      <button
        type="button"
        className="admin-row-action"
        onClick={() => void openDetails(row)}
        title={`View ${tab === "refunds" ? "refund" : "return"} details`}
        aria-label={`View ${tab === "refunds" ? "refund" : "return"} details`}
      >
        <Eye size={15} />
      </button>
      {tab === "returns" && row.status === "requested" ? (
        <>
          <button
            type="button"
            className="routes-control routes-control--blue"
            onClick={() => void change(row, "approved")}
          >
            Approve
          </button>
          <button
            type="button"
            className="routes-control"
            onClick={() => void change(row, "rejected")}
          >
            Reject
          </button>
        </>
      ) : null}
      {tab === "returns" && row.status === "approved" ? (
        <button
          type="button"
          className="routes-control routes-control--blue"
          onClick={() => void change(row, "refunded")}
        >
          Mark refunded
        </button>
      ) : null}
    </div>
  );

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <RotateCcw size={20} color="#4f83ff" />
            <h1>{tab === "refunds" ? "Refund Ledger" : "Returns"}</h1>
          </div>
          <p className="routes-page__subtitle">
            {tab === "refunds"
              ? "Track completed refund records and inspect every linked detail."
              : "Approve returns, restore products, process refunds, and review the complete audit."}
          </p>
        </header>
        <AdminDataTable
          columns={columns}
          data={items}
          isLoading={loading}
          pagination={pagination}
          search={search}
          searchPlaceholder={`Search ${tab}`}
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          onPageChange={setPage}
          resultLabel={`${pagination.total || 0} ${tab}`}
          renderRowActions={actions}
          rowActionsWidth={tab === "returns" ? "250px" : "64px"}
          actions={
            <AdminTableButton onClick={load} disabled={loading}>
              <RefreshCcw size={14} />
              Refresh
            </AdminTableButton>
          }
          emptyMessage={`No ${tab} found.`}
        />
      </div>

      {detailModal.isOpen ? (
        <ReturnDetailModal
          type={tab}
          detail={detailModal.data}
          error={detailModal.error}
          isLoading={detailModal.isLoading}
          onClose={closeDetails}
        />
      ) : null}
    </main>
  );
}
