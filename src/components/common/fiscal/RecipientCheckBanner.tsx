'use client'

// O que falta do destinatário para a nota sair (Lista Lite 19/11, item 9;
// decisão do Maicol, 20/11/2026). O cliente regularizado segue com a regra de
// hoje; quem confere é a emissão. A regra é a mesma do servidor
// (recipient-check.ts), aplicada aos dados que estão na tela, porque a
// emissão deixa editar o destinatário. O servidor confere de novo ao emitir.

import Link from 'next/link'

import { AlertBanner } from '@/components/ui/alert-banner'
import { Button } from '@/components/ui/button'
import { AiContextButton } from '@/components/ai/AiContextButton'

import { IconAlertTriangle } from '@tabler/icons-react'

export type FiscalDoc = 'NFE' | 'NFSE'

export type RecipientData = {
  document?: string | null
  name?: string | null
  zipcode?: string | null
  state?: string | null
  city?: string | null
  neighborhood?: string | null
  street?: string | null
  number?: string | null
  indicadorIE?: number | null
  stateRegistration?: string | null
  foreign?: boolean
}

const filled = (value?: string | null) => !!value && !!String(value).trim()

export function missingRecipientFields(doc: FiscalDoc, data: RecipientData) {
  const missing: string[] = []
  const digits = (data.document || '').replace(/\D/g, '')
  if (!data.foreign && digits.length !== 11 && digits.length !== 14) {
    missing.push('CPF ou CNPJ')
  }
  if (!filled(data.name)) missing.push('Nome ou razão social')
  if (data.foreign) return missing
  if (!filled(data.zipcode)) missing.push('CEP')
  if (doc === 'NFSE') return missing
  if (!filled(data.street)) missing.push('Rua')
  if (!filled(data.number)) missing.push('Número (ou S/N)')
  if (!filled(data.neighborhood)) missing.push('Bairro')
  if (!filled(data.city)) missing.push('Cidade')
  if (!filled(data.state)) missing.push('UF')
  if (Number(data.indicadorIE) === 1 && !filled(data.stateRegistration)) {
    missing.push('Inscrição estadual (contribuinte do ICMS)')
  }
  return missing
}

export function RecipientCheckBanner({
  doc,
  data,
  clientId,
  clientName,
  onEdit,
}: {
  doc: FiscalDoc
  data: RecipientData
  clientId?: string | null
  clientName?: string | null
  onEdit?: () => void
}) {
  const missing = missingRecipientFields(doc, data)
  if (!missing.length) return null

  const who = doc === 'NFSE' ? 'tomador' : 'destinatário'
  const note = doc === 'NFSE' ? 'NFS-e' : 'NF-e'

  return (
    <AlertBanner
      variant="warning"
      icon={IconAlertTriangle}
      className="rounded-lg border"
      title={`Faltam dados do ${who} para emitir a ${note}`}
      description={
        <div className="space-y-3">
          <p>
            {missing.join(', ')}. A nota não sai sem eles: complete aqui na
            emissão ou no cadastro do cliente.
          </p>
          <div className="flex flex-wrap gap-2">
            {onEdit ? (
              <Button
                type="button"
                size="sm"
                variant="neutralOutline"
                onClick={onEdit}
              >
                Editar {who}
              </Button>
            ) : null}
            {clientId ? (
              <Button type="button" size="sm" variant="neutralOutline" asChild>
                <Link href={`/cadastros/clientes/${clientId}/dados`}>
                  Completar cadastro
                </Link>
              </Button>
            ) : null}
            <AiContextButton
              label="Pedir ajuda ao assistente"
              message={`Para emitir a ${note} do cliente ${clientName || ''}, faltam no cadastro: ${missing.join(', ')}. Como encontro e completo esses dados? Se der para buscar pelo CPF ou CNPJ, me diga o que você encontrou antes de eu salvar.`}
            />
          </div>
        </div>
      }
    />
  )
}
