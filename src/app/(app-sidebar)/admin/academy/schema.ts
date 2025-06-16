import { z } from 'zod'

export const schema = z.object({
  type: z.array(z.string()).min(1, 'Selecione pelo menos um tipo'),
  section: z.string().min(1, 'Seção é obrigatória'),
  description: z.string().optional(),
  order: z.number().min(0, 'Ordem deve ser maior ou igual a 0'),
  videoUrl: z.string().optional(),
  page: z.string().optional(),
  modal: z.string().optional(),
  buttonTitle: z.string().optional(),
  files: z.array(z.string()).default([]),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  type: [],
  section: '',
  description: '',
  order: 0,
  videoUrl: '',
  page: '',
  modal: '',
  buttonTitle: '',
  files: [],
}
