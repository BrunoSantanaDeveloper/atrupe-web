'use client'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { maskCnpj, maskCpf } from '@/lib/utils'

export interface ContractParties {
  contractorType: 'PJ' | 'PF'
  contractorName: string
  contractorDocument: string
  representativeName?: string | null
  representativeCpf?: string | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  html?: string
  version?: number
  parties: ContractParties
  onAccept: () => void
}

/**
 * Os Termos de Contratação sobre a tela, com as partes já nomeadas.
 *
 * Sem rolagem obrigatória: exigir chegar ao fim antes de aceitar foi removido
 * no protótipo — o aceite vale pelo que está escrito, não pela barra de
 * rolagem.
 */
export function TermsDialog({
  open,
  onOpenChange,
  html,
  version,
  parties,
  onAccept,
}: Props) {
  const document =
    parties.contractorType === 'PJ'
      ? `CNPJ ${maskCnpj(parties.contractorDocument)}`
      : `CPF ${maskCpf(parties.contractorDocument)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Termos de Contratação</DialogTitle>
          <DialogDescription>
            Contrato de Licença de Uso de Software e Suporte Técnico
            {version ? ` — versão ${version}` : ''}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="overflow-y-auto px-6 py-4 space-y-6">
          <section className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-2">
            <p className="font-semibold text-gray-800">Das partes</p>
            <p>
              <strong>CONTRATADA:</strong> ATRUPE SISTEMAS ADMINISTRATIVOS LTDA.
            </p>
            <p>
              <strong>CONTRATANTE:</strong>{' '}
              {parties.contractorName || '(a preencher)'}
              {parties.contractorDocument ? `, ${document}` : ''}
              {parties.contractorType === 'PJ' && parties.representativeName
                ? `, neste ato representada por ${parties.representativeName}${
                    parties.representativeCpf
                      ? `, CPF ${maskCpf(parties.representativeCpf)}`
                      : ''
                  }`
                : ''}
              .
            </p>
          </section>

          {html ? (
            <div
              className="prose prose-sm max-w-none text-gray-700"
              // Texto dos termos vindo do nosso backend (o .docx convertido).
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
            </div>
          )}
        </DialogBody>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            onClick={() => {
              onAccept()
              onOpenChange(false)
            }}
          >
            Estou de acordo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
