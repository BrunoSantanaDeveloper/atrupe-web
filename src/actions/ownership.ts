'use server'

import { clientMeta, domainCall } from './domain-call'
import type { RepresentativeCheck } from '@/types/checkout'
import type {
  AcceptTransferRequest,
  AcceptTransferResult,
  FiscalHistoryLock,
  InviteCompanyView,
  OwnershipView,
  TransferInvite,
} from '@/types/ownership'

/**
 * Transferência de titularidade.
 *
 * Do lado de dentro (titular): ver, enviar e cancelar. Do lado do convite
 * (quem recebe, ainda sem conta): abrir o link, consultar o CNPJ, conferir o
 * representante e aceitar. O token do convite vai sempre no corpo, nunca no
 * endereço da chamada.
 */

export async function fetchOwnership() {
  return domainCall<OwnershipView>((api) => api.get('/ownership'))
}

export async function sendOwnershipTransfer(targetEmail: string) {
  return domainCall<OwnershipView>((api) =>
    api.post('/ownership/transfer', {
      targetEmail,
      confirmLossOfAccess: true,
    }),
  )
}

export async function cancelOwnershipTransfer() {
  return domainCall<OwnershipView>((api) => api.delete('/ownership/transfer'))
}

export async function fetchFiscalHistoryLock() {
  return domainCall<FiscalHistoryLock | null>((api) =>
    api.get('/ownership/fiscal-history'),
  )
}

export async function openTransferInvite(token: string) {
  return domainCall<TransferInvite>((api) =>
    api.post('/ownership/invite', { token }),
  )
}

export async function lookupInviteCompany(token: string, cnpj: string) {
  return domainCall<InviteCompanyView>((api) =>
    api.post('/ownership/invite/company', {
      token,
      cnpj: cnpj.replace(/\D/g, ''),
    }),
  )
}

export async function checkInviteRepresentative(
  token: string,
  cnpj: string,
  cpf: string,
) {
  return domainCall<RepresentativeCheck>((api) =>
    api.post('/ownership/invite/representative-check', { token, cnpj, cpf }),
  )
}

export async function acceptTransferInvite(input: AcceptTransferRequest) {
  const meta = await clientMeta()
  return domainCall<AcceptTransferResult>((api) =>
    api.post('/ownership/invite/accept', input, { headers: meta }),
  )
}
