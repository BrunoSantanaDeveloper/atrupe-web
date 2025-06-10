export type SubCategoryType = {
  id: string
  code: string
  description: string
  level1: string
  level2: string
  natureId: string
  isActive: boolean
}

export type NatureType = {
  id: string
  code: string
  description: string
  level1: string
  level2: string
  isActive: boolean
  subCategories: SubCategoryType[]
}

export type AccountsPlanDataType = {
  name: string
  code: string
  level2: {
    name: string
    code: string
    natures: NatureType[]
  }[]
}

export type AccountsPlanResponseType = {
  lastPage: number
  data: AccountsPlanDataType[]
}
