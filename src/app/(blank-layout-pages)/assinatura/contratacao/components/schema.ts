import { z } from 'zod'
import { HandleValidateCnpj, HandleValidateCpf } from '@/lib/validateDocs'

/**
 * Formulário das etapas do contrato e do pagamento. Um só formulário para as
 * duas etapas: voltar do pagamento ao contrato preserva tudo o que foi
 * preenchido.
 *
 * Só o que a contratação exige: empresa pede CNPJ, e-mail corporativo e o CPF
 * de quem responde por ela; pessoa física, nome, CPF e e-mail. Nada de
 * endereço ou faturamento.
 */
export const contractingSchema = z
  .object({
    personType: z.enum(['PJ', 'PF']),
    email: z
      .string()
      .min(1, 'Informe o e-mail.')
      .email('Informe um e-mail válido.'),
    // Empresa
    cnpj: z.string().optional(),
    legalName: z.string().optional(),
    tradeName: z.string().optional(),
    representativeCpf: z.string().optional(),
    representativeName: z.string().optional(),
    representativeIsSelf: z.boolean().default(false),
    // Pessoa física
    name: z.string().optional(),
    cpf: z.string().optional(),
    // Contrato e pagamento
    termsAccepted: z.boolean().default(false),
    billingType: z.enum(['CREDIT_CARD', 'PIX', 'BOLETO']),
    couponCode: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.personType === 'PJ') {
      if (!v.cnpj || !HandleValidateCnpj(v.cnpj)) {
        ctx.addIssue({
          code: 'custom',
          path: ['cnpj'],
          message: 'CNPJ inválido.',
        })
      }
      if (!v.representativeCpf || !HandleValidateCpf(v.representativeCpf)) {
        ctx.addIssue({
          code: 'custom',
          path: ['representativeCpf'],
          message: 'Informe um CPF válido.',
        })
      }
    } else {
      if (!v.name || v.name.trim().length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['name'],
          message: 'Informe o nome completo.',
        })
      }
      if (!v.cpf || !HandleValidateCpf(v.cpf)) {
        ctx.addIssue({
          code: 'custom',
          path: ['cpf'],
          message: 'CPF inválido.',
        })
      }
    }
  })

export type ContractingForm = z.infer<typeof contractingSchema>

/** Campos da etapa do contrato, validados ao clicar em "Contratar". */
export const CONTRACT_STEP_FIELDS: (keyof ContractingForm)[] = [
  'personType',
  'email',
  'cnpj',
  'legalName',
  'representativeCpf',
  'representativeName',
  'name',
  'cpf',
]
