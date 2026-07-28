import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import {
  emptyUserProfileDetails,
  emptyUsersComparison,
  normalizeUser,
  normalizeUserProfileDetails,
  normalizeUsersComparison,
} from '../utils/usersUtils'

const defaultPagination = {
  currentPage: 1,
  from: 0,
  lastPage: 1,
  to: 0,
  total: 0,
}

const ensureUsersPayload = (payload, fallbackMessage) => {
  const executionStatus =
    payload?.status ??
    payload?.isExecute ??
    payload?.isExecture ??
    payload?.data?.status ??
    payload?.data?.data?.status

  if (executionStatus === false) {
    throw new Error(payload?.message || fallbackMessage)
  }

  if (typeof executionStatus === 'string' && executionStatus.trim().toUpperCase() === 'FAILED') {
    throw new Error(payload?.message || fallbackMessage)
  }

  return payload
}

const extractRowsAndMeta = (payload) => {
  if (Array.isArray(payload?.data?.data?.data)) {
    return {
      meta: payload.data.data,
      rows: payload.data.data.data,
    }
  }

  if (Array.isArray(payload?.data?.data)) {
    return {
      meta: payload.data,
      rows: payload.data.data,
    }
  }

  if (Array.isArray(payload?.data)) {
    return {
      meta: {},
      rows: payload.data,
    }
  }

  if (Array.isArray(payload)) {
    return {
      meta: {},
      rows: payload,
    }
  }

  return {
    meta: {},
    rows: [],
  }
}

const normalizePagination = (meta, fallbackCount = 0) => ({
  currentPage: Number(meta?.current_page ?? meta?.currentPage) || 1,
  from: Number(meta?.from) || 0,
  lastPage: Number(meta?.last_page ?? meta?.lastPage) || 1,
  to: Number(meta?.to) || fallbackCount,
  total: Number(meta?.total) || fallbackCount,
})

export const getUsers = async ({ page = 1, search = '' } = {}) => {
  const query = search ? `&search=${encodeURIComponent(search)}` : ''
  const payload = ensureUsersPayload(
    await apiRequest(`${API_URLS.admin.users}?page=${page}${query}`),
    'Unable to load users.',
  )
  const { meta, rows } = extractRowsAndMeta(payload)
  const pagination = normalizePagination(meta, rows.length)

  return {
    pagination,
    rows: rows.map((item, index) => normalizeUser(item, index, pagination)),
  }
}

export const emptyUsersCollection = {
  pagination: defaultPagination,
  rows: [],
}

const extractUserProfileRecord = (payload) =>
  payload?.data?.data ??
  payload?.data ??
  payload ??
  {}

export const getUserProfile = async (userId) => {
  const payload = ensureUsersPayload(
    await apiRequest(API_URLS.admin.userProfile(userId)),
    'Unable to load user profile.',
  )

  return normalizeUserProfileDetails(extractUserProfileRecord(payload))
}

export { emptyUserProfileDetails }

export const getUsersComparison = async (userIds = []) => {
  const ids = [...new Set(userIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0))]
  const payload = ensureUsersPayload(
    await apiRequest(`${API_URLS.admin.userCompare}?ids=${ids.join(',')}`),
    'Unable to load customer comparison.',
  )

  return normalizeUsersComparison(extractUserProfileRecord(payload))
}

export { emptyUsersComparison }
