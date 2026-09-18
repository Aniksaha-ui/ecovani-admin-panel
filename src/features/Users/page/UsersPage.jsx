/* eslint-disable react-hooks/set-state-in-effect */
import { RefreshCcw, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/common/Toaster";
import AdminDataTable, {
  AdminTableButton,
} from "../../../components/ui/AdminDataTable";
import { APP_ROUTES } from "../../../constants/routes";
import { UsersOverview } from "../component/UsersOverview.jsx";
import { usersColumns } from "../component/column.jsx";
import { USERS_PAGE_COPY } from "../constants/users.constants";
import useUsers from "../hooks/useUsers";
import {
  buildUserMetrics,
  buildUserRoleFilters,
  filterUsersByRole,
} from "../utils/usersUtils";

export default function UsersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const apiState = useUsers();
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const roleFilters = useMemo(
    () => buildUserRoleFilters(apiState.items),
    [apiState.items],
  );
  const visibleUsers = useMemo(
    () => filterUsersByRole(apiState.items, roleFilter),
    [apiState.items, roleFilter],
  );
  const metrics = useMemo(
    () => buildUserMetrics(apiState.items),
    [apiState.items],
  );
  const toggleSelectedUser = (userId) => {
    setSelectedUserIds((currentIds) =>
      currentIds.includes(userId)
        ? currentIds.filter((currentId) => currentId !== userId)
        : [...currentIds, userId],
    );
  };

  const columns = useMemo(
    () =>
      usersColumns({
        loadingUserId: apiState.loadingUserId,
        onToggleCompare: (user) => toggleSelectedUser(user.id),
        selectedUserIds,
        onViewProfile: (user) => navigate(APP_ROUTES.userProfile(user.id)),
      }),
    [apiState.loadingUserId, navigate, selectedUserIds],
  );

  useEffect(() => {
    if (!roleFilters.some((filter) => filter.key === roleFilter)) {
      setRoleFilter("all");
    }
  }, [roleFilter, roleFilters]);

  useEffect(() => {
    const validIds = new Set(apiState.items.map((item) => item.id));
    setSelectedUserIds((currentIds) =>
      currentIds.filter((id) => validIds.has(id)),
    );
  }, [apiState.items]);

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return "No users found.";
    }

    const filterLabel =
      roleFilters
        .find((filter) => filter.key === roleFilter)
        ?.label.toLowerCase() ?? "all users";
    const rangeLabel =
      apiState.pagination.from && apiState.pagination.to
        ? `${apiState.pagination.from}-${apiState.pagination.to}`
        : "0";

    return `Showing ${visibleUsers.length} ${filterLabel} on this page • ${rangeLabel} of ${apiState.pagination.total} matched accounts`;
  }, [
    apiState.items.length,
    apiState.pagination.from,
    apiState.pagination.to,
    apiState.pagination.total,
    roleFilter,
    roleFilters,
    visibleUsers.length,
  ]);

  const handleCompare = () => {
    if (selectedUserIds.length < 2) {
      toast.warning("Select at least two customers to compare.");
      return;
    }

    if (selectedUserIds.length > 5) {
      toast.warning("Select up to five customers for a cleaner comparison.");
      return;
    }

    navigate(`${APP_ROUTES.userCompare}?ids=${selectedUserIds.join(",")}`);
  };

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="routes-page__title">
                <UsersRound size={20} color="var(--color-accent)" />
                <h1>{USERS_PAGE_COPY.title}</h1>
              </div>
              <p className="routes-page__subtitle">
                {USERS_PAGE_COPY.subtitle}
              </p>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text-secondary)]">
              <UsersRound size={16} />
              <span>
                {apiState.pagination.total || apiState.items.length} matched
                accounts
              </span>
            </div>
          </div>
        </header>

        <UsersOverview isLoading={apiState.isLoading} metrics={metrics} />
        {apiState.error ? (
          <p className="month-balance-alert">{apiState.error}</p>
        ) : null}

        <section className="user-comparison-panel mb-5 rounded-2xl border border-[var(--color-border-strong)] bg-[linear-gradient(135deg,rgba(28,24,26,0.98),rgba(17,14,15,0.98))] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Customer comparison selection
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Select multiple customers from the table, then open the compare
                page.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              {selectedUserIds.length} selected
            </div>
          </div>

          {selectedUserIds.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {visibleUsers
                .filter((user) => selectedUserIds.includes(user.id))
                .map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-strong)] bg-[var(--color-accent-soft)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)]"
                    onClick={() => toggleSelectedUser(user.id)}
                  >
                    <span>{user.name}</span>
                    <span className="text-xs text-[var(--color-link)]">
                      Remove
                    </span>
                  </button>
                ))}
            </div>
          ) : null}
        </section>

        <AdminDataTable
          actions={
            <>
              <AdminTableButton
                count={selectedUserIds.length}
                disabled={selectedUserIds.length < 2}
                onClick={handleCompare}
                variant="blue"
              >
                Compare Selected
              </AdminTableButton>
              <AdminTableButton
                className={apiState.isLoading ? "opacity-60" : ""}
                disabled={apiState.isLoading}
                onClick={() => apiState.refresh()}
              >
                <RefreshCcw size={14} />
                Refresh
              </AdminTableButton>
            </>
          }
          columns={columns}
          data={visibleUsers}
          emptyMessage={
            roleFilter === "all"
              ? "No users found."
              : `No ${roleFilters.find((filter) => filter.key === roleFilter)?.label.toLowerCase()} on this page.`
          }
          filters={
            <div className="refund-filter-group">
              {roleFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className={`refund-filter-button ${roleFilter === filter.key ? "is-active" : ""}`}
                  onClick={() => setRoleFilter(filter.key)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          }
          isLoading={apiState.isLoading}
          onPageChange={apiState.setPage}
          onSearchChange={(value) => {
            apiState.setPage(1);
            apiState.setSearch(value);
          }}
          pagination={apiState.pagination}
          resultLabel={resultLabel}
          search={apiState.search}
          searchPlaceholder={USERS_PAGE_COPY.searchPlaceholder}
        />
      </div>
    </main>
  );
}
