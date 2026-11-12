import * as z from 'zod'

export const newClientSchema = z
  .object({
    type: z.enum(['PERSON', 'COMPANY']),
    responsibleId: z.string().optional(),
    general: z.object({
      name: z.string().min(1, 'Nome é obrigatório'),
      corporateName: z.string().optional(),
      email: z.string().email('E-mail inválido').optional().or(z.literal('')),
      cpf: z.string().optional(),
      rg: z.string().optional(),
      cnpj: z.string().optional(),
      birthdate: z.date().optional(),
      activity: z.string().optional(),
      categoryId: z.string(),
      phone: z.string(),
      mobile: z.string(),
      notes: z.string().optional(),
      isBranch: z.boolean().optional(),
      stateRegistration: z.string().optional(),
      indicadorIE: z.coerce.number().optional(),
    }),
    addresses: z.array(
      z.object({
        type: z.string(),
        zipcode: z.string(),
        state: z.string(),
        city: z.string(),
        neighborhood: z.string(),
        street: z.string(),
        number: z.string(),
        complement: z.string().optional(),
        country: z.string().optional(),
      }),
    ),
    responsibilities: z.array(
      z.object({
        name: z.string(),
        sector: z.string().optional(),
        email: z.string().email('E-mail inválido').optional().or(z.literal('')),
        phone: z.string().optional(),
        mobile: z.string(),
        notes: z.string().optional(),
      }),
    ),

    creditLimit: z.object({
      minValue: z.number(),
      maxValue: z.number(),
      paymentMethods: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            conditions: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                isActive: z.boolean().default(false),
              }),
            ),
          }),
        )
        .default([]),
      blockClient: z.boolean().default(false),
      // "Exigir pagamento antecipado" (PA-1, 12/11/2026): vem desligada
      requirePrepayment: z.boolean().default(false),
    }),
  })
  .superRefine((data, _ctx) => {
    if (data.type === 'PERSON') {
      /* if (!data.general.cpf) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['general', 'cpf'],
          message: 'CPF é obrigatório para pessoa física',
        })
      } */
      /* if (!data.general.rg) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['general', 'rg'],
          message: 'RG é obrigatório para pessoa física',
        })
      } */
    } else if (data.type === 'COMPANY') {
      /* if (!data.general.cnpj) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['general', 'cnpj'],
          message: 'CNPJ é obrigatório para pessoa jurídica',
        })
      } */
      /* if (!data.general.corporateName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['general', 'corporateName'],
          message: 'Razão social é obrigatório para pessoa jurídica',
        })
      } */
    }
  })

export type NewClientFormType = z.infer<typeof newClientSchema>

export const defaultPersonValues: NewClientFormType = {
  type: 'PERSON',
  responsibleId: '',
  general: {
    name: '',
    email: '',
    cpf: '',
    rg: '',
    birthdate: undefined,
    activity: '',
    categoryId: '',
    phone: '',
    mobile: '',
    notes: '',
    isBranch: false,
    stateRegistration: 'ISENTO',
    indicadorIE: 9,
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
      country: 'Brasil',
    },
  ],
  responsibilities: [
    {
      name: '',
      sector: '',
      email: '',
      phone: '',
      mobile: '',
      notes: '',
    },
  ],
  creditLimit: {
    minValue: 0,
    maxValue: 0,
    paymentMethods: [
      // {
      //   id: '',
      //   name: '',
      //   conditions: [
      //     {
      //       id: '',
      //       name: '',
      //       isActive: true,
      //     },
      //   ],
      // },
    ],
    blockClient: false,
    requirePrepayment: false,
  },
}

export const defaultCompanyValues: NewClientFormType = {
  type: 'COMPANY',
  responsibleId: '',
  general: {
    name: '',
    corporateName: '',
    email: '',
    cnpj: '',
    birthdate: undefined,
    activity: '',
    categoryId: '',
    phone: '',
    mobile: '',
    notes: '',
    isBranch: false,
    stateRegistration: 'ISENTO',
    indicadorIE: 9,
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
      country: 'Brasil',
    },
  ],
  responsibilities: [
    {
      name: '',
      sector: '',
      email: '',
      phone: '',
      mobile: '',
      notes: '',
    },
  ],
  creditLimit: {
    minValue: 0,
    maxValue: 0,
    paymentMethods: [
      // {
      //   id: '',
      //   name: '',
      //   conditions: [
      //     {
      //       id: '',
      //       name: '',
      //       isActive: true,
      //     },
      //   ],
      // },
    ],
    blockClient: false,
    requirePrepayment: false,
  },
}
