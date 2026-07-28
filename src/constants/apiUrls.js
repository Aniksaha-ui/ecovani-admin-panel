export const API_URLS = {
  auth: {
    login: '/login',
  },
  admin: {
    userCompare: '/admin/customer-compare',
    users: '/admin/users',
    userProfile: (userId) => `/admin/users/${userId}/profile`,
  },
}
