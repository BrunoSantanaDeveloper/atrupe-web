import * as z from 'zod'

export const schema = z.object({
  name: z.string().min(1),
  sectorId: z.string(),
  roleId: z.string(),
  cpf: z.string(),
  rg: z.string(),
  phone: z.string().optional(),
  mobile: z.string().min(1, 'Celular é obrigatório'),
  avatarUrl: z.string().optional(),
  signatureUrl: z.string().optional(),
  address: z.object({
    zipcode: z.string().min(8, 'CEP inválido'),
    state: z.string(),
    city: z.string(),
    neighborhood: z.string(),
    number: z.string(),
    street: z.string(),
    complement: z.string().optional(),
  }),
})

export type FormType = z.infer<typeof schema>
