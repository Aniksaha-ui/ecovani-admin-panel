import { apiRequest } from "../../../services/apiClient";
import { APP_CONFIG } from "../../../services/config";

const get = async (path) => (await apiRequest(path)).data;
const send = async (path, method, body) =>
  (
    await apiRequest(path, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    })
  ).data;

export const productImage = (path) =>
  !path
    ? ""
    : /^https?:\/\//i.test(path)
      ? path
      : `${APP_CONFIG.imageBaseUrl.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
export const money = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD", { maximumFractionDigits: 2, minimumFractionDigits: Number(value || 0) % 1 ? 2 : 0 })}`;
export const getCatalog = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.categoryId) params.set("category_id", filters.categoryId);
  if (filters.featured) params.set("featured", "1");
  return get(`/admin/pos/catalog?${params}`);
};
export const getToday = () => get("/admin/pos/today");
export const getOrders = (search = "") =>
  get(`/admin/pos/orders?search=${encodeURIComponent(search)}`);
export const getOrder = (id) => get(`/admin/pos/sales/${id}`);
export const placeOrder = (body) => send("/admin/pos/sales", "POST", body);
export const getHolds = () => get("/admin/pos/holds");
export const holdOrder = (body) => send("/admin/pos/holds", "POST", body);
export const removeHold = (id) => send(`/admin/pos/holds/${id}`, "DELETE");
export const returnOrder = (id, body) =>
  send(`/admin/pos/sales/${id}/returns`, "POST", body);
export const collectPayment = (id, body) =>
  send(`/admin/pos/sales/${id}/payments`, "POST", body);

export const formatPosDate = (value, options = {}) => {
  if (!value) return "—";
  const timestamp =
    typeof value === "string" && /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(value)
      ? `${value.replace(" ", "T")}Z`
      : value;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(new Date(timestamp));
};
