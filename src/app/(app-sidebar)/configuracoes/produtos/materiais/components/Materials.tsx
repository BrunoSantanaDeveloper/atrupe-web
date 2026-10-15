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
  TableGroupRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Components
import { Topbar, type TabNavType } from '@/components/common/Topbar'
import { ReviewTodo } from '@/components/common/ReviewTodo'
import { NewMaterialModal } from './NewMaterial'
import { VariationsModal } from './VariationsModal'
import { EditPriceModal } from '@/app/(app-sidebar)/precificacao/components/EditPriceModal'
import { ImportMaterialsDialog } from './ImportMaterialsDialog'
import { MaterialFiscalDialog } from './MaterialFiscalDialog'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { Material } from '../types'
import type { PricingItem } from '@/app/(app-sidebar)/precificacao/types'

// Actions
import { getMaterials, updateMaterialPrice } from '@/actions/materials'
import { materialUnitSymbol } from '@/consts/materials'

// Hooks / Store / Consts

import { assetUnitShort } from '@/consts/assets'

// Hooks
import { useMoney } from '@/hooks/useMoney'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconUpload,
  IconBoxSeam,
  IconCurrencyReal,
  IconChevronDown,
  IconChevronRight,
  IconReceiptTax,
} from '@tabler/icons-react'

// Ativo e inativo são abas, como em Produtos (design.md da raiz, listagem).
// Inativar e reativar ficam no modal de edição (decisão de 05/10/2026)
const tabs: TabNavType[] = [
  { value: 'ativos', tab: 'ativos', label: 'Ativos' },
  { value: 'inativos', tab: 'inativos', label: 'Inativos' },
]

// Sem custo ou preço mostra `-`, nunca R$ 0,00 (design.md §7)
export function Materials({ searchParams }: SearchParamsType) {
  // Custo e preço só para quem tem a permissão de valores (§9)
  const money = useMoney()
  const formatValue = (value: number | null) => money(value)
  const queryClient = useQueryClient()
  const status = searchParams?.status || 'ativos'
  const [expanded, setExpanded] = useState<string[]>([])
  const [variations, setVariations] = useState<Material>()
  const [importing, setImporting] = useState(false)
  // Material sem variação é precificado aqui mesmo, no modal da Precificação
  // (DC-6, MT-3); com variação, o preço vive em cada combinação
  const [pricing, setPricing] = useState<PricingItem | undefined>()
  // Os dados fiscais da venda direta, com o módulo Nota Fiscal (PO, 14/10)
  const [fiscal, setFiscal] = useState<Material | null>(null)
  const { hasFiscalModule } = usePlanFeatures()
  const pricingItemOf = (material: Material): PricingItem => ({
    id: `mat:${material.id}`,
    name: material.name,
    code: material.code,
    sector: material.sector,
    unit: materialUnitSymbol(material.unit),
    cost: material.cost,
    costUpdatedAt: null,
    rule: material.priceRule,
    price: material.price,
    margin:
      material.cost !== null && material.price
        ? Math.round(
            ((material.price - material.cost) / material.price) * 1000,
          ) / 10
        : null,
    status:
      material.cost === null
        ? 'NO_COST'
        : !material.price
          ? 'PENDING'
          : material.price < material.cost
            ? 'BELOW_COST'
            : 'PRICED',
  })

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['materials', searchParams],
    queryFn: () => getMaterials({ filters: searchParams }),
  })

  const materials = data?.data || []

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
          tabs={tabs}
          activeTab={status}
          paramName="status"
          primaryCta={
            <PermissionGate permissions={['product_settings:products:edit']}>
              <NewMaterialModal />
            </PermissionGate>
          }
          secondaryCta={
            <PermissionGate permissions={['product_settings:products:edit']}>
              <Button
                type="button"
                variant="neutralOutline"
                LeftIcon={IconUpload}
                onClick={() => setImporting(true)}
              >
                Importar lista
              </Button>
            </PermissionGate>
          }
        />
        <Card>
          {isLoading ? (
            <TableSkeleton cols={6} rows={8} />
          ) : !materials.length ? (
            status === 'inativos' ? (
              <ListDataTotalEmpty
                icon={IconBoxSeam}
                title="Nenhum material inativo"
                description="Para inativar um material, desligue a chave Ativo na edição dele"
              />
            ) : (
              <ListDataTotalEmpty
                icon={IconBoxSeam}
                title="Nenhum material cadastrado"
                description="Cadastre seu primeiro material"
              />
            )
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[4%]" />
                      <TableHead className="w-[40%] min-w-[200px]">
                        Material
                      </TableHead>
                      <TableHead className="w-[10%]">Unidade</TableHead>
                      <TableHead className="w-[14%]">Uso</TableHead>
                      <TableHead numeric className="w-[12%]">
                        Custo
                      </TableHead>
                      <TableHead numeric className="w-[12%]">
                        Preço de venda
                      </TableHead>
                      <TableHead className="w-[8%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectors.map((sector) => (
                      <Fragment key={sector}>
                        <TableGroupRow>{sector}</TableGroupRow>
                        {/* Setor › subcategoria (05/10/2026): dentro do
                            setor, os materiais vêm agrupados pela
                            subcategoria */}
                        {materials
                          .filter((material) => material.sector === sector)
                          .sort((a, b) =>
                            (a.subcategory || '').localeCompare(
                              b.subcategory || '',
                            ),
                          )
                          .map((material, index, list) => {
                            const subcategoryStarts =
                              index === 0 ||
                              list[index - 1].subcategory !==
                                material.subcategory
                            const isExpanded = expanded.includes(material.id)
                            const hasVariations = material.variations.length > 0

                            return (
                              <Fragment key={material.id}>
                                {subcategoryStarts && material.subcategory && (
                                  <TableRow className="hover:bg-transparent">
                                    <TableCell />
                                    <TableCell
                                      colSpan={6}
                                      className="type-body-strong py-2"
                                    >
                                      {material.subcategory}
                                    </TableCell>
                                  </TableRow>
                                )}
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
                                        {/* Duas ações por linha (05/10/2026):
                                            editar (cadastro, variações e
                                            ativo) e R$. Sem variação o R$ abre
                                            o modal de preço; com variação, o
                                            custo e o preço vivem em cada
                                            combinação, então abre a tabela
                                            delas (MT-3) */}
                                        <NewMaterialModal material={material} />
                                        <ActionButton
                                          Icon={IconCurrencyReal}
                                          tooltip={
                                            material.variations.length
                                              ? `Custo e preço das variações de ${material.name}`
                                              : `Precificar ${material.name}`
                                          }
                                          onClick={() =>
                                            material.variations.length
                                              ? setVariations(material)
                                              : setPricing(
                                                  pricingItemOf(material),
                                                )
                                          }
                                        />
                                      </PermissionGate>
                                      {material.directSale &&
                                        hasFiscalModule() && (
                                          <PermissionGate
                                            permissions={[
                                              'nota_fiscal:config:edit',
                                            ]}
                                          >
                                            <ActionButton
                                              Icon={IconReceiptTax}
                                              tooltip={`Dados fiscais de ${material.name}`}
                                              onClick={() =>
                                                setFiscal(material)
                                              }
                                            />
                                          </PermissionGate>
                                        )}
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
                                      <TableCell colSpan={3}>
                                        <span className="text-sm font-medium">
                                          {variation.brand} · {variation.color}
                                        </span>
                                      </TableCell>
                                      <TableCell numeric className="text-sm">
                                        {formatValue(variation.cost)}
                                      </TableCell>
                                      <TableCell numeric className="text-sm">
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
          <ReviewTodo rule="ALT-20" title="Entrada automática de notas">
            A nota do fornecedor chega pela Migrate e vira entrada de material,
            fornecedor e conta a pagar, sem digitação.
          </ReviewTodo>
        </div>

        {/* O diálogo lê o material da lista atual, para ver o custo e o
            preço recém-gravados sem fechar */}
        <VariationsModal
          material={
            materials.find((item) => item.id === variations?.id) || variations
          }
          open={!!variations}
          onOpenChange={() => setVariations(undefined)}
        />
        <EditPriceModal
          group="materials"
          item={pricing}
          open={!!pricing}
          // O preço do material é gravado no cadastro (DC-6): o id do
          // item é "mat:<material>"
          onSave={(values) =>
            updateMaterialPrice({
              materialId: (pricing?.id || '').split(':')[1] || '',
              ...values,
            })
          }
          onOpenChange={() => {
            setPricing(undefined)
            queryClient.invalidateQueries({ queryKey: ['materials'] })
          }}
        />
        <MaterialFiscalDialog
          material={fiscal}
          onOpenChange={() => setFiscal(null)}
        />
        <ImportMaterialsDialog
          open={importing}
          materials={materials}
          onOpenChange={setImporting}
          onDone={() =>
            queryClient.invalidateQueries({ queryKey: ['materials'] })
          }
        />
      </div>
    </TooltipProvider>
  )
}
