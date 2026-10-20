'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  IconPlus,
  IconEdit,
  IconEye,
  IconTicket,
  IconCheck,
  IconX,
  IconCalendar,
  IconTrash,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Topbar } from '@/components/common/Topbar'
import { Separator } from '@/components/ui/separator'
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
import { getData, createItemNew, updateItemNew } from '@/actions/_cruds'
import { formatCurrencyToBrl } from '@/lib/utils'
import { FeaturedIcon } from '@/components/ui/featured-icon'

interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: 'PERCENT' | 'VALUE'
  discountValue: number // centavos se VALUE, porcentagem se PERCENT
  durationType: 'ONCE' | 'RECURRING' | 'MONTHS'
  durationMonths: number | null
  maxUses: number | null
  currentUses: number
  maxUsesPerCompany: number
  minPlanValue: number | null // em centavos
  validFrom: string
  validUntil: string | null
  isActive: boolean
  appliesToPlans: string[]
  appliesToModules: boolean
  createdAt: string
}

interface CouponUsage {
  id: string
  couponId: string
  companyId: string
  subscriptionId: string | null
  discountApplied: number
  originalValue: number
  finalValue: number
  createdAt: string
}

interface Plan {
  id: string
  name: string
  basePrice: number
}

export default function AdminCouponsPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUsagesOpen, setIsUsagesOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [selectedCouponForUsages, setSelectedCouponForUsages] =
    useState<Coupon | null>(null)
  const [search, setSearch] = useState('')

  // Form states
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<'PERCENT' | 'VALUE'>(
    'PERCENT',
  )
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [durationType, setDurationType] = useState<
    'ONCE' | 'RECURRING' | 'MONTHS'
  >('ONCE')
  const [durationMonths, setDurationMonths] = useState<number>(1)
  const [maxUses, setMaxUses] = useState<string>('')
  const [maxUsesPerCompany, setMaxUsesPerCompany] = useState<number>(1)
  const [minPlanValue, setMinPlanValue] = useState<string>('')
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [appliesToPlans, setAppliesToPlans] = useState<string[]>([])
  const [appliesToModules, setAppliesToModules] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch Coupons
  const { data: couponsRes, isLoading: isLoadingCoupons } = useQuery({
    queryKey: ['admin-coupons-list', search],
    queryFn: () => getData({ route: `/coupons?search=${search}` }),
  })

  // Fetch Plans for AppliesToPlans restriction
  const { data: plansRes } = useQuery({
    queryKey: ['admin-plans-list'],
    queryFn: () => getData({ route: '/plan/public/subscription' }),
  })

  // Fetch Usages
  const { data: usagesRes, isLoading: isLoadingUsages } = useQuery({
    queryKey: ['admin-coupon-usages', selectedCouponForUsages?.id],
    queryFn: () => {
      if (!selectedCouponForUsages) {
        throw new Error('Nenhum cupom selecionado')
      }
      return getData({ route: `/coupons/${selectedCouponForUsages.id}/usages` })
    },
    enabled: !!selectedCouponForUsages,
  })

  const coupons: Coupon[] = couponsRes?.success ? couponsRes.data : []
  const plans: Plan[] = plansRes?.success ? plansRes.data : []
  const usages: CouponUsage[] = usagesRes?.success ? usagesRes.data : []

  const handleOpenCreateDialog = () => {
    setEditingCoupon(null)
    setCode('')
    setDescription('')
    setDiscountType('PERCENT')
    setDiscountValue(0)
    setDurationType('ONCE')
    setDurationMonths(1)
    setMaxUses('')
    setMaxUsesPerCompany(1)
    setMinPlanValue('')
    setValidFrom(new Date().toISOString().split('T')[0])
    setValidUntil('')
    setAppliesToPlans([])
    setAppliesToModules(true)
    setIsActive(true)
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setCode(coupon.code)
    setDescription(coupon.description || '')
    setDiscountType(coupon.discountType)
    // Convert cents back to real decimal for value discounts
    setDiscountValue(
      coupon.discountType === 'VALUE'
        ? coupon.discountValue / 100
        : coupon.discountValue,
    )
    setDurationType(coupon.durationType)
    setDurationMonths(coupon.durationMonths || 1)
    setMaxUses(coupon.maxUses?.toString() || '')
    setMaxUsesPerCompany(coupon.maxUsesPerCompany)
    setMinPlanValue(
      coupon.minPlanValue ? (coupon.minPlanValue / 100).toString() : '',
    )
    setValidFrom(coupon.validFrom ? coupon.validFrom.split('T')[0] : '')
    setValidUntil(coupon.validUntil ? coupon.validUntil.split('T')[0] : '')
    setAppliesToPlans(coupon.appliesToPlans || [])
    setAppliesToModules(coupon.appliesToModules)
    setIsActive(coupon.isActive)
    setIsDialogOpen(true)
  }

  const handleOpenUsages = (coupon: Coupon) => {
    setSelectedCouponForUsages(coupon)
    setIsUsagesOpen(true)
  }

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) {
      toast.warning('O código do cupom é obrigatório.')
      return
    }

    setIsSaving(true)

    // Convert values to cents for internal consistency
    const finalDiscountValue =
      discountType === 'VALUE' ? discountValue * 100 : discountValue
    const finalMinPlanValue = minPlanValue
      ? parseFloat(minPlanValue) * 100
      : null

    const data = {
      code: code.trim().toUpperCase(),
      description: description.trim() || null,
      discountType,
      discountValue: finalDiscountValue,
      durationType,
      durationMonths: durationType === 'MONTHS' ? durationMonths : null,
      maxUses: maxUses ? parseInt(maxUses) : null,
      maxUsesPerCompany,
      minPlanValue: finalMinPlanValue,
      validFrom: validFrom ? new Date(validFrom).toISOString() : undefined,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      isActive,
      appliesToPlans,
      appliesToModules,
    }

    try {
      let res
      if (editingCoupon) {
        res = await updateItemNew({
          route: `/coupons/${editingCoupon.id}`,
          data,
        })
      } else {
        res = await createItemNew({
          route: '/coupons',
          data,
        })
      }

      if (res.success) {
        toast.success(
          editingCoupon
            ? 'Cupom atualizado com sucesso!'
            : 'Cupom criado com sucesso!',
        )
        queryClient.invalidateQueries({ queryKey: ['admin-coupons-list'] })
        setIsDialogOpen(false)
      } else {
        toast.error(res.message || 'Erro ao salvar cupom.')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao conectar ao servidor.'
      toast.error(errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeactivateCoupon = async (coupon: Coupon) => {
    const confirm = window.confirm(`Deseja desativar o cupom ${coupon.code}?`)
    if (!confirm) return

    try {
      const res = await updateItemNew({
        route: `/coupons/${coupon.id}`,
        data: { isActive: false },
      })

      if (res.success) {
        toast.success('Cupom desativado com sucesso!')
        queryClient.invalidateQueries({ queryKey: ['admin-coupons-list'] })
      } else {
        toast.error(res.message || 'Erro ao desativar cupom.')
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Erro ao desativar cupom.'
      toast.error(errorMsg)
    }
  }

  const handlePlanToggle = (planId: string) => {
    setAppliesToPlans((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId],
    )
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Cupons de Desconto"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />

      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 max-w-sm w-full bg-white rounded-lg border border-gray-200 px-3 py-1.5">
          <Icon icon={IconTicket} size="md" className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código ou descrição..."
            className="w-full bg-transparent border-0 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button
          type="button"
          onClick={handleOpenCreateDialog}
          className="flex items-center gap-1.5 h-10 px-4 text-sm font-semibold"
        >
          <Icon icon={IconPlus} size="md" />
          Criar Cupom
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isLoadingCoupons ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
              <FeaturedIcon
                tone="neutral"
                size="lg"
                Icon={IconTicket}
                className="mb-2"
              />
              <p className="font-semibold text-gray-700">
                Nenhum cupom cadastrado
              </p>
              <p className="text-sm">
                Clique em &quot;Criar Cupom&quot; para começar.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-600">
                  <th className="p-4">Código</th>
                  <th className="p-4">Desconto</th>
                  <th className="p-4">Duração</th>
                  <th className="p-4 text-center">Usos</th>
                  <th className="p-4">Validade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => {
                  const isExpired =
                    coupon.validUntil &&
                    new Date(coupon.validUntil) < new Date()

                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-gray-50/50 transition-colors text-gray-700"
                    >
                      <td className="p-4 font-semibold text-gray-900">
                        <span className="type-eyebrow bg-orange-50 border border-orange-100 text-orange-700 px-2 py-0.5 rounded font-mono">
                          {coupon.code}
                        </span>
                        {coupon.description && (
                          <span className="block text-xs text-gray-400 font-normal mt-1 max-w-[200px] truncate">
                            {coupon.description}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {coupon.discountType === 'PERCENT' ? (
                          <span className="font-semibold text-gray-800">
                            {coupon.discountValue}%
                          </span>
                        ) : (
                          <span className="font-semibold text-gray-800">
                            {formatCurrencyToBrl(coupon.discountValue)}
                          </span>
                        )}
                        {coupon.minPlanValue && (
                          <span className="block text-xs text-gray-400 font-normal mt-0.5">
                            Mínimo: {formatCurrencyToBrl(coupon.minPlanValue)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {coupon.durationType === 'ONCE' && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            1ª Cobrança
                          </span>
                        )}
                        {coupon.durationType === 'RECURRING' && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                            Recorrente
                          </span>
                        )}
                        {coupon.durationType === 'MONTHS' && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                            {coupon.durationMonths} meses
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-semibold text-gray-800">
                          {coupon.currentUses}
                        </span>
                        <span className="text-gray-400">
                          /{coupon.maxUses !== null ? coupon.maxUses : '∞'}
                        </span>
                        <span className="block text-xs text-gray-400 mt-0.5">
                          Limite/Empresa: {coupon.maxUsesPerCompany}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-xs">
                          <Icon
                            icon={IconCalendar}
                            size="sm"
                            className="text-gray-400"
                          />
                          <span>
                            {coupon.validFrom
                              ? new Date(coupon.validFrom).toLocaleDateString()
                              : 'Sem início'}
                            {coupon.validUntil ? (
                              <span
                                className={
                                  isExpired ? 'text-red-500 font-medium' : ''
                                }
                              >
                                {' '}
                                até{' '}
                                {new Date(
                                  coupon.validUntil,
                                ).toLocaleDateString()}
                              </span>
                            ) : (
                              ' (Sem expiração)'
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {coupon.isActive && !isExpired ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <Icon icon={IconCheck} size="sm" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            <Icon icon={IconX} size="sm" />
                            {isExpired ? 'Expirado' : 'Inativo'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                            onClick={() => handleOpenUsages(coupon)}
                            title="Ver usos"
                          >
                            <Icon icon={IconEye} size="md" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                            onClick={() => handleOpenEditDialog(coupon)}
                            title="Editar cupom"
                          >
                            <Icon icon={IconEdit} size="md" />
                          </button>
                          {coupon.isActive && (
                            <button
                              type="button"
                              className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors"
                              onClick={() => handleDeactivateCoupon(coupon)}
                              title="Desativar cupom"
                            >
                              <Icon icon={IconTrash} size="md" />
                            </button>
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

      {/* dialog para Criar/Editar Cupom */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <Icon icon={IconTicket} size="lg" className="text-[#FF4201]" />
              <span>{editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCoupon} className="space-y-4">
            <DialogBody className="max-h-[70vh] overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="type-eyebrow">Código do Cupom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: BLACK50"
                    disabled={!!editingCoupon}
                    // eslint-disable-next-line no-restricted-syntax -- código do cupom é digitado em maiúsculas
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 uppercase font-mono text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="type-eyebrow">Status</label>
                  <div className="flex items-center h-10 gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      className="w-4 h-4 text-[#FF4201] focus:ring-[#FF4201] border-gray-300 rounded"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700"
                    >
                      Cupom Ativo para novos usos
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="type-eyebrow">Descrição Interna</label>
                <input
                  type="text"
                  placeholder="Ex: Promoção de aniversário, cupom de parceiro, etc."
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="type-eyebrow">Tipo de Desconto</label>
                  <select
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none"
                    value={discountType}
                    onChange={(e) =>
                      setDiscountType(e.target.value as 'PERCENT' | 'VALUE')
                    }
                  >
                    <option value="PERCENT">Porcentagem (%)</option>
                    <option value="VALUE">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="type-eyebrow">
                    {discountType === 'PERCENT'
                      ? 'Desconto (%) *'
                      : 'Desconto (R$) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step={discountType === 'PERCENT' ? '1' : '0.01'}
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none"
                    value={discountValue || ''}
                    onChange={(e) =>
                      setDiscountValue(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="type-eyebrow">Duração do Desconto</label>
                  <select
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none"
                    value={durationType}
                    onChange={(e) =>
                      setDurationType(
                        e.target.value as 'ONCE' | 'RECURRING' | 'MONTHS',
                      )
                    }
                  >
                    <option value="ONCE">Somente na 1ª fatura</option>
                    <option value="RECURRING">Recorrente (Sempre)</option>
                    <option value="MONTHS">Meses específicos</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    A contratação nova aplica todo cupom só na primeira
                    cobrança, e o cupom de valor fixo no plano anual abate doze
                    vezes. A duração acima vale apenas para assinaturas
                    contratadas antes dela.
                  </p>
                </div>

                {durationType === 'MONTHS' && (
                  <div className="space-y-1.5">
                    <label className="type-eyebrow">Qtd de Meses *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none"
                      value={durationMonths}
                      onChange={(e) =>
                        setDurationMonths(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="type-eyebrow">Limite total de usos</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Sem limite"
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="type-eyebrow">
                    Limite usos por empresa
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none"
                    value={maxUsesPerCompany}
                    onChange={(e) =>
                      setMaxUsesPerCompany(parseInt(e.target.value) || 1)
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="type-eyebrow">
                    Valor Mínimo Plano (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Sem valor mínimo"
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none"
                    value={minPlanValue}
                    onChange={(e) => setMinPlanValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="type-eyebrow">Início da Validade</label>
                  <input
                    type="date"
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="type-eyebrow">Fim da Validade</label>
                  <input
                    type="date"
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm focus:border-[#FF4201] focus:ring-1 focus:ring-[#FF4201] outline-none"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="type-eyebrow">
                    Restrito a Planos Específicos
                  </span>
                  <button
                    type="button"
                    className="text-xs text-[#FF4201] hover:underline"
                    onClick={() => setAppliesToPlans([])}
                  >
                    Limpar restrições (Aplica a todos)
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {plans.map((p) => {
                    const isSelected = appliesToPlans.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-orange-50 border-[#FF4201] text-[#FF4201]'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => handlePlanToggle(p.id)}
                      >
                        {p.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="appliesToModules"
                  className="w-4 h-4 text-[#FF4201] focus:ring-[#FF4201] border-gray-300 rounded"
                  checked={appliesToModules}
                  onChange={(e) => setAppliesToModules(e.target.checked)}
                />
                <label htmlFor="appliesToModules" className="type-eyebrow">
                  Pode ser aplicado na contratação de módulos adicionais
                </label>
              </div>
            </DialogBody>

            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="neutralOutline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving} isLoading={isSaving}>
                Salvar Cupom
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog para Visualizar Usos do Cupom */}
      <Dialog open={isUsagesOpen} onOpenChange={setIsUsagesOpen}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon={IconEye} size="lg" className="text-[#FF4201]" />
              <span>
                Histórico de Usos do Cupom:{' '}
                <strong>{selectedCouponForUsages?.code}</strong>
              </span>
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="max-h-[60vh] overflow-y-auto pr-1">
            {isLoadingUsages ? (
              <div className="p-8 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : usages.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <FeaturedIcon
                  tone="neutral"
                  size="lg"
                  Icon={IconTicket}
                  className="mb-2 mx-auto flex"
                />
                <p className="font-semibold text-gray-600">
                  Nenhum uso registrado
                </p>
                <p className="text-xs text-gray-400">
                  Este cupom ainda não foi utilizado por nenhuma empresa.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-semibold text-gray-600">
                    <th className="p-3">Data/Hora</th>
                    <th className="p-3">Empresa (ID)</th>
                    <th className="p-3 text-right">Valor Original</th>
                    <th className="p-3 text-right">Desconto Aplicado</th>
                    <th className="p-3 text-right">Valor Cobrado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usages.map((usage) => (
                    <tr
                      key={usage.id}
                      className="hover:bg-gray-50/50 text-gray-700"
                    >
                      <td className="p-3">
                        {new Date(usage.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-600">
                        {usage.companyId}
                      </td>
                      <td className="p-3 text-right">
                        {formatCurrencyToBrl(usage.originalValue)}
                      </td>
                      <td className="p-3 text-right text-green-600 font-semibold">
                        -{formatCurrencyToBrl(usage.discountApplied)}
                      </td>
                      <td className="p-3 text-right font-semibold text-gray-800">
                        {formatCurrencyToBrl(usage.finalValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </DialogBody>

          <DialogFooter className="flex justify-end">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => setIsUsagesOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
