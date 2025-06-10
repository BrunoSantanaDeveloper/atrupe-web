export type RoleType = {
  id: string
  name: string
  isActive: boolean
  companyId: string
  sectorId: string
  employees: {
    user: {
      name: string
    }
  }[]
  isAdmin: boolean
}

export type ListRoleDataType = {
  sector: { id: string; name: string }
  roles: RoleType[]
}

export type ListRoleType = {
  data: ListRoleDataType[]
  total: number
  lastPage: number
}
