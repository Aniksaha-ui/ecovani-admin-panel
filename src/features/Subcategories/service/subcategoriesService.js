import { apiRequest } from "../../../services/apiClient";
const check = (payload, fallback) => {
  if (payload?.isExecuted === false)
    throw new Error(payload?.message || fallback);
  return payload?.data;
};
const request = async (path, options) =>
  check(await apiRequest(path, options), "Subcategory request failed.");
export const listSubcategories = async ({ page = 1, search = "" } = {}) => {
  const query = new URLSearchParams({ page: String(page), perPage: "10" });
  if (search) query.set("search", search);
  const data = await request(`/admin/subcategories?${query}`);
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
export const listCategoryOptions = () =>
  request("/admin/subcategories/options");
export const saveSubcategory = (values, id) =>
  request(id ? `/admin/subcategories/${id}` : "/admin/subcategories", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(values),
  });
export const deleteSubcategory = (id) =>
  request(`/admin/subcategories/${id}`, { method: "DELETE" });
