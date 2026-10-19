'use server'

import { domainCall } from './domain-call'
import type {
  CompanyResetRecord,
  ResetOptions,
  ResetPreview,
  ResetResult,
} from '@/types/accountReset'

/**
 * "Zerar dados da conta", pelo superadmin: apaga documentos, cadastros e
 * lançamentos e mantém a conta, os usuários, a assinatura e o fiscal.
 */

export async function fetchResetPreview(
  companyId: string,
  options: ResetOptions,
) {
  return domainCall<ResetPreview>((api) =>
    api.get(`/admin/companies/${companyId}/data-reset/preview`, {
      params: {
        includeFiscalDocuments: String(options.includeFiscalDocuments),
        restoreDefaults: String(options.restoreDefaults),
      },
    }),
  )
}

export async function resetCompanyData(
  companyId: string,
  input: ResetOptions & { password: string; confirmation: string },
) {
  return domainCall<ResetResult>((api) =>
    api.post(`/admin/companies/${companyId}/data-reset`, input),
  )
}

export async function fetchCompanyResets(companyId: string) {
  return domainCall<CompanyResetRecord[]>((api) =>
    api.get(`/admin/companies/${companyId}/data-resets`),
  )
}

/** A cópia do que foi apagado, em base64, para o navegador salvar. */
export async function downloadResetBackup(resetId: string) {
  return domainCall<{ filename: string; base64: string }>(async (api) => {
    const res = await api
      .get(`/admin/companies/data-resets/${resetId}/backup`, {
        responseType: 'arraybuffer',
      })
      .catch((error) => {
        // O corpo do erro também chega em bytes; sem decodificar, a mensagem
        // ("a cópia já foi descartada") se perde.
        if (error?.response?.data) {
          try {
            error.response.data = JSON.parse(
              Buffer.from(error.response.data).toString('utf8'),
            )
          } catch {
            // Não era JSON: fica a mensagem genérica.
          }
        }
        throw error
      })
    const disposition = String(res.headers['content-disposition'] ?? '')
    const filename =
      disposition.match(/filename="([^"]+)"/)?.[1] ??
      `zerar-dados-${resetId}.json.gz`
    return {
      data: {
        filename,
        base64: Buffer.from(res.data as ArrayBuffer).toString('base64'),
      },
    }
  })
}
