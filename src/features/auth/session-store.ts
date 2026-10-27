import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PublicUser, Session } from '@/contracts/auth'

export type SessionStatus = 'anonymous' | 'authenticated'

interface SessionState {
  token: string | null
  expiresAt: string | null
  user: PublicUser | null
  lastExit: 'logout' | 'expired' | null
  setSession: (session: Session) => void
  updateUser: (user: PublicUser) => void
  expire: () => void
  clear: () => void
  isAuthenticated: () => boolean
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      user: null,
      lastExit: null,
      setSession: (session) => set({ token: session.token, expiresAt: session.expiresAt, user: session.user, lastExit: null }),
      updateUser: (user) => set({ user }),
      expire: () => set({ token: null, expiresAt: null, user: null, lastExit: 'expired' }),
      clear: () => set({ token: null, expiresAt: null, user: null, lastExit: 'logout' }),
      isAuthenticated: () => {
        const { token, expiresAt } = get()
        return Boolean(token) && (!expiresAt || new Date(expiresAt).getTime() > Date.now())
      },
    }),
    {
      name: 'kurio.session',
      partialize: (state) => ({ token: state.token, expiresAt: state.expiresAt, user: state.user }),
    },
  ),
)

export const useSessionUser = () => useSessionStore((s) => s.user)
export const useIsAuthenticated = () => useSessionStore((s) => Boolean(s.token))
