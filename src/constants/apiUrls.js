export const API_URLS = {
  auth: {
    login: '/login',
  },
  admin: {
    userCompare: '/admin/customer-compare',
    users: '/admin/users',
    userProfile: (userId) => `/admin/users/${userId}/profile`,
    categories: '/admin/categories',
    products: '/admin/products',
    productOptions: '/admin/products/options',
    requisitionOptions: '/admin/requisitions/options',
    requisitions: '/admin/requisitions',
    procurements: '/admin/procurements',
    stockReceipts: '/admin/stock-receipts',
    stocks: '/admin/stocks',
    productStockOptions: '/admin/product-stocks/options',
    productStocks: '/admin/product-stocks',
    inventoryAdjustments: '/admin/inventory-adjustments',
  },
}
