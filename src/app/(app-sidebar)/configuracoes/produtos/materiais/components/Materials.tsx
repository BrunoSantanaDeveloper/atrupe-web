'use client'

// React / Next
import { Fragment, useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Hooks / Store
import { useAlertDialog } from '@/store/useAlertDialog'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ReviewTodo } from '@/components/common/ReviewTodo'
import { NewMaterialModal } from './NewMaterial'
import { VariationsModal } from './VariationsModal'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { Material } from '../types'

// Actions
import { getMaterials, setMaterialActive } from '@/actions/materials'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { assetUnitShort } from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconBan,
  IconBoxSeam,
  IconPalette,
  IconPlayerPlay,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react'

// Sem custo ou preço mostra `-`, nunca R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

export function Materials({ searchParams }: SearchParamsType) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const [expanded, setExpanded] = useState<string[]>([])
  const [variations, setVariations] = useState<Material>()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['materials', searchParams],
    queryFn: () => getMaterials({ filters: searchParams }),
  })

  const materials = data?.data || []

  // Material com histórico é inativado, não excluído: continua nas
  // composições e vendas antigas, só some das listas de escolha
  const toggleActive = (material: Material) =>
    alertDialog.open({
      title: material.active
        ? `Inativar ${material.name}?`
        : `Reativar ${material.name}?`,
      description: material.active
        ? 'Ele deixa de aparecer para escolher em composições e vendas. O que já o usa continua como está.'
        : 'Ele volta a aparecer nas listas de escolha.',
      confirmLabel: material.active ? 'Inativar' : 'Reativar',
      onConfirm: async () => {
        const response = await setMaterialActive({
          id: material.id,
          active: !material.active,
        })

        if (!response.success) {
          toast.error(response.message)

          return
        }

        toast.success(
          material.active ? 'Material inativado' : 'Material reativado',
        )
        queryClient.invalidateQueries({ queryKey: ['materials'] })
      },
    })

  const sectors = Array.from(
    new Set(materials.map((material) => material.sector)),
  )

  const toggle = (id: string) =>
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Materiais"
          supportText="Insumos usados na composição dos produtos e na revenda"
          primaryCta={
            <PermissionGate permissions={['product_settings:products:edit']}>
              <NewMaterialModal />
            </PermissionGate>
          }
        />
        <Card>
          {isLoading ? (
            <TableSkeleton cols={7} rows={8} />
          ) : !materials.length ? (
            <ListDataTotalEmpty
              icon={IconBoxSeam}
              title="Nenhum material criado"
              description="Cadastre seu primeiro material"
            />
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[4%]" />
                      <TableHead className="w-[26%] min-w-[200px]">
                        Material
                      </TableHead>
                      <TableHead className="w-[14%]">Subcategoria</TableHead>
                      <TableHead className="w-[10%]">Unidade</TableHead>
                      <TableHead className="w-[14%]">Uso</TableHead>
                      <TableHead className="w-[12%] text-right">
                        Custo
                      </TableHead>
                      <TableHead className="w-[12%] text-right">
                        Preço de venda
                      </TableHead>
                      <TableHead className="w-[8%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectors.map((sector) => (
                      <Fragment key={sector}>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableCell colSpan={8}>
                            <span className="font-medium">{sector}</span>
                          </TableCell>
                        </TableRow>
                        {materials
                          .filter((material) => material.sector === sector)
                          .map((material) => {
                            const isExpanded = expanded.includes(material.id)
                            const hasVariations = material.variations.length > 0

                            return (
                              <Fragment key={material.id}>
                                <TableRow>
                                  <TableCell>
                                    {hasVariations && (
                                      <ActionButton
                                        Icon={
                                          isExpanded
                                            ? IconChevronDown
                                            : IconChevronRight
                                        }
                                        tooltip={
                                          isExpanded
                                            ? `Recolher ${material.name}`
                                            : `Ver variações de ${material.name}`
                                        }
                                        onClick={() => toggle(material.id)}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <p className="font-medium">
                                      {material.name}
                                    </p>
                                    <p className="text-sm text-gray">
                                      {material.code}
                                      {hasVariations &&
                                        ` · ${material.variations.length} variações`}
                                    </p>
                                  </TableCell>
                                  <TableCell>{material.subcategory}</TableCell>
                                  <TableCell>
                                    {assetUnitShort[material.unit]}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {material.directSale && (
                                        <Badge variant="blueLight">
                                          Venda direta
                                        </Badge>
                                      )}
                                      {material.productionMaterial && (
                                        <Badge variant="neutralLight">
                                          Produção
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {hasVariations ? (
                                      <span className="text-sm text-gray">
                                        por variação
                                      </span>
                                    ) : (
                                      formatValue(material.cost)
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {hasVariations ? (
                                      <span className="text-sm text-gray">
                                        por variação
                                      </span>
                                    ) : (
                                      formatValue(material.price)
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-end gap-1">
                                      <PermissionGate
                                        permissions={[
                                          'product_settings:products:edit',
                                        ]}
                                      >
                                        <NewMaterialModal material={material} />
                                        <ActionButton
                                          Icon={
                                            material.active
                                              ? IconBan
                                              : IconPlayerPlay
                                          }
                                          tooltip={
                                            material.active
                                              ? `Inativar ${material.name}`
                                              : `Reativar ${material.name}`
                                          }
                                          onClick={() => toggleActive(material)}
                                        />
                                        <ActionButton
                                          Icon={IconPalette}
                                          tooltip={`Variações de ${material.name}`}
                                          onClick={() =>
                                            setVariations(material)
                                          }
                                        />
                                      </PermissionGate>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                {isExpanded &&
                                  material.variations.map((variation) => (
                                    <TableRow
                                      key={variation.id}
                                      className="bg-gray-50"
                                    >
                                      <TableCell />
                                      <TableCell colSpan={4}>
                                        <span className="text-sm font-medium">
                                          {variation.brand} · {variation.color}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-right text-sm">
                                        {formatValue(variation.cost)}
                                      </TableCell>
                                      <TableCell className="text-right text-sm">
                                        {formatValue(variation.price)}
                                      </TableCell>
                                      <TableCell />
                                    </TableRow>
                                  ))}
                              </Fragment>
                            )
                          })}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-gray">
                {materials.length}{' '}
                {materials.length === 1 ? 'material' : 'materiais'} · quando o
                material tem variação, custo e preço vivem nela, e a venda exige
                escolher a variação
              </CardFooter>
            </>
          )}
        </Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ReviewTodo rule="IMP-1" title="Importar lista de materiais">
            A planilha que vem do SketchUp ou da marcenaria entra aqui, e cada
            linha é conciliada com o material cadastrado. O de-para fica salvo:
            da segunda vez o sistema já sabe.
          </ReviewTodo>
          <ReviewTodo rule="ALT-20" title="Entrada automática de notas">
            A nota do fornecedor chega pela Migrate e vira entrada de material,
            fornecedor e conta a pagar, sem digitação.
          </ReviewTodo>
        </div>

        <VariationsModal
          material={variations}
          open={!!variations}
          onOpenChange={() => setVariations(undefined)}
        />
      </div>
    </TooltipProvider>
  )
}
