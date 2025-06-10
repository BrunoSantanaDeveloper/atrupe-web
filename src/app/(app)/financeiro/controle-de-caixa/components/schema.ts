import { z } from 'zod'

export const cashControlSchema = z.any()

export type CashControlFormType = z.infer<typeof cashControlSchema>

export const cashControlDefaultValues: CashControlFormType = {}
