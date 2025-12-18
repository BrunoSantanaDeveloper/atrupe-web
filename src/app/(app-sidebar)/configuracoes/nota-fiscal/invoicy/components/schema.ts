import { z } from 'zod'

export const invoicyConfigSchema = z.object({
  partnerKey: z.string().min(1, 'Partner Key é obrigatório'),
  accessKey: z.string().min(1, 'Access Key é obrigatória'),
  environment: z.enum(['PRODUCAO', 'HOMOLOGACAO']),
  // NF-e
  nfeSeries: z.string().optional().default('1'),
  nfeNextNumber: z.coerce.number().min(1).optional().default(1),
  // NFC-e
  nfceSeries: z.string().optional(),
  nfceNextNumber: z.coerce.number().min(1).optional(),
  // NFS-e
  nfseSeries: z.string().optional(),
  nfseNextNumber: z.coerce.number().min(1).optional(),
  emitIm: z.string().optional(), // Inscrição Municipal
  emitCmun: z.string().optional(), // Código IBGE do município
  codigoServico: z.string().optional(), // Código do serviço municipal
  aliquotaIss: z.coerce.number().min(0).max(100).optional(), // Alíquota ISS
  // Padrões
  defaultCfop: z.string().optional(),
  defaultOperationNature: z.string().optional(),
  taxInfoText: z.string().optional(),
})

export type InvoicyConfigFormType = z.infer<typeof invoicyConfigSchema>
