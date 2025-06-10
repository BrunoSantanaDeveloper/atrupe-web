export interface PlanFeature {
  title: string
  description?: string
}

export interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: PlanFeature[]
  isSelected?: boolean
}

export interface AdditionalModule {
  id: string
  name: string
  price: number
  description: string
  isSelected?: boolean
}
