import { z } from 'zod'

export const invoicyConfigSchema = z.object({
  partnerKey: z.string().min(1, 'Partner Key é obrigatório'),
  accessKey: z.string().min(1, 'Access Key é obrigatória'),
  environment: z.enum(['PRODUCAO', 'HOMOLOGACAO']),
  nfeSeries: z.string().optional().default('1'),
  nfeNextNumber: z.coerce.number().min(1).optional().default(1),
  nfceSeries: z.string().optional(),
  nfceNextNumber: z.coerce.number().min(1).optional(),
  nfseSeries: z.string().optional(),
  nfseNextNumber: z.coerce.number().min(1).optional(),
  defaultCfop: z.string().optional(),
  defaultOperationNature: z.string().optional(),
  taxInfoText: z.string().optional(),
})

export type InvoicyConfigFormType = z.infer<typeof invoicyConfigSchema>
