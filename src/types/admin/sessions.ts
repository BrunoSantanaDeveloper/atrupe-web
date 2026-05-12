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

export interface AccessEvent {
  id: string
  activityId?: string | null
  userId: string
  companyId?: string | null
  employeeId?: string | null
  sessionId: string
  endpoint?: string | null
  method?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
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
  events?: AccessEvent[]
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

export interface AccessSession {
  id: string
  userId: string
  userName: string
  email: string
  avatar?: string | null
  companyId?: string | null
  companyName?: string | null
  employeeId?: string | null
  sessionId: string
  endpoint?: string | null
  method?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
  lastActive: string
  isActive: boolean
  logoutAt?: string | null
  eventsCount: number
}

export interface AccessSessionsResponse {
  data: AccessSession[]
  total: number
  page: number
  limit: number
  lastPage: number
}

export interface AccessSummary {
  totalSessions: number
  activeSessions: number
  uniqueUsers: number
  uniqueCompanies: number
  totalEvents: number
  periodDays: number
}

export interface AccessSessionDetails {
  session: AccessSession
  events: {
    data: AccessEvent[]
    total: number
    limit: number
    offset: number
  }
}
