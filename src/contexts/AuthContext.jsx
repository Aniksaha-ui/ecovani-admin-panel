/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useToast } from '../components/common/Toaster'
import { login as loginRequest } from '../features/auth/service/authService'
import { APP_CONFIG } from '../services/config'
import { AUTH_SESSION_TIMEOUT_EVENT, AUTH_SESSION_TIMEOUT_MESSAGE, resetSessionTimeoutState } from '../services/apiClient'

const AuthContext = createContext(null)
const defaultAuthState = { user: null, token: null, isAuthenticated: false }

function getPersistedAuthSession() {
  try {
    const storedSession = JSON.parse(window.localStorage.getItem(APP_CONFIG.authStorageKey))
    return { user: storedSession?.user ?? null, token: storedSession?.token ?? null, isAuthenticated: Boolean(storedSession?.token) }
  } catch { return defaultAuthState }
}

export function AuthProvider({ children }) {
  const toast = useToast()
  const [auth, setAuth] = useState(getPersistedAuthSession)
  const [loginState, setLoginState] = useState({ status: 'idle', error: null })
  const [logoutState, setLogoutState] = useState({ status: 'idle', error: null })
  const [sessionMessage, setSessionMessage] = useState('')
  const clearSession = useCallback(() => { window.localStorage.removeItem(APP_CONFIG.authStorageKey); resetSessionTimeoutState(); setAuth(defaultAuthState) }, [])

  const login = useCallback(async (credentials) => {
    setLoginState({ status: 'loading', error: null })
    try {
      const session = await loginRequest(credentials)
      resetSessionTimeoutState()
      window.localStorage.setItem(APP_CONFIG.authStorageKey, JSON.stringify(session))
      setAuth({ user: session.user, token: session.token, isAuthenticated: true })
      setLoginState({ status: 'succeeded', error: null })
      return session
    } catch (error) {
      const message = error.message || 'Unable to sign in.'
      setLoginState({ status: 'failed', error: message }); toast.error(message); throw error
    }
  }, [toast])

  const logout = useCallback(async () => { setLogoutState({ status: 'loading', error: null }); clearSession(); setSessionMessage(''); setLoginState({ status: 'idle', error: null }); setLogoutState({ status: 'succeeded', error: null }); toast.success('Signed out successfully.') }, [clearSession, toast])

  useEffect(() => {
    const handleSessionTimeout = (event) => { const message = event.detail?.message || AUTH_SESSION_TIMEOUT_MESSAGE; setSessionMessage(message); toast.error(message); clearSession() }
    window.addEventListener(AUTH_SESSION_TIMEOUT_EVENT, handleSessionTimeout)
    return () => window.removeEventListener(AUTH_SESSION_TIMEOUT_EVENT, handleSessionTimeout)
  }, [clearSession, toast])

  const value = useMemo(() => ({ auth, login, loginState, logout, logoutState, sessionMessage, clearSessionMessage: () => setSessionMessage('') }), [auth, login, loginState, logout, logoutState, sessionMessage])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within AuthProvider.')
  return context
}
