import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PublicUser, Session } from '@/contracts/auth'

interface SessionState {
  token: string | null
  expiresAt: string | null
  user: PublicUser | null
  setSession: (session: Session) => void
  updateUser: (user: PublicUser) => void
  clear: () => void
  isAuthenticated: () => boolean
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      user: null,
      setSession: (session) => set({ token: session.token, expiresAt: session.expiresAt, user: session.user }),
      updateUser: (user) => set((state) => (state.user?.id === user.id ? { user } : state)),
      clear: () => set({ token: null, expiresAt: null, user: null }),
      isAuthenticated: () => {
        const { token, expiresAt } = get()
        return Boolean(token) && (!expiresAt || new Date(expiresAt).getTime() > Date.now())
      },
    }),
    { name: 'kurio.session' },
  ),
)

export const useIsAuthenticated = () => useSessionStore((s) => Boolean(s.token))
