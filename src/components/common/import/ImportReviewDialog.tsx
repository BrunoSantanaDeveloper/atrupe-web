'use client'

import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  IconAlertCircle,
  IconArrowRight,
  IconListCheck,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

import type { ImportReference, ImportWarning } from '@/actions/import'

const REFERENCE_LABELS: Record<ImportReference['type'], string> = {
  nature: 'Naturezas',
  subCategory: 'Subcategorias',
  bankAccount: 'Contas bancárias',
}

const REFERENCE_ORDER: ImportReference['type'][] = [
  'nature',
  'subCategory',
  'bankAccount',
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Cadastros citados na planilha que serão criados ao confirmar */
  missingRecords?: ImportReference[]
  /** Valores mal formados em campo opcional que serão normalizados */
  warnings?: ImportWarning[]
  isConfirming?: boolean
  onConfirm: () => void
}

/**
 * Revisão antes de importar.
 *
 * Junta as duas pendências que não deveriam barrar o arquivo inteiro: cadastro
 * que a planilha cita e a empresa não tem (criável a partir do próprio arquivo)
 * e valor mal formado em campo opcional (normalizável). O usuário vê o que vai
 * acontecer e confirma, em vez de ter que editar o CSV ou sair da tela.
 */
export function ImportReviewDialog({
  open,
  onOpenChange,
  missingRecords = [],
  warnings = [],
  isConfirming,
  onConfirm,
}: Props) {
  const groups = REFERENCE_ORDER.map((type) => ({
    type,
    label: REFERENCE_LABELS[type],
    items: missingRecords.filter((record) => record.type === type),
  })).filter((group) => group.items.length > 0)

  const hasRecords = missingRecords.length > 0
  const hasWarnings = warnings.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconListCheck} />
            <DialogTitle>Revisar antes de importar</DialogTitle>
            <DialogDescription className="sr-only">
              Confirme os cadastros que serão criados e os valores que serão
              ajustados para continuar a importação
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="max-h-[60vh] overflow-y-auto">
          {hasRecords && (
            <section>
              <p className="text-sm text-gray-600">
                A planilha usa {missingRecords.length} cadastro(s) que ainda não
                existem nesta empresa. Podemos criá-los agora para continuar:
              </p>

              {groups.map((group) => (
                <div key={group.type} className="mt-4">
                  <p className="type-eyebrow mb-2">
                    {group.label} ({group.items.length})
                  </p>
                  <ul className="bg-white border border-gray-200 rounded-md divide-y divide-gray-200">
                    {group.items.map((item) => (
                      <li
                        key={`${item.type}-${item.name}-${item.parent ?? ''}`}
                        className="px-4 py-3 text-sm text-gray-900 flex items-center justify-between gap-4"
                      >
                        <span className="font-medium">{item.name}</span>
                        {item.parent && (
                          <span className="text-xs text-gray-500 shrink-0">
                            em {item.parent}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {groups.some((group) => group.type === 'bankAccount') && (
                <Alert variant="warning" className="mt-4">
                  <IconAlertCircle size={ICON_SIZE.sm} />
                  <AlertDescription>
                    As contas bancárias serão criadas sem instituição definida.
                    Você pode ajustar o banco depois em Configurações &gt;
                    Financeiro &gt; Contas bancárias.
                  </AlertDescription>
                </Alert>
              )}
            </section>
          )}

          {hasWarnings && (
            <section className={hasRecords ? 'mt-6' : undefined}>
              <p className="text-sm text-gray-600">
                {warnings.length} valor(es) em campo opcional serão ajustados.
                As linhas serão importadas normalmente:
              </p>

              <ul className="mt-4 bg-white border border-gray-200 rounded-md divide-y divide-gray-200">
                {warnings.map((warning, index) => (
                  <li
                    key={`${warning.row}-${warning.field}-${index}`}
                    className="px-4 py-3 text-sm"
                  >
                    <p className="text-gray-900">
                      <span className="text-gray-500">
                        Linha {warning.row} · {warning.field}
                      </span>{' '}
                      <span className="line-through">{warning.value}</span>{' '}
                      <span className="text-gray-500">→</span>{' '}
                      {warning.newValue ? (
                        <span className="font-medium">{warning.newValue}</span>
                      ) : (
                        <span className="text-gray-400 italic">em branco</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {warning.error}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </DialogBody>

        <DialogFooter>
          <Button
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isConfirming}
            RightIcon={IconArrowRight}
          >
            {hasRecords ? 'Cadastrar e importar' : 'Importar mesmo assim'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
