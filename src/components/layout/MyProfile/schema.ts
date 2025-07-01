import * as z from 'zod'

export const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sectorId: z.string().min(1, 'Setor é obrigatório'),
  roleId: z.string().min(1, 'Cargo é obrigatório'),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  avatarUrl: z.string().optional(),
  address: z.object({
    zipcode: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    neighborhood: z.string().optional(),
    number: z.string().optional(),
    street: z.string().optional(),
    complement: z.string().optional(),
  }),
})

export type FormType = z.infer<typeof schema>
