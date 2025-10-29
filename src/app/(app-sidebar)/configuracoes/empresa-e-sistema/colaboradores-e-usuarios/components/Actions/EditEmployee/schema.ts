import * as z from 'zod'

export const schema = z.object({
  name: z.string().min(1),
  sectorId: z.string(),
  roleId: z.string(),
  cpf: z.string(),
  rg: z.string(),
  phone: z.string(),
  mobile: z.string(),
  avatarUrl: z.string(),
  signatureUrl: z.string(),
  address: z.object({
    zipcode: z.string().min(8, 'CEP inválido'),
    state: z.string(),
    city: z.string(),
    neighborhood: z.string(),
    number: z.string(),
    street: z.string(),
    complement: z.string(),
  }),
})

export type FormType = z.infer<typeof schema>
