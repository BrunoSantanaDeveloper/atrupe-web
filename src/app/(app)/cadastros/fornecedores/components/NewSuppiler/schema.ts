import * as z from 'zod'

export const newSupplierSchema = z.object({
  type: z.enum(['PERSON', 'COMPANY']),
  general: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    cnpj: z.string().optional(),
    corporateName: z.string().optional(),
    activity: z.string().optional(),
    category: z.string(),
    phone: z.string(),
    mobile: z.string(),
    notes: z.string().optional(),
  }),
  addresses: z
    .array(
      z.object({
        type: z.string().optional(),
        zipcode: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        neighborhood: z.string().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
      }),
    )
    .optional(),
  responsibilities: z.array(
    z.object({
      name: z.string(),
      email: z.string().email('Email inválido').optional().or(z.literal('')),
      phone: z.string().optional(),
      mobile: z.string(),
      notes: z.string().optional(),
    }),
  ),
})

export type NewSupplierFormType = z.infer<typeof newSupplierSchema>

export const defaultPersonValues: NewSupplierFormType = {
  type: 'PERSON',
  general: {
    name: '',
    email: '',
    cpf: '',
    rg: '',
    activity: '',
    category: '',
    phone: '',
    mobile: '',
    notes: '',
  },
  addresses: [
    {
      type: 'Principal',
      zipcode: '',
      state: '',
      city: '',
      neighborhood: '',
      street: '',
      number: '',
      complement: '',
    },
  ],
  responsibilities: [
    {
      name: '',
      email: '',
      phone: '',
      mobile: '',
      notes: '',
    },
  ],
}

export const defaultCompanyValues: NewSupplierFormType = {
  type: 'COMPANY',
  general: {
    name: '',
    email: '',
    cnpj: '',
    corporateName: '',
    activity: '',
    category: '',
    phone: '',
    mobile: '',
    notes: '',
  },
  addresses: [
    {
      type: 'Principal',
      zipcode: '',
      state: '',
      city: '',
      neighborhood: '',
      street: '',
      number: '',
      complement: '',
    },
  ],
  responsibilities: [
    {
      name: '',
      email: '',
      phone: '',
      mobile: '',
      notes: '',
    },
  ],
}
