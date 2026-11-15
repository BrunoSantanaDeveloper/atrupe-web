'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

// UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Icons
import {
  IconPencil,
  IconDeviceFloppy,
  IconCloudUpload,
  IconCurrencyReal,
  IconReceipt,
} from '@tabler/icons-react'

// Form
import { commercialUnitOptions } from '@/app/(app-sidebar)/configuracoes/produtos/components/ProductFiscalData/schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  productFiscalDataSchema,
  type ProductFiscalDataFormType,
  defaultFiscalDataValues,
  fiscalDataToFormValues,
  camposFiscaisForaDoFormulario,
} from '@/app/(app-sidebar)/configuracoes/produtos/components/ProductFiscalData/schema'
import { ProductFiscalTab } from '@/app/(app-sidebar)/configuracoes/produtos/components/ProductFiscalData/ProductFiscalTab'

// Actions
import { createItemNew, getItem } from '@/actions/_cruds'
import { arredondar, valoresDoItemNaNota } from '@/lib/nota-fiscal-valores'
import { unitKindFromCommercialUnit } from '@/components/common/form/global-inputs/products/UnitCostInput'

// Types
import type { NfePrepareItem } from '@/types/fiscal/nfe-prepare'

// ─── Currency helpers (same pattern as InvoicePayment) ────────────────────────

/** Formata número para string BRL sem o símbolo R$ (ex: "4.000,00") */
function formatBRL(n: number): string {
  const safe = typeof n === 'number' && isFinite(n) ? n : Number(n) || 0
  return safe.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Converte string digitada (ex: "4.000,00" ou "4000.00") para number */
function parseBRL(raw: string): number {
  // Remove pontos de milhar, troca vírgula decimal por ponto
  const normalized = raw.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(normalized)
  return isNaN(num) ? 0 : Number(num.toFixed(2))
}

// ─── Currency Input ────────────────────────────────────────────────────────────

interface CurrencyInputProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

function CurrencyInput({
  id,
  label,
  value,
  onChange,
  disabled,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatBRL(value))
  // Só grava o que o usuário digitou. O campo mostra 2 casas e o unitário da
  // O.S. pode ter mais (R$ 100,00 em 3 peças = 33,3333…): gravar no blur o que
  // estava na tela trocava o valor da nota só por clicar no campo.
  const [digitado, setDigitado] = useState(false)

  // Sync display when value changes externally (e.g. total recalculation)
  useEffect(() => {
    setDisplay(formatBRL(value))
  }, [value])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none select-none">
          R$
        </span>
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={display}
          disabled={disabled}
          className={
            disabled ? 'pl-9 bg-gray-50 font-semibold text-gray-700' : 'pl-9'
          }
          placeholder="0,00"
          onChange={(e) => {
            setDigitado(true)
            const digits = e.target.value.replace(/\D/g, '')
            if (digits === '') {
              setDisplay('')
              return
            }
            const num = Number(digits) / 100
            setDisplay(
              num.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
            )
          }}
          onBlur={() => {
            if (!digitado) {
              setDisplay(formatBRL(value))
              return
            }
            setDigitado(false)
            const parsed = parseBRL(display || '0')
            onChange(parsed)
            setDisplay(formatBRL(parsed))
          }}
          onFocus={(e) => e.target.select()}
        />
      </div>
    </div>
  )
}

// ─── Dados fiscais do item ─────────────────────────────────────────────────────

type CampoDoCfop = 'cfopInState' | 'cfopOutState' | 'cfopExport'

/**
 * Campo da aba Dados Fiscais em que o CFOP do item aparece: 6xxx é
 * interestadual, 7xxx exportação e o resto estadual. Antes o CFOP do item ia
 * sempre no estadual, e "Salvar no produto" numa venda para fora do estado
 * gravava o 6102 como CFOP estadual do produto.
 */
function campoDoCfop(cfop?: string | number | null): CampoDoCfop {
  const digitos = String(cfop ?? '').replace(/\D/g, '')
  if (digitos.startsWith('6')) return 'cfopOutState'
  if (digitos.startsWith('7')) return 'cfopExport'
  return 'cfopInState'
}

/**
 * CFOP de venda (x101 a x129 e x401 a x405, de saída): é o que o cadastro
 * guarda como padrão do produto. Devolução (1202, 2202, 5202…), remessa e
 * transferência são da operação; gravá-los no cadastro faria a próxima venda
 * sair com eles.
 */
function ehCfopDeVenda(cfop?: string | number | null): boolean {
  return /^[567](1[0-2]\d|40[1-5])$/.test(String(cfop ?? '').replace(/\D/g, ''))
}

/**
 * O que o item da nota usa, por cima do cadastro, na aba Dados Fiscais — só
 * o que o item traz. Campo vazio no item (o GTIN, que o item da O.S. não
 * carrega; o CST de IPI do item vindo do seletor) deixava o do cadastro em
 * branco, e "Salvar no produto" apagava o cadastro.
 */
function valoresFiscaisDoItem(
  item: NfePrepareItem,
): Partial<ProductFiscalDataFormType> {
  const valores: Partial<ProductFiscalDataFormType> = {}
  if (item.productCode) valores.productCode = item.productCode
  if (item.ncm) valores.ncm = item.ncm
  if (item.ean) valores.cean = item.ean
  if (item.cstIcms) valores.icmsCst = item.cstIcms
  if (item.cstPis) valores.pisCst = item.cstPis
  if (item.cstCofins) valores.cofinsCst = item.cstCofins
  if (item.cstIpi) valores.ipiCst = item.cstIpi
  const unidade = item.uCom || item.unit
  if (unidade) valores.commercialUnit = unidade
  if (item.cfop) valores[campoDoCfop(item.cfop)] = String(item.cfop)
  return valores
}

/** Líquido do item como a nota soma (ver `valoresDoItemNaNota`). */
function totalDoItem(item: NfePrepareItem): number {
  const { valorProduto, desconto } = valoresDoItemNaNota(item)
  return arredondar(
    valorProduto - desconto + (item.freight || 0) + (item.insurance || 0),
    2,
  )
}

/**
 * Item com a quantidade levada para a nova unidade, mantendo o valor bruto
 * (quantidade x unitário). A conversão usa a razão entre a linha da O.S.
 * contada em peças e medida (`pieceQuantity`/`measureQuantity`), então vale
 * também para quantidade já editada. Sem essa razão (produto do seletor,
 * unidade sem conversão) só o rótulo muda, e o usuário confere a quantidade.
 * Antes trocar UN por M2 só trocava o rótulo: "1 UN x R$ 530" virava
 * "1 M2 x R$ 530".
 */
function converterParaUnidade(
  item: NfePrepareItem,
  nova: string,
): { item: NfePrepareItem; convertido: boolean } {
  const rotulo = { ...item, unit: nova, uCom: nova }
  const tipoAtual = unitKindFromCommercialUnit(item.uCom || item.unit)
  const tipoNovo = unitKindFromCommercialUnit(nova)
  if (tipoAtual === tipoNovo) return { item: rotulo, convertido: true }

  const pecas = item.pieceQuantity
  const medida = item.measureQuantity
  const tipoDaMedida = unitKindFromCommercialUnit(item.measureUnit)
  let fator: number | null = null
  if (pecas && medida && tipoDaMedida !== 'UNITY') {
    if (tipoAtual === 'UNITY' && tipoNovo === tipoDaMedida) {
      fator = medida / pecas
    } else if (tipoAtual === tipoDaMedida && tipoNovo === 'UNITY') {
      fator = pecas / medida
    }
  }
  const quantidade = fator ? arredondar(item.quantity * fator, 4) : 0
  if (!(quantidade >= 0.001)) return { item: rotulo, convertido: false }

  const convertido = {
    ...rotulo,
    quantity: quantidade,
    unitValue: (item.quantity * item.unitValue) / quantidade,
  }
  return {
    item: { ...convertido, totalValue: totalDoItem(convertido) },
    convertido: true,
  }
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: NfePrepareItem
  onSave: (updatedItem: NfePrepareItem) => void
  /** Se fornecido, habilita o botão "Salvar no produto" */
  productId?: string
  /** Aba inicial ao abrir o dialog (default: 'valores') */
  initialTab?: 'valores' | 'fiscal'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InvoiceItemEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
  productId,
  initialTab = 'valores',
}: Props) {
  const [formData, setFormData] = useState<NfePrepareItem>(item)
  const [isSavingToProduct, setIsSavingToProduct] = useState(false)
  const [activeTab, setActiveTab] = useState<'valores' | 'fiscal'>(initialTab)
  /**
   * Cadastro fiscal do produto: `undefined` enquanto carrega, `null` quando o
   * produto não tem cadastro. "Salvar no produto" espera a carga — gravar sem
   * ela substituiria o cadastro pelo padrão.
   */
  const [cadastroFiscal, setCadastroFiscal] = useState<
    Record<string, unknown> | null | undefined
  >(undefined)
  const [falhaNoCadastro, setFalhaNoCadastro] = useState(false)
  // Unidade já aplicada ao item (null com o diálogo fechado): a troca de
  // unidade converte a quantidade uma vez, e não a cada render.
  const unidadeDoItem = useRef<string | null>(null)
  const [semConversao, setSemConversao] = useState(false)

  // Form fiscal — instância separada para os dados fiscais
  const fiscalForm = useForm<ProductFiscalDataFormType>({
    resolver: zodResolver(productFiscalDataSchema),
    defaultValues: defaultFiscalDataValues,
  })

  // Sincronizar quando o item mudar ou o dialog abrir. A aba Dados Fiscais
  // parte do cadastro do produto, com o que o item da nota usa por cima.
  useEffect(() => {
    if (!open) {
      unidadeDoItem.current = null
      return
    }

    setFormData(item)
    setActiveTab(initialTab)
    setCadastroFiscal(undefined)
    setFalhaNoCadastro(false)
    setSemConversao(false)
    // Até o cadastro chegar, o item com os padrões de antes no que faltar.
    const iniciais = {
      ...defaultFiscalDataValues,
      productCode: '',
      ncm: '',
      cean: '',
      ipiCst: '',
      ...valoresFiscaisDoItem(item),
    }
    fiscalForm.reset(iniciais)
    unidadeDoItem.current = iniciais.commercialUnit || 'UN'

    if (!productId) return

    let cancelado = false
    getItem({ route: `/fiscal/product/${productId}` })
      .then((resultado) => {
        if (cancelado) return
        if (!resultado.success) {
          setFalhaNoCadastro(true)
          return
        }
        const cadastro = (resultado.data as Record<string, unknown>) || null
        setCadastroFiscal(cadastro)
        // Sem cadastro, fica o item com os padrões. Com ele, o cadastro com o
        // que o item traz por cima; o que o usuário já mexeu na aba fica.
        if (!cadastro) return
        fiscalForm.reset(
          {
            ...fiscalDataToFormValues(cadastro),
            ...valoresFiscaisDoItem(item),
          },
          { keepDirtyValues: true },
        )
        unidadeDoItem.current = fiscalForm.getValues('commercialUnit') || 'UN'
      })
      .catch(() => {
        if (!cancelado) setFalhaNoCadastro(true)
      })

    return () => {
      cancelado = true
    }
  }, [item, open, initialTab, fiscalForm, productId])

  // A unidade vive no fiscalForm; o watch mantém o select de Valores em dia
  // quando ela é alterada pela aba Dados Fiscais.
  const unidadeComercial = fiscalForm.watch('commercialUnit') || 'UN'

  // Trocar a unidade (em qualquer das abas) leva a quantidade junto.
  useEffect(() => {
    if (!open || unidadeDoItem.current === null) return
    if (unidadeDoItem.current === unidadeComercial) return
    // O valor do watch pode ser o de antes do reset que acabou de abrir o
    // diálogo ('UN' do padrão): sem esta conferência, abrir um item em M2
    // o convertia para UN e de volta, e a quantidade já mudava.
    if ((fiscalForm.getValues('commercialUnit') || 'UN') !== unidadeComercial)
      return
    unidadeDoItem.current = unidadeComercial
    const resultado = converterParaUnidade(formData, unidadeComercial)
    setFormData(resultado.item)
    setSemConversao(!resultado.convertido)
  }, [open, unidadeComercial, formData, fiscalForm])

  /** Atualiza um campo numérico e recalcula o total */
  const updateField = useCallback(
    (field: keyof NfePrepareItem, value: number) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value }
        // O total soma como a nota: vProd e vDesc arredondados no item.
        next.totalValue = totalDoItem(next)
        return next
      })
    },
    [],
  )

  /** Constrói o item final mesclando valores e dados fiscais */
  const buildUpdatedItem = (
    fiscal: ProductFiscalDataFormType,
  ): NfePrepareItem => {
    // A tabela mostra `unit` e a emissão lê `uCom`: os dois mudam juntos,
    // senão a nota exibia uma unidade e transmitia outra.
    const unidade = fiscal.commercialUnit || formData.uCom || formData.unit
    return {
      ...formData,
      productCode: fiscal.productCode || formData.productCode,
      ncm: fiscal.ncm || formData.ncm,
      ean: fiscal.cean || formData.ean,
      // O CFOP do item é o da operação dele (estadual, interestadual ou
      // exportação), que é o campo onde a aba o mostrou.
      cfop: fiscal[campoDoCfop(formData.cfop)] || formData.cfop,
      cstIcms: fiscal.icmsCst || formData.cstIcms,
      cstPis: fiscal.pisCst || formData.cstPis,
      cstCofins: fiscal.cofinsCst || formData.cstCofins,
      cstIpi: fiscal.ipiCst || formData.cstIpi,
      unit: unidade,
      uCom: unidade,
      needsConfiguration: false,
    }
  }

  /** "Alterar somente para NF" */
  const handleSaveForNfOnly = async () => {
    const isValid = await fiscalForm.trigger()
    if (!isValid) return

    const fiscal = fiscalForm.getValues()
    if (fiscal.ncm && fiscal.ncm.replace(/\D/g, '').length !== 8) {
      toast.error('O NCM deve conter 8 dígitos')
      return
    }

    onSave(buildUpdatedItem(fiscal))
    onOpenChange(false)
    toast.success('Item atualizado para esta NF')
  }

  /**
   * "Salvar no produto": grava no cadastro fiscal do produto o que a aba Dados
   * Fiscais mostra (NCM, CFOP, CSTs, unidade comercial…). Preço não vai para
   * o cadastro (decisão de 15/11/2026): o valor da nota é o da venda, e o
   * botão gravava o valor unitário em reais como taxa por mm² no item do
   * produto — a próxima O.S. saía com o preço errado, e o valor "voltava".
   * Os valores editados valem para esta nota.
   *
   * O upsert substitui o cadastro inteiro, por isso vai o formulário completo
   * (que partiu do cadastro) e os campos que ele não mostra. Duas coisas são
   * da nota e não do produto, e ficam como estão no cadastro:
   * - a unidade, a não ser que o usuário a tenha trocado aqui: a do item
   *   pode ter caído em peças (linha sem medida) e trocaria M2 por UN;
   * - o CFOP que não é de venda (devolução, remessa…).
   */
  const handleSaveToProduct = async () => {
    if (!productId) return

    const isValid = await fiscalForm.trigger()
    if (!isValid) return

    const fiscal = fiscalForm.getValues()
    if (fiscal.ncm && fiscal.ncm.replace(/\D/g, '').length !== 8) {
      toast.error('O NCM deve conter 8 dígitos')
      return
    }

    const doCadastro = cadastroFiscal
      ? fiscalDataToFormValues(cadastroFiscal)
      : defaultFiscalDataValues
    const unidadeTrocada = fiscalForm.getFieldState('commercialUnit').isDirty

    setIsSavingToProduct(true)
    try {
      const fiscalResult = await createItemNew({
        route: '/fiscal/product/upsert',
        data: {
          ...camposFiscaisForaDoFormulario(cadastroFiscal),
          ...fiscal,
          ...(cadastroFiscal && !unidadeTrocada
            ? { commercialUnit: doCadastro.commercialUnit }
            : {}),
          // Campo a campo, pelo valor que vai ser gravado: CFOP que não é de
          // venda (devolução, remessa…) fica o do cadastro; correção para um
          // CFOP de venda é gravada.
          cfopInState: ehCfopDeVenda(fiscal.cfopInState)
            ? fiscal.cfopInState
            : doCadastro.cfopInState,
          cfopOutState: ehCfopDeVenda(fiscal.cfopOutState)
            ? fiscal.cfopOutState
            : doCadastro.cfopOutState,
          cfopExport: ehCfopDeVenda(fiscal.cfopExport)
            ? fiscal.cfopExport
            : doCadastro.cfopExport,
          productId,
        },
      })
      if (!fiscalResult.success) {
        throw new Error(fiscalResult.message || 'Erro ao salvar dados fiscais')
      }

      onSave(buildUpdatedItem(fiscal))
      onOpenChange(false)
      toast.success(
        'Dados fiscais salvos no produto. Valores alterados valem só para esta NF.',
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao salvar no produto',
      )
    } finally {
      setIsSavingToProduct(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[740px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
              <div>
                <span>Editar Item</span>
                <p className="text-sm font-normal text-gray-500 mt-0.5">
                  {item.itemNumber} — {item.description}
                </p>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>

        {/* Tabs: Valores | Dados Fiscais */}
        <div className="border-b border-gray-100 px-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'valores' | 'fiscal')}
          >
            <TabsList className="-mb-px">
              <TabsTrigger value="valores" className="gap-1.5">
                <IconCurrencyReal size={14} />
                Valores
              </TabsTrigger>
              <TabsTrigger value="fiscal" className="gap-1.5">
                <IconReceipt size={14} />
                Dados Fiscais
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <DialogBody className="flex-1 p-6 pb-2">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'valores' | 'fiscal')}
          >
            {/* Aba Valores */}
            <TabsContent value="valores" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                {/* Descrição do Item */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-description">
                    Descrição / Nome do Item
                  </Label>
                  <Input
                    id="edit-description"
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* Quantidade + unidade andam juntas: a unidade só faz sentido
                    lendo a quantidade ao lado. O estado é o MESMO da aba Dados
                    Fiscais (fiscalForm.commercialUnit) — dois campos separados
                    divergiriam e um sobrescreveria o outro no salvar. */}
                <div className="grid grid-cols-[2fr_1fr] gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-quantity">Quantidade</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      min={0.001}
                      step="any"
                      value={formData.quantity}
                      onChange={(e) =>
                        updateField('quantity', Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-unit">Unidade</Label>
                    <Select
                      value={unidadeComercial}
                      onValueChange={(value) =>
                        fiscalForm.setValue('commercialUnit', value, {
                          shouldDirty: true,
                        })
                      }
                    >
                      <SelectTrigger id="edit-unit">
                        <SelectValue placeholder="UN" />
                      </SelectTrigger>
                      <SelectContent>
                        {commercialUnitOptions.map((opcao) => (
                          <SelectItem key={opcao.value} value={opcao.value}>
                            {opcao.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {semConversao && (
                    <p className="col-span-2 text-xs text-warning-700">
                      A unidade mudou e não há como converter a quantidade
                      automaticamente: confira a quantidade e o valor unitário.
                    </p>
                  )}
                </div>

                <CurrencyInput
                  id="edit-unit-value"
                  label="Valor Unitário"
                  value={formData.unitValue}
                  onChange={(v) => updateField('unitValue', v)}
                />

                <CurrencyInput
                  id="edit-discount"
                  label="Desconto"
                  value={formData.discount}
                  onChange={(v) => updateField('discount', v)}
                />

                <CurrencyInput
                  id="edit-freight"
                  label="Frete"
                  value={formData.freight}
                  onChange={(v) => updateField('freight', v)}
                />

                <CurrencyInput
                  id="edit-insurance"
                  label="Seguro"
                  value={formData.insurance}
                  onChange={(v) => updateField('insurance', v)}
                />

                <CurrencyInput
                  id="edit-total-value"
                  label="Valor Total (calculado)"
                  value={formData.totalValue}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </TabsContent>

            {/* Aba Dados Fiscais */}
            <TabsContent value="fiscal" className="mt-0 pb-4">
              <Form {...fiscalForm}>
                <form
                  id="edit-item-fiscal"
                  onSubmit={(e) => e.preventDefault()}
                  noValidate
                >
                  <ProductFiscalTab />
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogBody>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
            className="sm:mr-auto"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="neutralLight"
            LeftIcon={IconDeviceFloppy}
            onClick={handleSaveForNfOnly}
          >
            Alterar somente para NF
          </Button>

          {productId && (
            <Button
              type="button"
              variant="default"
              LeftIcon={IconCloudUpload}
              onClick={handleSaveToProduct}
              // Sem o cadastro carregado, gravar substituiria o cadastro
              // inteiro pelo padrão.
              disabled={
                isSavingToProduct ||
                cadastroFiscal === undefined ||
                falhaNoCadastro
              }
              isLoading={isSavingToProduct}
              title={
                falhaNoCadastro
                  ? 'Não foi possível carregar o cadastro fiscal do produto'
                  : 'Grava NCM, CFOP, CSTs e unidade no cadastro do produto. Preço não.'
              }
            >
              Salvar fiscal no produto
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
