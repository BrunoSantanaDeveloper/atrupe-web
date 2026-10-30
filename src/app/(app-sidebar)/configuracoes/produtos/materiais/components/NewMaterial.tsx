'use client'

// React / Next
import { useMemo, useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type {
  Material,
  MaterialUnit,
  MaterialShape,
  MaterialAdvanced,
} from '../types'
import type { SheetFormat } from '@/app/(app-sidebar)/cadastros/papeis/types'

// Components
import { InactivateMaterialDialog } from './InactivateMaterialDialog'

// Actions
import {
  createMaterial,
  updateMaterial,
  createMaterialVariations,
} from '@/actions/materials'

// Hooks / Store / Consts
import { assetUnitOptions } from '@/consts/assets'
import { sheetFormatObj, sheetFormatOptions } from '@/consts/papers'
import { useSector } from '@/hooks/queries/useSector'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconPencil } from '@tabler/icons-react'

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const subcategories = [
  'Lonas',
  'Vinis',
  'Chapas',
  'Perfis',
  'Tintas',
  'Acabamentos',
  'Brindes',
].map((item) => ({ value: item, label: item }))

// Configuração avançada (MT-10.1): o formato diz quais referências o
// material tem. Perfil e chapa alimentam fórmulas, aproveitamento e plano de
// corte; os demais levam só o peso, e a lista cresce conforme a necessidade
const shapes: { value: MaterialShape; label: string }[] = [
  { value: 'OTHER', label: 'Sem medidas' },
  { value: 'PROFILE', label: 'Perfil, barra ou tubo' },
  { value: 'SHEET', label: 'Chapa, folha ou bobina' },
]

// O peso segue a unidade de venda do material (orientação do time,
// 03/10/2026): a lona por m², o perfil por metro, o ilhós por unidade
const weightUnitLabel: { [key: string]: string } = {
  M2: 'm²',
  M: 'metro',
  UN: 'unidade',
  LT: 'litro',
  L: 'litro',
  KM: 'km',
  HR: 'hora',
}

const numberOrNull = (value: string) =>
  value.trim() === '' ? null : Number(value.replace(',', '.'))
// Reais digitados para centavos; em branco fica sem valor (e não zero)
const centsOrNull = (value: string) => {
  const number = numberOrNull(value)
  return number === null || !Number.isFinite(number)
    ? null
    : Math.round(number * 100)
}
const text = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value)

interface Props {
  // Com o material informado, o mesmo formulário edita em vez de cadastrar
  material?: Material
}

// Marca e cor são variações (MT-2), cadastradas aqui na edição; espessura e
// tamanho viram materiais diferentes. Inativar e reativar também vivem aqui,
// num botão do rodapé (05/10/2026): a linha da lista fica com editar e R$.
export function NewMaterialModal({ material }: Props) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(material)
  const [open, setOpen] = useState(false)
  // Material com histórico é inativado, não excluído; ao inativar, sai das
  // composições, com a lista e a confirmação no diálogo próprio
  const [statusOpen, setStatusOpen] = useState(false)
  // Variações novas: marca × cor, com o mesmo custo em cada combinação
  // (MT-3, MT-4). O preço sai depois, pelo R$ da lista
  const [brands, setBrands] = useState('')
  const [colors, setColors] = useState('')
  const [variationCost, setVariationCost] = useState('')
  const brandList = splitList(brands)
  const colorList = splitList(colors)
  const combinations = brandList.length * colorList.length
  const [name, setName] = useState(material?.name || '')
  // O setor vem do cadastro de setores da empresa (os ativos; o do
  // material continua na lista mesmo se foi inativado depois)
  const { data: sectorList } = useSector()
  const [sectorId, setSectorId] = useState(material?.sectorId || '')
  const sectors = useMemo(
    () =>
      (sectorList || [])
        .filter((item) => item.isActive || item.id === material?.sectorId)
        .map((item) => ({ value: item.id, label: item.name })),
    [sectorList, material?.sectorId],
  )
  // O material novo sempre pergunta o setor (GP-47, item 9; achado 5 da
  // revisão do PRO): sem padrão, para o setor não sair errado sem ninguém ver
  const [subcategory, setSubcategory] = useState(
    material?.subcategory || subcategories[0].value,
  )
  const [unit, setUnit] = useState<MaterialUnit>(material?.unit || 'M2')
  const [cost, setCost] = useState(
    material?.cost ? String(material.cost / 100) : '',
  )
  const [directSale, setDirectSale] = useState(material?.directSale ?? false)
  const [productionMaterial, setProductionMaterial] = useState(
    material?.productionMaterial ?? true,
  )
  const [showAdvanced, setShowAdvanced] = useState(!!material?.advanced)
  const [shape, setShape] = useState<MaterialShape>(
    material?.advanced?.shape || 'OTHER',
  )
  const [adv, setAdv] = useState({
    x: text(material?.advanced?.x),
    y: text(material?.advanced?.y),
    barLength: text(material?.advanced?.barLength),
    width: text(material?.advanced?.width),
    height: text(material?.advanced?.height),
    weight: text(material?.advanced?.weight),
  })
  const [wholeSheets, setWholeSheets] = useState(
    material?.advanced?.wholeSheets !== false,
  )
  const setAdvField = (key: keyof typeof adv, value: string) =>
    setAdv((current) => ({ ...current, [key]: value }))
  // O papel (Papéis, GR-0): gramatura, formato da folha e área útil. Sem
  // formato, a folha é só uma chapa (ACM, PS). O padrão preenche a medida
  const [grammage, setGrammage] = useState(text(material?.grammage))
  const [sheetFormat, setSheetFormat] = useState<SheetFormat | ''>(
    material?.sheetFormat || '',
  )
  const [usable, setUsable] = useState({
    width: text(material?.usableWidth),
    height: text(material?.usableHeight),
  })
  const preset = sheetFormat ? sheetFormatObj[sheetFormat] : null
  const presetSize = !!preset?.width
  const pickFormat = (value: SheetFormat | '') => {
    setSheetFormat(value)
    const size = value ? sheetFormatObj[value] : null
    if (size?.width)
      setAdv((current) => ({
        ...current,
        width: String(size.width),
        height: String(size.height),
      }))
  }
  const paper =
    showAdvanced && shape === 'SHEET'
      ? {
          grammage: numberOrNull(grammage),
          sheetFormat: sheetFormat || null,
          usableWidth: numberOrNull(usable.width),
          usableHeight: numberOrNull(usable.height),
        }
      : {}
  const advanced: MaterialAdvanced | undefined = showAdvanced
    ? {
        shape,
        x: numberOrNull(adv.x),
        y: numberOrNull(adv.y),
        barLength: numberOrNull(adv.barLength),
        width: numberOrNull(adv.width),
        height: numberOrNull(adv.height),
        weight: numberOrNull(adv.weight),
        ...(shape === 'SHEET' ? { wholeSheets } : {}),
      }
    : undefined

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const values = {
        name,
        sectorId,
        subcategory,
        unit,
        directSale,
        productionMaterial,
        cost: centsOrNull(cost),
        advanced,
        ...paper,
      }

      return material
        ? updateMaterial({ id: material.id, ...values })
        : createMaterial(values)
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success(isEdit ? 'Material atualizado' : 'Material cadastrado')
      queryClient.invalidateQueries({ queryKey: ['materials'] })

      if (!isEdit) {
        setName('')
        setCost('')
      }

      setOpen(false)
    },
    onError: () =>
      toast.error(
        isEdit
          ? 'Erro ao atualizar o material'
          : 'Erro ao cadastrar o material',
      ),
  })

  const { mutate: addVariations, isPending: isAddingVariations } = useMutation({
    mutationFn: () =>
      createMaterialVariations({
        materialId: material?.id || '',
        brands: brandList,
        colors: colorList,
        cost: centsOrNull(variationCost),
        // O preço vem depois, pelo modal de precificação (MT-3)
        price: null,
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success(
        `${response.data} ${response.data === 1 ? 'variação criada' : 'variações criadas'}`,
      )
      setBrands('')
      setColors('')
      setVariationCost('')
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    },
    onError: () => toast.error('Erro ao criar as variações'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <ActionButton
          Icon={IconPencil}
          tooltip={`Editar ${material?.name}`}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
          Novo material
        </Button>
      )}
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>
              {isEdit ? 'Editar material' : 'Novo material'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Cadastre o insumo usado na composição dos produtos.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="material-name" className="text-sm font-medium">
                Nome
              </label>
              <Input
                id="material-name"
                value={name}
                placeholder="Ex.: Lona 440"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <SelectBasic
              name="sector"
              label="Setor"
              placeholder="Escolha o setor"
              value={sectorId}
              onChange={setSectorId}
              options={sectors}
            />
            <SelectBasic
              name="subcategory"
              label="Subcategoria"
              value={subcategory}
              onChange={setSubcategory}
              options={subcategories}
            />
            <SelectBasic
              name="unit"
              label="Unidade"
              value={unit}
              onChange={(value) => setUnit(value as MaterialUnit)}
              options={assetUnitOptions}
            />
            <div className="space-y-1.5">
              <label htmlFor="material-cost" className="text-sm font-medium">
                Custo por unidade
              </label>
              <Input
                id="material-cost"
                type="number"
                min={0}
                step="0.01"
                startAdornment={<span className="text-sm">R$</span>}
                value={cost}
                onChange={(event) => setCost(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
              <div>
                <p className="text-sm font-medium">Venda direta</p>
                <p className="text-sm text-gray">
                  Aparece na busca do orçamento para ser revendido.
                </p>
              </div>
              <Switch
                checked={directSale}
                onCheckedChange={setDirectSale}
                aria-label="Venda direta"
              />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-3">
              <div>
                <p className="text-sm font-medium">Material de produção</p>
                <p className="text-sm text-gray">
                  Fica disponível para compor produtos e processos.
                </p>
              </div>
              <Switch
                checked={productionMaterial}
                onCheckedChange={setProductionMaterial}
                aria-label="Material de produção"
              />
            </div>
          </div>

          {/* Configuração avançada (MT-10.1, 03/10/2026): X é a primeira
              medida do catálogo e Y a segunda; a fórmula da composição lê
              "linha · X" e "linha · Y" do material escolhido. O peso é por
              unidade de venda do material */}
          <div className="space-y-3 rounded-lg border border-gray-200 p-3">
            <label className="flex items-start gap-3">
              <Switch
                className="mt-0.5"
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
                aria-label="Configuração avançada"
              />
              <span>
                <span className="block text-sm font-medium">
                  Configuração avançada
                </span>
                <span className="block text-sm text-gray">
                  Medidas e peso que as fórmulas da composição, o aproveitamento
                  e o plano de corte leem.
                </span>
              </span>
            </label>
            {showAdvanced && (
              <div className="space-y-3 pl-12">
                <SelectBasic
                  name="shape"
                  label="Formato"
                  value={shape}
                  onChange={(value) => setShape(value as MaterialShape)}
                  options={shapes}
                />
                {shape === 'PROFILE' && (
                  <>
                    <p className="text-sm text-gray">
                      Como está no catálogo: em 50 × 30, X é 50 e Y é 30. Qual
                      lado entra na conta é escolha de quem escreve a fórmula.
                    </p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <label htmlFor="adv-x" className="text-sm font-medium">
                          X (mm)
                        </label>
                        <Input
                          id="adv-x"
                          type="number"
                          min={0}
                          value={adv.x}
                          onChange={(event) =>
                            setAdvField('x', event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="adv-y" className="text-sm font-medium">
                          Y (mm)
                        </label>
                        <Input
                          id="adv-y"
                          type="number"
                          min={0}
                          value={adv.y}
                          onChange={(event) =>
                            setAdvField('y', event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="adv-bar"
                          className="text-sm font-medium"
                        >
                          Barra (mm)
                        </label>
                        <Input
                          id="adv-bar"
                          type="number"
                          min={0}
                          placeholder="6000"
                          value={adv.barLength}
                          onChange={(event) =>
                            setAdvField('barLength', event.target.value)
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
                {shape === 'SHEET' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <SelectBasic
                        name="sheet-format"
                        label="Formato da folha (papel)"
                        options={[
                          { value: '', label: 'Não é papel' },
                          ...sheetFormatOptions,
                        ]}
                        value={sheetFormat}
                        onChange={(value) =>
                          pickFormat((value ?? '') as SheetFormat | '')
                        }
                      />
                      <div className="space-y-1.5">
                        <label
                          htmlFor="adv-grammage"
                          className="text-sm font-medium"
                        >
                          Gramatura (g/m²)
                        </label>
                        <Input
                          id="adv-grammage"
                          type="number"
                          min={1}
                          step={1}
                          disabled={!sheetFormat}
                          value={grammage}
                          onChange={(event) => setGrammage(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="adv-w" className="text-sm font-medium">
                          Largura (mm)
                        </label>
                        <Input
                          id="adv-w"
                          type="number"
                          min={0}
                          disabled={presetSize}
                          value={adv.width}
                          onChange={(event) =>
                            setAdvField('width', event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="adv-h" className="text-sm font-medium">
                          Altura (mm)
                        </label>
                        <Input
                          id="adv-h"
                          type="number"
                          min={0}
                          disabled={presetSize}
                          value={adv.height}
                          onChange={(event) =>
                            setAdvField('height', event.target.value)
                          }
                        />
                      </div>
                    </div>
                    {/* GR-2: a área útil do papel, descontada a borda que a
                        impressora não imprime; vazia = a folha inteira */}
                    {sheetFormat && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="adv-uw"
                            className="text-sm font-medium"
                          >
                            Largura útil (mm)
                          </label>
                          <Input
                            id="adv-uw"
                            type="number"
                            min={0}
                            placeholder="A folha inteira"
                            value={usable.width}
                            onChange={(event) =>
                              setUsable((current) => ({
                                ...current,
                                width: event.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="adv-uh"
                            className="text-sm font-medium"
                          >
                            Altura útil (mm)
                          </label>
                          <Input
                            id="adv-uh"
                            type="number"
                            min={0}
                            placeholder="A folha inteira"
                            value={usable.height}
                            onChange={(event) =>
                              setUsable((current) => ({
                                ...current,
                                height: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                    {/* AP-4 (05/10/2026): o padrão da cobrança fica no
                      material; a etapa do produto pode trocar */}
                    <label className="flex items-start justify-between gap-4">
                      <span>
                        <span className="block text-sm font-medium">
                          Cobrar a folha inteira
                        </span>
                        <span className="block text-sm text-gray">
                          Desligado, o aproveitamento cobra só a fração usada,
                          como no ACM. A etapa do produto pode trocar.
                        </span>
                      </span>
                      <Switch
                        checked={wholeSheets}
                        onCheckedChange={setWholeSheets}
                        aria-label="Cobrar a folha inteira"
                      />
                    </label>
                  </>
                )}
                {unit !== 'KG' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="adv-weight"
                        className="text-sm font-medium"
                      >
                        Peso por {weightUnitLabel[unit as string] || 'unidade'}{' '}
                        (kg)
                      </label>
                      <Input
                        id="adv-weight"
                        type="number"
                        min={0}
                        step="0.001"
                        value={adv.weight}
                        onChange={(event) =>
                          setAdvField('weight', event.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Variações (MT-2, MT-3, MT-4): cadastro aqui, custo e preço de
              cada combinação pelo R$ da lista */}
          {isEdit && material ? (
            <div className="space-y-3 rounded-lg border border-gray-200 p-3">
              <div>
                <p className="text-sm font-medium">Variações</p>
                <p className="text-sm text-gray">
                  Marcas e cores separadas por vírgula. O sistema cria uma
                  combinação para cada marca × cor, com o mesmo custo, e a venda
                  passa a exigir a escolha da variação.
                </p>
              </div>
              {material.variations.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {material.variations.map((variation) => (
                    <Badge key={variation.id} variant="neutralLight">
                      {variation.brand} · {variation.color}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
                <div className="space-y-1.5">
                  <label htmlFor="brands" className="text-sm font-medium">
                    Marcas
                  </label>
                  <Input
                    id="brands"
                    value={brands}
                    placeholder="Marca X, Marca Y"
                    onChange={(event) => setBrands(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="colors" className="text-sm font-medium">
                    Cores
                  </label>
                  <Input
                    id="colors"
                    value={colors}
                    placeholder="Branca, Preta"
                    onChange={(event) => setColors(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="variation-cost"
                    className="text-sm font-medium"
                  >
                    Custo por combinação
                  </label>
                  <Input
                    id="variation-cost"
                    type="number"
                    min={0}
                    step="0.01"
                    startAdornment={<span className="text-sm">R$</span>}
                    value={variationCost}
                    onChange={(event) => setVariationCost(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray">
                  {combinations > 0
                    ? `Serão criadas ${combinations} combinações (${brandList.length} marcas × ${colorList.length} cores).`
                    : 'Custo e preço de cada combinação ficam no R$ da lista.'}
                </p>
                <Button
                  type="button"
                  variant="neutralOutline"
                  LeftIcon={IconPlus}
                  isLoading={isAddingVariations}
                  disabled={!combinations || !variationCost}
                  onClick={() => addVariations()}
                >
                  Cadastrar variações
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray">
              Marca e cor entram depois do cadastro, como variações, na edição
              do material. Espessuras e tamanhos diferentes são materiais
              diferentes.
            </p>
          )}
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            {isEdit && material && (
              <Button
                type="button"
                variant={material.active ? 'errorOutline' : 'successOutline'}
                onClick={() => setStatusOpen(true)}
              >
                {material.active ? 'Inativar' : 'Reativar'}
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <DialogClose asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              isLoading={isPending}
              disabled={!name || !sectorId}
              onClick={() => mutate()}
            >
              {isEdit ? 'Salvar' : 'Cadastrar material'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      {isEdit && material && (
        <InactivateMaterialDialog
          material={material}
          open={statusOpen}
          onOpenChange={setStatusOpen}
          onDone={() => setOpen(false)}
        />
      )}
    </Dialog>
  )
}
