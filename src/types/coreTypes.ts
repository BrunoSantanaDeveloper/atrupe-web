import { BadgeProps } from '@/components/ui/badge'

export type SearchParamsType = {
  searchParams: {
    [key: string]: string
  }
}

export type ParamsType = {
  params: {
    [key: string]: string
  }
}

export type BadgeType = {
  variant: BadgeProps['variant']
  text: string
}
