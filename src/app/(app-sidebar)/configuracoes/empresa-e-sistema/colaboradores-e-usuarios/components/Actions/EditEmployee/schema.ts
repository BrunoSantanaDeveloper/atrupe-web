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
  // Forma de contratação e salário base (ALT-18): geram os encargos da folha.
  // Vazio é "não informada"; o salário em centavos, nulo enquanto ninguém
  // informou
  contract: z.enum(['CLT', 'PRO_LABORE', 'MEI_PJ']).or(z.literal('')),
  baseSalary: z
    .number()
    .int()
    .min(0, 'O salário base não pode ser negativo')
    .nullable(),
  address: z.object({
    // O endereço é opcional: o colaborador nasce sem ele, e a edição não
    // pode exigir o CEP para salvar o salário. Preenchido, precisa estar certo
    zipcode: z
      .string()
      .refine((value) => !value || value.replace(/\D/g, '').length === 8, {
        message: 'CEP inválido',
      }),
    state: z.string(),
    city: z.string(),
    neighborhood: z.string(),
    number: z.string(),
    street: z.string(),
    complement: z.string(),
  }),
})

export type FormType = z.infer<typeof schema>
