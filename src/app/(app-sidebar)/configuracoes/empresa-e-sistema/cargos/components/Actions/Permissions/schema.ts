import { z } from 'zod'

export const schema = z.record(
  z.object({
    view: z.boolean().optional(),
    edit: z.boolean().optional(),
    create: z.boolean().optional(),
    delete: z.boolean().optional(),
  }),
)

export type FormType = z.infer<typeof schema>
