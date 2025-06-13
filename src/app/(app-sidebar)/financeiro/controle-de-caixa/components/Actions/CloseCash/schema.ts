import { z } from 'zod'

export const schema = z.object({
  notes: z.string(),
})

export type FormType = z.infer<typeof schema>

export const defaultValues = {
  notes: '',
}
