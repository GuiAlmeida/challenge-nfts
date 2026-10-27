export interface SocketSession {
  id: string
  token: string | null
  userId: string | null
  connectedAt: number
  emit: (event: string, ...data: unknown[]) => void
  close: (code?: number, reason?: string) => void
}

const sessions = new Map<string, SocketSession>()

export const socketSessions = {
  register(session: SocketSession): void {
    sessions.set(session.id, session)
  },
  unregister(id: string): void {
    sessions.delete(id)
  },
  get(id: string): SocketSession | undefined {
    return sessions.get(id)
  },
  all(): SocketSession[] {
    return [...sessions.values()]
  },
  forUser(userId: string): SocketSession[] {
    return [...sessions.values()].filter((s) => s.userId === userId)
  },
  snapshot(): Array<Pick<SocketSession, 'id' | 'token' | 'userId' | 'connectedAt'>> {
    return [...sessions.values()].map(({ id, token, userId, connectedAt }) => ({
      id,
      token,
      userId,
      connectedAt,
    }))
  },
}
