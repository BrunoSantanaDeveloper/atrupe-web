// Type
import {
  LogoItau,
  LogoStripe,
  LogoPayPal,
  LogoBradesco,
  LogoSantander,
  LogoAtrupe,
  LogoBancoDoBrasil,
  LogoCaixa,
} from '@/assets/logos'
import { BadgeType } from '@/types/coreTypes'
import type { ComponentType } from 'react'
import type { LogoProps } from '@/assets/logos'

export const cashControlStatusObj: {
  [key: string]: BadgeType
} = {
  OPEN: { text: 'Aberto', variant: 'blueLight' },
  CLOSED: { text: 'Fechado', variant: 'warningLight' },
}

export const bankIcons: {
  [key: string]: ComponentType<LogoProps>
} = {
  company: LogoAtrupe,
  payPal: LogoPayPal,
  bradesco: LogoBradesco,
  bancoBradesco: LogoBradesco,
  stripe: LogoStripe,
  bancoItau: LogoItau,
  bancoDoBrasil: LogoBancoDoBrasil,
  caixaEconomicaFederal: LogoCaixa,
  bancoSantanderBrasil: LogoSantander,
}
