'use client'

// UI
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog'

// Third-party
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { contractorDocumentLabel, type AcceptedContract } from './contract'

interface ContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contract: AcceptedContract
}

/**
 * O contrato aceito, como foi aceito: as partes nomeadas no topo, o texto da
 * versão aceita e os dados do aceite no rodapé.
 */
export function ContractModal({
  open,
  onOpenChange,
  contract,
}: ContractModalProps) {
  const { contractor, representative } = contract

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Contrato de Assinatura</DialogTitle>
          <DialogDescription>
            {contract.name || `Versão ${contract.version}`}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="overflow-y-auto px-6 py-4 space-y-6">
          {contractor && (
            <section className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-2">
              <p className="font-semibold text-gray-800">Das partes</p>
              <p>
                <strong>CONTRATADA:</strong> ATRUPE SISTEMAS ADMINISTRATIVOS
                LTDA.
              </p>
              <p>
                <strong>CONTRATANTE:</strong> {contractor.name},{' '}
                {contractorDocumentLabel(contractor)}
                {contractor.type === 'PJ' && representative
                  ? `, neste ato representada por ${representative.name}${
                      representative.cpf ? `, CPF ${representative.cpf}` : ''
                    }`
                  : ''}
                .
              </p>
              {contract.principalAdmin && (
                <p>
                  <strong>
                    ADMINISTRADOR PRINCIPAL DA CONTA (Usuário nº 1):
                  </strong>{' '}
                  {contract.principalAdmin.name}
                  {contract.principalAdmin.email
                    ? ` (${contract.principalAdmin.email})`
                    : ''}
                  .
                </p>
              )}
            </section>
          )}

          <div
            className="prose prose-sm max-w-none text-gray-700"
            // Texto da versão aceita, gravado pela Atrupe no backend.
            dangerouslySetInnerHTML={{ __html: contract.html || '' }}
          />
        </DialogBody>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between mt-6">
          <div className="flex flex-col gap-1 text-xs text-gray-500 text-left mb-4 sm:mb-0">
            <span>
              <strong>Aceito em:</strong>{' '}
              {format(new Date(contract.acceptedAt), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
              {contract.acceptedBy
                ? ` por ${contract.acceptedBy.name} (${contract.acceptedBy.email})`
                : ''}
            </span>
            {contract.ipAddress && (
              <span>
                <strong>IP de aceite:</strong> {contract.ipAddress}
              </span>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
