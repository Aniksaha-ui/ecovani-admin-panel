export const APP_ROUTES = {
  login: '/login',
  users: '/admin/users',
  userCompare: '/admin/users/compare',
  userProfile: (userId = ':id') => `/admin/users/${userId}/profile`,
}
