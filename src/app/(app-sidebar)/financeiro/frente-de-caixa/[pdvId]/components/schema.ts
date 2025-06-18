import { z } from 'zod'

export const pdvSchema = z.any()

export type PDVFormType = z.infer<typeof pdvSchema>

export const pdvDefaultValues: PDVFormType = {}
