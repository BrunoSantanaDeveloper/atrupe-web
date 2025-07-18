import { z } from 'zod'

export const schema = z.object({
  code: z.string().min(1, 'Informe o código da série de venda'),
  description: z.string().min(1, 'Informe a descrição da série de venda'),
  title: z.string().min(1, 'Informe o título da série de venda'),
  currentBudgetNumber: z.number().readonly().optional(),
  proposalValidity: z.coerce
    .number()
    .min(1, 'Informe a validade da proposta')
    .max(999, 'A validade da proposta deve ser menor que 999'),
  deliveryDeadline: z.coerce
    .number()
    .min(1, 'Informe o prazo de entrega')
    .max(999, 'O prazo de entrega deve ser menor que 999'),
  billing: z.string().min(1, 'Informe o tipo de faturamento'),
  sendToProduction: z
    .string()
    .min(1, 'Informe o status de envio para produção'),
  productionStatus: z.string().min(1, 'Informe o status de produção'),
  isDefault: z.boolean().default(false),
})

export type FormType = z.infer<typeof schema>
