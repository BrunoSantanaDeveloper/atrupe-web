'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyToBrl } from '@/lib/utils'

import { RemoveModuleDialog } from './RemoveModuleDialog'

interface ContractedModule {
  feature: { name: string; key: string }
  /** Em centavos, como a assinatura guarda. */
  price: number
  isActive: boolean
  createdAt?: string
}

interface Props {
  subscriptionId: string
  modules: ContractedModule[]
  /** Retirar e incluir módulos é do Usuário nº 1 (contrato 1.1, 4.2). */
  isPrincipalAdmin: boolean
  /** Assinatura paga e ativa: no teste ou encerrada, não há o que mudar. */
  canChange: boolean
}

/**
 * Os módulos contratados à parte, cada um com a própria retirada: o cliente
 * tira só o módulo, sem cancelar a assinatura. O acesso sai na hora, e o valor
 * sai das mensalidades ainda não pagas.
 */
export function ModulesSection({
  subscriptionId,
  modules,
  isPrincipalAdmin,
  canChange,
}: Props) {
  const [removing, setRemoving] = useState<ContractedModule | null>(null)
  const active = modules.filter((m) => m.isActive !== false && m.feature?.key)
  const canEdit = canChange && isPrincipalAdmin

  return (
    <Card data-modulos>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-base">Módulos contratados</CardTitle>
        {canEdit && (
          <Button
            asChild
            variant="neutralOutline"
            size="sm"
            LeftIcon={IconPlus}
          >
            <Link href="/assinatura">Incluir módulo</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {active.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum módulo contratado à parte.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {active.map((module) => (
              <li
                key={module.feature.key}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {module.feature.name}
                  </p>
                  <p className="text-gray-500">
                    {formatCurrencyToBrl(module.price)}/mês
                    {module.createdAt
                      ? ` · desde ${format(new Date(module.createdAt), 'dd/MM/yyyy', { locale: ptBR })}`
                      : ''}
                  </p>
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    variant="neutralOutline"
                    size="sm"
                    onClick={() => setRemoving(module)}
                  >
                    Retirar módulo
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
        {canChange && !isPrincipalAdmin && active.length > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            Só o administrador principal da conta (Usuário nº 1) inclui ou
            retira módulos.
          </p>
        )}
      </CardContent>

      {removing && (
        <RemoveModuleDialog
          open
          onOpenChange={(open) => !open && setRemoving(null)}
          subscriptionId={subscriptionId}
          moduleKey={removing.feature.key}
          moduleName={removing.feature.name}
          modulePrice={removing.price}
        />
      )}
    </Card>
  )
}
