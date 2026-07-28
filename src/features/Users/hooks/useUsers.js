import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import { emptyUserProfileDetails, emptyUsersCollection, getUserProfile, getUsers } from '../service/usersService'

export default function useUsers() {
  const toast = useToast()
  const [items, setItems] = useState(emptyUsersCollection.rows)
  const [pagination, setPagination] = useState(emptyUsersCollection.pagination)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [details, setDetails] = useState(emptyUserProfileDetails)
  const [detailsError, setDetailsError] = useState('')
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loadingUserId, setLoadingUserId] = useState(null)

  const loadUsers = useCallback(
    async (overrides = {}) => {
      const nextPage = overrides.page ?? page
      const nextSearch = overrides.search ?? search

      setIsLoading(true)
      setError('')

      try {
        const response = await getUsers({ page: nextPage, search: nextSearch })
        setItems(response.rows)
        setPagination(response.pagination)
      } catch (loadError) {
        const message = loadError.message || 'Unable to load users.'
        setError(message)
        setItems(emptyUsersCollection.rows)
        setPagination(emptyUsersCollection.pagination)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [page, search, toast],
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadUsers])

  const openDetails = async (user) => {
    setSelectedUser(user)
    setDetails(emptyUserProfileDetails)
    setDetailsError('')
    setDetailsOpen(true)
    setDetailsLoading(true)
    setLoadingUserId(user.id)

    try {
      const response = await getUserProfile(user.id)
      setDetails(response)
    } catch (loadError) {
      const message = loadError.message || 'Unable to load user profile.'
      setDetailsError(message)
      toast.error(message)
    } finally {
      setDetailsLoading(false)
      setLoadingUserId(null)
    }
  }

  const closeDetails = () => {
    setDetails(emptyUserProfileDetails)
    setDetailsError('')
    setDetailsLoading(false)
    setDetailsOpen(false)
    setLoadingUserId(null)
    setSelectedUser(null)
  }

  return {
    closeDetails,
    details,
    detailsError,
    detailsLoading,
    detailsOpen,
    error,
    isLoading,
    items,
    loadingUserId,
    openDetails,
    page,
    pagination,
    refresh: loadUsers,
    search,
    selectedUser,
    setPage,
    setSearch,
  }
}
