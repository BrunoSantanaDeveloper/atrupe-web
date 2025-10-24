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

interface VisualPlanFeatureType {
  title: string
  items: string[]
  videoUrl?: string
}

export interface VisualPlanType {
  id: string
  name: string
  basePrice?: number
  isActive: boolean
  badge?: {
    text: string
    variant: 'light' | 'orangeLight'
  }
  sections: {
    concept?: {
      description: string
      objective: string
      mainActions: string[]
      expectedResults: { text?: string; list?: string[] }
      footer?: string
    }
    features?: VisualPlanFeatureType[]
  }
}

interface ModuleFeatureType {
  title?: string
  items: string[]
}

export interface ModuleType {
  id: string
  name: string
  price: number
  features: ModuleFeatureType[]
}
