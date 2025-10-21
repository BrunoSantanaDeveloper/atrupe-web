export interface Session {
  sessionId: string
  lastActive: string
  ipAddress: string
  endpoint: string
}

export interface SessionUser {
  userId: string
  userName: string
  email: string
  avatar?: string | null
  companyId: string
  companyName: string
  lastActive: string
  sessions: Session[]
}

export interface ActiveSessionsResponse {
  data: SessionUser[]
  total: number
}

export interface UserActivityHistory {
  id: string
  userId: string
  companyId: string
  employeeId: string
  sessionId: string
  endpoint: string
  method: string
  ipAddress: string
  userAgent: string
  lastActive: string
  createdAt: string
  isActive: boolean
  logoutAt: string | null
}

export interface UserHistoryResponse {
  data: UserActivityHistory[]
  total: number
  limit: number
  offset: number
}

export interface CompanyStatistics {
  totalUsers: number
  totalSessions: number
  activeToday: number
  periodDays: number
}
