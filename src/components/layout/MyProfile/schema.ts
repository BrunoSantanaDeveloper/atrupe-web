import * as z from 'zod'

export const schema = z.any()

export type FormType = z.infer<typeof schema>
