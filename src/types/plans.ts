export interface PlanFeature {
  title: string
  description?: string
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
  videoUrl?: string
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
  key: string
  name: string
  price: number
  description?: string
  category?: string
  features?: ModuleFeatureType[]
}
