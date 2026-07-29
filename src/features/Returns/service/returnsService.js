import { apiRequest } from "../../../services/apiClient";
const check = (payload) => {
  if (payload?.isExecuted === false)
    throw new Error(payload?.message || "Request failed.");
  return payload?.data;
};
const list = async (path, { page = 1, search = "" } = {}) => {
  const query = new URLSearchParams({ page: String(page), perPage: "10" });
  if (search) query.set("search", search);
  const data = check(await apiRequest(`${path}?${query}`));
  const rows = data?.data || [];
  return {
    rows,
    pagination: {
      currentPage: data?.current_page || 1,
      lastPage: data?.last_page || 1,
      total: data?.total || rows.length,
    },
  };
};
export const listReturns = (params) => list("/admin/returns", params);
export const listRefunds = (params) => list("/admin/refunds", params);
export const getReturnDetails = async (id) =>
  check(await apiRequest(`/admin/returns/${id}`));
export const getRefundDetails = async (id) =>
  check(await apiRequest(`/admin/refunds/${id}`));
export const updateReturn = async (record, status) =>
  check(
    await apiRequest(`/admin/returns/${record.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        order_id: record.order_id,
        product_id: record.product_id,
        reason: record.reason,
        status,
        refund_amount: status === "refunded" ? record.refund_amount : null,
      }),
    }),
  );
