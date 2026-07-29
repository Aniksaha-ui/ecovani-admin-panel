import { apiRequest } from "../../../services/apiClient";

const check = (payload, fallback) => {
  if (payload?.isExecuted === false)
    throw new Error(payload?.message || fallback);
  return payload?.data;
};
const request = async (path, options) =>
  check(await apiRequest(path, options), "Procurement payment request failed.");

export const listProcurementPayments = async ({
  page = 1,
  search = "",
} = {}) => {
  const query = new URLSearchParams({ page: String(page), perPage: "10" });
  if (search) query.set("search", search);
  const data = await request(`/admin/procurement-payments?${query}`);
  const rows = data?.data || [];
  return {
    rows,
    pagination: {
      currentPage: data?.current_page || 1,
      from: data?.from || 0,
      lastPage: data?.last_page || 1,
      to: data?.to || rows.length,
      total: data?.total || rows.length,
    },
  };
};
export const paymentOptions = () =>
  request("/admin/procurement-payments/options");
export const saveProcurementPayment = (values, id) =>
  request(
    id ? `/admin/procurement-payments/${id}` : "/admin/procurement-payments",
    { method: id ? "PATCH" : "POST", body: JSON.stringify(values) },
  );
export const deleteProcurementPayment = (id) =>
  request(`/admin/procurement-payments/${id}`, { method: "DELETE" });
