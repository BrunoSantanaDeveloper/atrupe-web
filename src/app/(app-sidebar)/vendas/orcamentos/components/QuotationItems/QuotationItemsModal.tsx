// O modal "Qual item deseja adicionar?". O primeiro passo é a grade de
// setores (decisão do dono do produto, 23/10/2026, que volta atrás no ORC-1
// de 06/10): o vendedor escolhe o setor e cai na lista dele, com a busca pelo
// nome e os setores em abas para trocar sem voltar. "Composição" é o último
// botão da grade, tracejado, para o que não existe pronto (ORC-11). Os
// materiais de venda direta aparecem na busca, marcados como material
// (ORG-1).

// React
import { useCallback, useEffect, useMemo, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'

// Components
import { Form } from '@/components/ui/form'
import { FeatureGate } from '@/components/common/FeatureGate'
import { CategorySelectField } from '@/components/common/form/global-inputs/CategorySelectField'
import { convertRawToUnitCost } from '@/components/common/form/global-inputs/products/UnitCostInput'

// Icons
import {
  IconBoxOff,
  IconPuzzle,
  IconSearch,
  IconArrowLeft,
  IconQuestionMark,
  IconLayoutGridAdd,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Third-party
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'

// Hooks / Store / Consts
import { IProduct, useProducts } from '@/hooks/queries/useProduct'
import { useSectorWithProducts } from '@/hooks/queries/useSectorWithProducts'
import { useQuotation } from '@/contexts/quotationContext'
import { sectorIcons } from '@/consts/sectors'
import { FEATURES } from '@/consts/features'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Actions
import { getDirectSaleMaterials } from '@/actions/material-item'

// Utils
import { cn, parseCurrencyToBrl } from '@/lib/utils'

// Helper para converter unitKind para símbolo da unidade
export function getUnitSymbol(unitKind: string | null | undefined): string {
  switch (unitKind?.toUpperCase()) {
    case 'AREA':
      return 'm²'
    case 'LENGTH':
      return 'm'
    case 'CAPACITY':
      return 'L'
    case 'WEIGHT':
      return 'kg'
    case 'DISTANCE':
      return 'km'
    case 'DURATION':
      return 'h'
    case 'UNITY':
    default:
      return 'un'
  }
}

// Ordem fixa dos setores: Criação → Impressão → Gráfica → CNC → Serralheria →
// (outros) → Instalação
const SECTOR_ORDER: Array<string[]> = [
  ['criação', 'criacao'],
  ['impressão', 'impressao'],
  ['gráfica', 'grafica'],
  ['cnc'],
  ['serralheria'],
]

const INSTALACAO_KEYWORDS = ['instalação', 'instalacao']

function getSectorPriority(name: string): number {
  const lower = name.toLowerCase()
  if (INSTALACAO_KEYWORDS.some((kw) => lower.includes(kw))) {
    return SECTOR_ORDER.length + 1
  }
  for (let i = 0; i < SECTOR_ORDER.length; i++) {
    if (SECTOR_ORDER[i].some((kw) => lower.includes(kw))) return i
  }
  return SECTOR_ORDER.length
}

export function sortSectors<T extends { name: string }>(sectors: T[]) {
  return [...sectors].sort((a, b) => {
    const priorityA = getSectorPriority(a.name)
    const priorityB = getSectorPriority(b.name)
    if (priorityA !== priorityB) return priorityA - priorityB
    return a.name.localeCompare(b.name)
  })
}

const normalize = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const schema = z.object({
  categoryId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const ALL = 'todos'

export function QuotationItemsModal({ open }: { open: boolean }) {
  const { updateQuotationData, openChangeModal } = useQuotation()

  const { data: sectorsRes, isLoading: loadingSectors } =
    useSectorWithProducts()
  const {
    data: productsList,
    isLoading: loadingProducts,
    refetch,
  } = useProducts()
  // Os materiais de venda direta, do cadastro de materiais (Fase 4.4): sem
  // a base de custos no plano, a API devolve a lista vazia
  const { data: materialsRes } = useQuery({
    queryKey: ['direct-sale-materials'],
    queryFn: () => getDirectSaleMaterials(),
    enabled: open,
  })

  const [search, setSearch] = useState('')
  const [sectorId, setSectorId] = useState(ALL)
  // Primeiro a grade de setores; escolhido o setor, a lista dele
  const [step, setStep] = useState<'sectors' | 'list'>('sectors')
  const { hasFeature } = usePlanFeatures()

  // Revalida a lista de produtos e volta à grade sempre que o modal abrir
  useEffect(() => {
    if (open) {
      refetch()
      setSearch('')
      setSectorId(ALL)
      setStep('sectors')
    }
  }, [open, refetch])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: { categoryId: '' },
  })
  const categoryId = form.watch('categoryId')

  const sectors = useMemo(
    () => (sectorsRes ? sortSectors(sectorsRes) : []),
    [sectorsRes],
  )
  const sectorName = (id: string) =>
    sectors.find((sector) => sector.id === id)?.name || ''
  const currentSector = sectors.find((sector) => sector.id === sectorId)

  const term = normalize(search.trim())

  const products = useMemo(() => {
    if (!productsList) return []
    return productsList
      .filter((product) => product.isActive !== false)
      .filter((product) => sectorId === ALL || product.sectorId === sectorId)
      .filter((product) => !categoryId || product.categoryId === categoryId)
      .filter(
        (product) =>
          !term ||
          normalize(product.name).includes(term) ||
          normalize(product.code || '').includes(term),
      )
  }, [productsList, sectorId, categoryId, term])

  // O material entra pelo nome do setor (o cadastro de materiais guarda o
  // nome, não o id). Com um grupo de produtos escolhido, não há material
  const materials = useMemo(() => {
    const list = materialsRes?.data || []
    if (categoryId) return []
    return list.filter(
      (material) =>
        (sectorId === ALL ||
          normalize(material.sector) ===
            normalize(currentSector?.name || '')) &&
        (!term ||
          normalize(material.name).includes(term) ||
          normalize(material.code).includes(term)),
    )
  }, [materialsRes, sectorId, categoryId, term, currentSector?.name])

  const handleSelectProduct = (product: IProduct) => {
    updateQuotationData({
      productId: product.id,
      sectorId: product.sectorId,
      categoryId: categoryId || null,
    })
    openChangeModal(true, 'productDetail')
  }

  const handleSelectMaterial = (materialId: string) => {
    updateQuotationData({ materialId })
    openChangeModal(true, 'materialItem')
  }

  /**
   * Preço exibido na listagem.
   *
   * Preferimos o total (`salePrice` somado dos itens). Produto vendido por
   * unidade dimensional (m², metro, kg, hora…) sem medida cadastrada não tem
   * total — nesse caso mostramos o preço por unidade de exibição, convertendo
   * o `unitCost` bruto (R$/mm², R$/segundo…) de volta, como a tela de produtos.
   */
  const getDisplayPrice = useCallback(
    (product: IProduct): { value: number; unit: string } => {
      const total = (product.items ?? []).reduce(
        (sum, item) => sum + (item.salePrice ?? 0) * (item?.quantity ?? 1),
        0,
      )
      if (total > 0) return { value: total, unit: '' }
      const firstItem = product.items?.[0]
      if (!firstItem?.unitCost) {
        return { value: product?.salePrice ?? 0, unit: '' }
      }
      const unitSymbol = getUnitSymbol(firstItem.unitKind)
      return {
        value: convertRawToUnitCost(firstItem.unitKind, firstItem.unitCost),
        unit: unitSymbol === 'un' ? '' : `/${unitSymbol}`,
      }
    },
    [],
  )

  const loading = loadingSectors || loadingProducts
  const empty = !loading && !products.length && !materials.length
  const rowProps = (select: () => void) => ({
    role: 'button' as const,
    tabIndex: 0,
    className: 'cursor-pointer',
    onClick: select,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        select()
      }
    },
  })

  // Grade equilibrada: no máximo 4 por linha, e as linhas com o mesmo
  // número de botões (6 → 3 + 3, 7 → 4 + 3, 5 → 3 + 2). A última linha fica
  // centralizada. Conta o botão "Composição" só quando o plano o mostra
  const TILE_PX = 120
  const GAP_PX = 12
  const tiles = sectors.length + (hasFeature(FEATURES.COSTS.COST_BASE) ? 1 : 0)
  const rows = Math.max(1, Math.ceil(tiles / 4))
  const perRow = Math.max(1, Math.ceil(tiles / rows))
  const gridMaxWidth = perRow * TILE_PX + (perRow - 1) * GAP_PX

  if (step === 'sectors') {
    return (
      <Dialog open={open} onOpenChange={openChangeModal}>
        <DialogContent className="sm:max-w-fit">
          <DialogHeader className="border-0 bg-transparent pb-0">
            <DialogTitle className="flex flex-col items-center justify-center gap-4">
              <FeaturedIcon tone="brand" Icon={IconLayoutGridAdd} size="lg" />
              <span className="w-full text-center text-lg font-semibold text-gray-900">
                Qual item deseja adicionar?
              </span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Escolha o setor do item
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {loadingSectors ? (
              <div className="flex justify-center py-8">
                <span className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
              </div>
            ) : (
              <div
                className="mx-auto flex flex-wrap justify-center gap-3"
                style={{ maxWidth: gridMaxWidth }}
              >
                {sectors.map((sector) => (
                  <Button
                    key={sector.id}
                    type="button"
                    variant="neutralOutline"
                    className="h-[120px] w-[120px] flex-col overflow-hidden rounded-xl border-none p-2 text-gray-600 shadow-sm [&_svg]:!size-10"
                    onClick={() => {
                      setSectorId(sector.id)
                      form.setValue('categoryId', '')
                      setStep('list')
                    }}
                  >
                    {/* 40 px, o tamanho da grade em produção: o botão é uma
                        ilustração de 120 px, fora da escala sm/md/lg. O
                        Button força o SVG a 20 px; o [&_svg]:!size-10 do
                        botão vence (com !, porque a regra do Button vem depois no CSS) */}
                    <Icon
                      icon={sectorIcons[sector.icon]?.icon || IconQuestionMark}
                      size="lg"
                      className="mb-2 size-10"
                    />
                    <span className="text-wrap text-xs">{sector.name}</span>
                  </Button>
                ))}
                {/* Composição é o último botão, e é a exceção (ORC-11): para
                    quando o produto não existe pronto. É do PRO: monta o item
                    com processos e materiais, cadastros do PRO (decisão do
                    dono do produto, 23/10/2026). Nas cores do ícone do modal,
                    para se distinguir dos setores */}
                <FeatureGate features={[FEATURES.COSTS.COST_BASE]}>
                  <Button
                    type="button"
                    variant="neutralOutline"
                    className="h-[120px] w-[120px] flex-col overflow-hidden rounded-xl border border-dashed border-brand-200 bg-brand-50 p-2 text-brand-600 shadow-none hover:bg-brand-100 [&_svg]:!size-10"
                    title="Montar um item que não existe pronto"
                    onClick={() => openChangeModal(true, 'composeItem')}
                  >
                    <Icon
                      icon={IconPuzzle}
                      size="lg"
                      className="mb-2 size-10"
                    />
                    <span className="text-wrap text-xs">Composição</span>
                  </Button>
                </FeatureGate>
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={openChangeModal}>
      <DialogContent className="sm:max-w-[855px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span>Qual item deseja adicionar?</span>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Busque o produto pelo nome ou filtre pelo setor
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-[1_0_260px] space-y-1.5">
              <label
                htmlFor="quotation-item-search"
                className="text-sm font-medium text-gray-700"
              >
                Buscar pelo nome
              </label>
              <Input
                id="quotation-item-search"
                autoFocus
                value={search}
                placeholder="Nome ou código do produto"
                startAdornment={<Icon icon={IconSearch} size="md" />}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            {sectorId !== ALL && (
              <Form {...form}>
                <form
                  className="flex flex-[1_0_200px]"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <CategorySelectField<FormData>
                    name="categoryId"
                    label="Grupo de produtos"
                    width="w-full"
                    sectorId={sectorId}
                  />
                </form>
              </Form>
            )}
          </div>

          {/* Os setores como filtro (ORC-1): abas segmentadas, na ordem fixa */}
          <Tabs
            value={sectorId}
            variant="pill"
            className="overflow-x-auto"
            onValueChange={(value) => {
              setSectorId(value)
              form.setValue('categoryId', '')
            }}
          >
            <TabsList>
              <TabsTrigger value={ALL}>Todos</TabsTrigger>
              {sectors.map((sector) => (
                <TabsTrigger key={sector.id} value={sector.id}>
                  <span className="flex items-center gap-1.5">
                    <Icon
                      icon={sectorIcons[sector.icon]?.icon || IconQuestionMark}
                      size="sm"
                    />
                    {sector.name}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="rounded-xl border border-gray-200 bg-white h-[calc(50vh-100px)] min-h-[220px] overflow-y-auto">
            {/* Sem a lista ainda, "Nada encontrado" seria falso: a forma da
                tabela no lugar */}
            {loading ? (
              <Table className="table-fixed">
                <TableBody>
                  <TableSkeletonRows cols={4} rows={6} />
                </TableBody>
              </Table>
            ) : empty ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <FeaturedIcon Icon={IconBoxOff} size="lg" tone="brand" />
                  <p className="mt-4 mb-1 text-lg font-semibold">
                    Nada encontrado
                  </p>
                  <p className="text-sm text-gray">
                    {term
                      ? 'Tente outro nome ou outro setor.'
                      : 'Nenhum produto liberado para venda neste setor.'}
                  </p>
                </div>
              </div>
            ) : (
              <Table className="table-fixed">
                <TableBody>
                  {products.map((item) => {
                    const price = getDisplayPrice(item)
                    return (
                      <TableRow
                        key={item.id}
                        {...rowProps(() => handleSelectProduct(item))}
                      >
                        <TableCell className="w-[15%] truncate font-normal text-gray-600">
                          {item.code}
                        </TableCell>
                        <TableCell className="truncate text-left text-gray-900">
                          {item.name}
                          {sectorId === ALL && sectorName(item.sectorId) && (
                            <span className="ml-2 text-xs text-gray">
                              {sectorName(item.sectorId)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="w-[14%] text-right">
                          <Badge variant="blueLight" size="lg">
                            {getUnitSymbol(item.items?.[0]?.unitKind)}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[22%] whitespace-nowrap text-start">
                          {parseCurrencyToBrl(price.value)}
                          {price.unit && (
                            <span className="text-gray-500">{price.unit}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {/* Material de venda direta, marcado como material (ORG-1) */}
                  {materials.map((material) => {
                    const prices = [
                      material.price,
                      ...material.variations.map((item) => item.price),
                    ].filter((price): price is number => price !== null)
                    const lowest = prices.length ? Math.min(...prices) : null
                    return (
                      <TableRow
                        key={`material-${material.id}`}
                        {...rowProps(() => handleSelectMaterial(material.id))}
                      >
                        <TableCell className="w-[15%] truncate font-normal text-gray-600">
                          {material.code}
                        </TableCell>
                        <TableCell className="truncate text-left text-gray-900">
                          <span className="mr-2">{material.name}</span>
                          <Badge variant="warningLight">Material</Badge>
                          {sectorId === ALL && (
                            <span className="ml-2 text-xs text-gray">
                              {material.sector}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="w-[14%] text-right">
                          <Badge variant="blueLight" size="lg">
                            {material.unit}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[22%] whitespace-nowrap text-start">
                          {lowest === null ? (
                            <span className="text-gray">sem preço</span>
                          ) : (
                            <>
                              {material.variations.length > 1 && (
                                <span className="text-gray-500">
                                  a partir de{' '}
                                </span>
                              )}
                              {parseCurrencyToBrl(lowest)}
                              {material.unit !== 'un' && (
                                <span className="text-gray-500">
                                  /{material.unit}
                                </span>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          {/* Composição é o último botão, e é a exceção (ORC-1, ORC-11): para
              quando o produto não existe pronto. Tracejado, para não
              disputar atenção com a busca. O item montado vai para a API
              desde a Fase 4.5 */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="neutralOutline"
              LeftIcon={IconArrowLeft}
              onClick={() => {
                setSearch('')
                setStep('sectors')
              }}
            >
              Voltar
            </Button>
            <FeatureGate features={[FEATURES.COSTS.COST_BASE]}>
              <Button
                type="button"
                variant="neutralOutline"
                LeftIcon={IconPuzzle}
                className={cn(
                  'border-dashed border-brand-200 bg-brand-50 text-brand-600 shadow-none hover:bg-brand-100',
                )}
                title="Montar um item que não existe pronto"
                onClick={() => openChangeModal(true, 'composeItem')}
              >
                Composição
              </Button>
            </FeatureGate>
          </div>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => openChangeModal(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
