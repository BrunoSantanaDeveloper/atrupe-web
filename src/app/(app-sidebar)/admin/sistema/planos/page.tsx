'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  IconCheck,
  IconX,
  IconLoader,
  IconLayoutGrid,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Topbar } from '@/components/common/Topbar'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

// Actions
import { getData, updateItemNew } from '@/actions/_cruds'
import { formatCurrencyToBrl } from '@/lib/utils'

interface ManageablePlan {
  id: string
  name: string
  planType: string
  basePrice: number
  additionalUserPrice: number
  isActive: boolean
  badge: { text: string; variant: string } | null
}

export default function AdminPlansPage() {
  const queryClient = useQueryClient()
  const [pendingToggle, setPendingToggle] = useState<{
    plan: ManageablePlan
    next: boolean
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { data: plansRes, isLoading } = useQuery({
    queryKey: ['admin-manageable-plans'],
    queryFn: () => getData({ route: '/plan/manage' }),
  })

  const plans: ManageablePlan[] = plansRes?.success ? plansRes.data : []

  const handleConfirmToggle = async () => {
    if (!pendingToggle) return

    setIsSaving(true)
    try {
      const res = await updateItemNew({
        route: `/plan/${pendingToggle.plan.id}/availability`,
        data: { isActive: pendingToggle.next },
      })

      if (res.success) {
        toast.success(
          pendingToggle.next
            ? `Plano ${pendingToggle.plan.name} disponibilizado para contratação.`
            : `Plano ${pendingToggle.plan.name} removido da contratação.`,
        )
        queryClient.invalidateQueries({
          queryKey: ['admin-manageable-plans'],
        })
        setPendingToggle(null)
      } else {
        toast.error(
          res.message || 'Erro ao atualizar disponibilidade do plano.',
        )
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao conectar ao servidor.'
      toast.error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Planos"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        Ative ou desative a disponibilidade de cada plano na página de
        contratação. Planos indisponíveis aparecem como{' '}
        <span className="font-medium text-gray-800">&quot;Em breve&quot;</span>{' '}
        e não podem ser contratados. Assinaturas já existentes não são afetadas.
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <IconLayoutGrid
                aria-hidden
                size={48}
                className="text-gray-300 mb-2"
              />
              <p className="font-semibold text-gray-700">
                Nenhum plano encontrado
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-600">
                  <th className="p-4">Plano</th>
                  <th className="p-4">Preço base</th>
                  <th className="p-4">Usuário adicional</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Disponível p/ contratação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plans.map((plan) => {
                  const hasPrice = plan.basePrice > 0
                  const toggleDisabled = !plan.isActive && !hasPrice

                  return (
                    <tr
                      key={plan.id}
                      className="hover:bg-gray-50/50 transition-colors text-gray-700"
                    >
                      <td className="p-4 font-semibold text-gray-900">
                        {plan.name}
                        <span className="type-eyebrow block mt-0.5">
                          {plan.planType}
                        </span>
                      </td>
                      <td className="p-4">
                        {hasPrice ? (
                          <span className="font-semibold text-gray-800">
                            {formatCurrencyToBrl(plan.basePrice)}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600">
                            Não definido
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600">
                        {formatCurrencyToBrl(plan.additionalUserPrice)}
                      </td>
                      <td className="p-4">
                        {plan.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <Icon icon={IconCheck} size="sm" />
                            Disponível
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Icon icon={IconX} size="sm" />
                            {plan.badge?.text || 'Indisponível'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-end gap-1">
                          <Switch
                            intent="success"
                            checked={plan.isActive}
                            disabled={toggleDisabled}
                            onCheckedChange={(next) =>
                              setPendingToggle({ plan, next })
                            }
                            aria-label={`Disponibilidade do plano ${plan.name}`}
                          />
                          {toggleDisabled && (
                            <span className="text-xs text-amber-600 text-right max-w-[160px]">
                              Defina um preço base antes de ativar.
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Confirmação de ativação/desativação */}
      <Dialog
        open={!!pendingToggle}
        onOpenChange={(open) => {
          if (!open && !isSaving) setPendingToggle(null)
        }}
      >
        <DialogContent className="sm:max-w-[460px] bg-white p-6 rounded-xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="flex items-center gap-2.5">
              <Icon
                icon={IconAlertTriangle}
                size="lg"
                className="text-[#FF4201]"
              />
              <span>
                {pendingToggle?.next
                  ? 'Disponibilizar plano'
                  : 'Remover plano da contratação'}
              </span>
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="text-sm text-gray-600">
            {pendingToggle?.next ? (
              <p>
                O plano{' '}
                <strong className="text-gray-900">
                  {pendingToggle?.plan.name}
                </strong>{' '}
                ficará visível e disponível para contratação na página de
                planos. Deseja continuar?
              </p>
            ) : (
              <p>
                O plano{' '}
                <strong className="text-gray-900">
                  {pendingToggle?.plan.name}
                </strong>{' '}
                deixará de ser oferecido para novas contratações e passará a
                exibir o selo &quot;Em breve&quot;. Assinaturas já existentes
                não são afetadas. Deseja continuar?
              </p>
            )}
          </DialogBody>

          <DialogFooter className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => setPendingToggle(null)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmToggle}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <Icon icon={IconLoader} size="md" className="animate-spin" />
                  Salvando...
                </span>
              ) : pendingToggle?.next ? (
                'Disponibilizar'
              ) : (
                'Remover'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
