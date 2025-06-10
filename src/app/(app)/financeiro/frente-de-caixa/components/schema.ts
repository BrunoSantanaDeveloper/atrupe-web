import { z } from 'zod'

export const checkoutSchema = z.any()

export type CheckoutFormType = z.infer<typeof checkoutSchema>

export const checkoutDefaultValues: CheckoutFormType = {}
