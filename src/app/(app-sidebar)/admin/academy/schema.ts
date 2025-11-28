import { z } from 'zod'

export const schema = z.object({
  type: z
    .string()
    .min(1, 'Plano é obrigatório')
    .transform((val) => [val]),
  section: z.string().min(1, 'Seção é obrigatória'),
  description: z.string().optional(),
  order: z
    .number()
    .min(1, 'Ordem deve ser maior ou igual a 1')
    .transform((val) => val - 1),
  videoUrl: z.string().optional(),
  page: z.string().optional(),
  modal: z.string().optional(),
  buttonTitle: z.string().optional(),
  files: z.array(z.object({ url: z.string(), name: z.string() })).default([]),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  type: '' as unknown as string[],
  section: '',
  description: '',
  order: 1,
  videoUrl: '',
  page: '',
  modal: '',
  buttonTitle: '',
  files: [],
}
