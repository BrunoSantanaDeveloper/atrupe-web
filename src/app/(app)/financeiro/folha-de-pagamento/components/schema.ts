import { z } from 'zod'

export const fixedExpensesSchema = z.any()

export type FixedExpensesFormType = z.infer<typeof fixedExpensesSchema>

export const fixedExpensesDefaultValues: FixedExpensesFormType = {}
