import { z } from 'zod'

// Nota: Partner Key e Access Key são credenciais globais da Atrupe
// e são configuradas via variáveis de ambiente no backend
export const invoicyConfigSchema = z.object({
  environment: z.enum(['PRODUCAO', 'HOMOLOGACAO']),
  // NF-e
  nfeSeries: z.string().optional().default('1'),
  nfeNextNumber: z.coerce.number().min(1).optional().default(1),
  // NFC-e
  nfceSeries: z.string().optional(),
  nfceNextNumber: z.coerce.number().min(1).optional(),
  cscId: z.string().optional(),
  cscToken: z.string().optional(),
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
  sendDanfeXmlAutomatically: z.boolean().optional().default(false),
  sendDanfeAutomatically: z.boolean().optional().default(true),
  sendXmlAutomatically: z.boolean().optional().default(true),
  sendFiscalEmailCopyTo: z
    .string()
    .email('E-mail invalido')
    .optional()
    .or(z.literal('')),
})

export type InvoicyConfigFormType = z.infer<typeof invoicyConfigSchema>
