// Type
import {
  IconItau,
  IconStripe,
  IconPayPal,
  IconBradesco,
  IconSantander,
  IconAtrupeLogo,
  IconBancoDoBrasil,
  IconCaixaEconomica,
} from '@/assets/icons/CustomIcons'
import { BadgeType } from '@/types/coreTypes'
import { SVGProps } from 'react'

export const cashControlStatusObj: {
  [key: string]: BadgeType
} = {
  OPEN: { text: 'Aberto', variant: 'blueLight' },
  CLOSED: { text: 'Fechado', variant: 'warningLight' },
}

export const bankIcons: {
  [key: string]: (props: SVGProps<SVGSVGElement>) => JSX.Element
} = {
  company: IconAtrupeLogo,
  payPal: IconPayPal,
  bradesco: IconBradesco,
  bancoBradesco: IconBradesco,
  stripe: IconStripe,
  bancoItau: IconItau,
  bancoDoBrasil: IconBancoDoBrasil,
  caixaEconomicaFederal: IconCaixaEconomica,
  bancoSantanderBrasil: IconSantander,
}
