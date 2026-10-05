import { z } from 'zod'

/**
 * Orçamento. Na venda rápida (quickSale) o cliente é opcional: ela pode ser
 * feita no balcão e o cliente informado depois, em "Informar cliente".
 */
export const quotationSchema = z
  .object({
    // O campo só aparece em conta multiempresa; a mensagem é o que o aviso
    // de formulário inválido mostra quando ele falha escondido.
    companyId: z.string({
      required_error: 'empresa do orçamento não identificada',
    }),
    clientId: z
      .object({
        label: z.string().optional(),
        value: z.string().optional(),
      })
      .nullable()
      .optional(),
    contactId: z.string(),
    description: z.string(),
    contactSourceId: z.string(),
    seriesId: z.string().min(1, { message: 'Selecione uma série' }),
    sellerId: z.string().min(1, { message: 'Selecione um vendedor' }),
    quickSale: z.boolean().default(false),
    createdAt: z.date().optional(),
    quotationNumber: z.coerce.number().int().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.quickSale && !data.clientId?.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['clientId'],
        message: 'Selecione um cliente',
      })
    }
  })
  .transform((data) => ({
    ...data,
    clientId: data.clientId?.value || undefined,
  }))

export type QuotationFormType = z.infer<typeof quotationSchema>
