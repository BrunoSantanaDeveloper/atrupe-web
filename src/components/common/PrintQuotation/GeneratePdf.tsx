'use client'

// Lib
import {
  maskCnpj,
  formatCurrencyToBrl,
  calculateQuotationTotals,
  adaptNewItemsToOldFormat,
  maskCpfCnpj,
  MaskPhoneNumber,
} from '@/lib/utils'
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image as PDFImage,
} from '@react-pdf/renderer'
import {
  calculateTotalQuantity,
  calculateDisplayUnitValue,
  generateFormattedQuantityDetails,
} from '@/lib/quotation-display-utils'
import { formatToLocaleDate } from '@/lib/formatDate'
import { getProxiedImageUrl } from '@/lib/image-proxy'

// Types
import type { PrintOptionsType } from './PrintQuotationDialog'
import type { PrintQuotationType } from '@/types/print/quotation'

// Components
import { PdfHeader } from '@/components/common/PdfHeader'
import { PreviewText } from './PreviewText'

// Icons
import {
  PhoneIcon,
  EmailIcon,
  DocumentIcon,
  MoneySignIcon,
  TruckDeliveryIcon,
} from '@/assets/icons/PdfIcons'

const styles = StyleSheet.create({
  page: {
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    fontFamily: 'Helvetica',
    fontSize: 8,
    paddingBottom: 30,
    paddingTop: 30,
  },
  infoContainer: {
    padding: 30,
    paddingTop: 0,
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoBlock: {
    width: '33%',
    lineHeight: 0.7,
  },
  infoBlockRight: {
    width: '33%',
    lineHeight: 0.7,
    textAlign: 'right',
  },
  infoTitle: {
    fontSize: 9,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  infoTitleService: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#039855',
    marginBottom: 4,
  },
  infoTitleProduction: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#DC6803',
    marginBottom: 4,
  },
  infoBold: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  table: {
    width: '100%',
    marginVertical: 8,
    marginTop: -4,
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'flex-start',
    minHeight: 60,
  },
  itemImage: {
    width: 86,
    height: 68,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 6,
    gap: 2,
  },
  itemTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
    lineHeight: 1.15,
  },
  itemDescription: {
    fontSize: 6,
    color: '#4B5563',
  },
  itemTechnicalDescriptionRow: {
    marginTop: -34,
    marginLeft: 116,
    paddingRight: 4,
  },
  itemTechnicalDescriptionRowNoImage: {
    marginTop: 3,
    marginLeft: 22,
    paddingRight: 4,
  },
  itemTechnicalDescription: {
    fontSize: 6.5,
    color: '#111827',
    lineHeight: 1.05,
  },
  itemTechnicalLabel: {
    fontWeight: 'bold',
  },
  totalsSection: {
    marginTop: -6,
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 3.5,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3.5,
    marginBottom: -3,
  },
  totalDivider: {
    borderTopWidth: 0.5,
    borderColor: '#374151',
    marginVertical: 4,
    opacity: 0.8,
  },
  deliveryPaymentSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 24,
    marginTop: 5,
    marginBottom: 0,
    lineHeight: 0.6,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'semibold',
    marginBottom: 4,
    marginTop: 5,
  },
  conditions: {
    marginBottom: 40,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  signatureLine: {
    width: '33%',
    borderTopWidth: 1,
    borderColor: '#000000',
    paddingTop: 4,
    alignItems: 'center',
    position: 'relative',
  },
  signatureImage: {
    position: 'absolute',
    top: -30,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 80,
    height: 40,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D0D5DD',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280',
  },
  watermark: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    transform: 'rotate(-45deg)',
  },
  infoDate: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    gap: 10,
    width: '100%',
    lineHeight: 0.7,
  },
  unitBadge: {
    backgroundColor: '#EFF8FF',
    color: '#1849A9',
    fontSize: 6,
    fontWeight: 'medium',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  // Estilos para colunas da tabela
  columnNumber: {
    justifyContent: 'flex-start',
    paddingTop: 1,
  },
  columnNumberText: {
    fontSize: 7,
    color: '#374151',
  },
  columnReference: {
    flexDirection: 'row',
    gap: 8,
  },
  columnReferenceProduction: {
    width: '85%',
    flexDirection: 'row',
    gap: 8,
  },
  columnReferenceNormal: {
    width: '35%',
    flexDirection: 'row',
    gap: 8,
  },
  columnQtyItem: {
    width: '10%',
  },
  columnQtyItemProduction: {
    width: '15%',
  },
  columnDetails: {
    width: '15%',
  },
  columnQtyTotal: {
    width: '12%',
  },
  columnUnitValue: {
    width: '9%',
  },
  columnDiscount: {
    width: '9%',
  },
  columnFinalValue: {
    width: '10%',
  },
  // Estilos para textos das colunas
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textCenterSmall: {
    textAlign: 'center',
    fontSize: 7,
  },
  textComposition: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 7,
  },
  textDiscount: {
    textAlign: 'right',
    color: '#DC6803',
    fontSize: 7,
  },
  // Estilos para textos específicos
  textSmallGray: {
    fontSize: 7,
    color: '#6B7280',
    marginTop: 2,
  },
  textBold: {
    fontWeight: 'bold',
  },
  textBoldWithMargin: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  // Estilos para containers específicos
  deliveryContainer: {
    width: '100%',
  },
  deliveryContainerHalf: {
    width: '48%',
  },
  paymentContainer: {
    marginTop: 4,
  },
  signatureSpacing: {
    width: '33%',
  },
  dividerContainer: {
    marginTop: 5,
    marginBottom: 5,
  },
  paymentContainerConditional: {
    width: '48%',
  },
  paymentContainerFull: {
    width: '100%',
  },
  combinedUndefinedNote: {
    width: '100%',
    fontSize: 7,
    textAlign: 'center',
    marginTop: 6,
  },
  itemImageLarge: {
    width: '100%',
    height: 160,
    objectFit: 'contain',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  itemRowWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 5,
    paddingBottom: 6,
  },
  itemRowContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
})

interface Props {
  data: PrintQuotationType
  printOptions: PrintOptionsType
  type: 'quotation' | 'order' | 'production'
}

// Tipo para adaptação da composição
type CompositionItemType = {
  id: string
  originalCompositionId: string
  name: string
  unitOfMeasure: string
  quantity: number
  originalQuantity: number
  unitValue: number
  totalValue: number
  weight: number
  width: number
  height: number
  duration: number
  length: number
  distance: number
  volume: number
}

// Função para adaptar composição do PDF para o formato esperado pelas funções utilitárias
function hasPrintableValue(value?: string | number | null) {
  return String(value ?? '').trim().length > 0
}

function adaptCompositionForDisplayUtils(comp: CompositionItemType) {
  // Inferir o tipo de unidade baseado nas dimensões disponíveis
  let unitKind = 'UNITY'

  if (comp.width && comp.height) {
    unitKind = 'AREA'
  } else if (comp.length) {
    unitKind = 'LENGTH'
  } else if (comp.volume) {
    unitKind = 'CAPACITY'
  } else if (comp.weight) {
    unitKind = 'WEIGHT'
  } else if (comp.distance) {
    unitKind = 'DISTANCE'
  } else if (comp.duration) {
    unitKind = 'DURATION'
  }

  return {
    ...comp,
    unitKind, // Adicionar unitKind inferido
    unitOfMeasure: comp.unitOfMeasure
      ? {
          id: '',
          code: comp.unitOfMeasure,
          name: comp.unitOfMeasure,
          kind: unitKind,
        }
      : undefined,
  }
}

export function GeneratePdf({ data, printOptions, type }: Props) {
  // Adaptar itens da nova API para o formato antigo e calcular totais
  const adaptedItems = adaptNewItemsToOldFormat(data.quotationItems)
  const totals = calculateQuotationTotals(adaptedItems)

  // Incluir o frete no total final
  const freightPrice = data.delivery?.freightPrice || 0
  // Nota: data.total.finalTotal do backend pode incluir desconto de condição de pagamento,
  // o que geraria um total incorreto no PDF. Calculamos diretamente a partir do subtotal
  // e do desconto dos itens, igual ao que o corpo do orçamento exibe.
  const pdfSubtotal = data.total?.subtotal ?? totals.subtotal
  const pdfTotalDiscount = data.total?.totalDiscount ?? 0
  const finalTotalWithFreight = pdfSubtotal - pdfTotalDiscount + freightPrice
  const hasTotalDiscount = pdfTotalDiscount > 0.01
  const hasItemDiscounts = data.quotationItems.some(
    (item) => Math.max(0, item.totalValue - item.finalValue) > 0.01,
  )
  const shouldShowItemDiscounts =
    hasItemDiscounts &&
    (printOptions.showUnitValue ||
      printOptions.showFinalValue ||
      printOptions.showTotalValue)

  // As inconsistências agora são tratadas no componente pai PrintQuotationDialog
  // O PDF sempre usa os valores corretos calculados

  const isProduction = type === 'production'
  const showWatermark = data.quotation?.status === 'OPEN'
  const clientDocument = data.client?.document?.value
  const clientPhone = data.client?.phone
  const clientEmail = data.client?.email
  const paymentInstallments = data.payment?.installments ?? []

  const getInstallmentMethod = (inst: (typeof paymentInstallments)[0]) =>
    inst.paymentMethod || inst.paymentCondition || data.payment?.method || ''
  const hasDifferentInstallmentMethod =
    paymentInstallments.length > 1 &&
    paymentInstallments.some(
      (inst) =>
        getInstallmentMethod(inst) !==
        getInstallmentMethod(paymentInstallments[0]),
    )
  const paymentDueDates = paymentInstallments
    .map((inst) => (inst.dueDate ? new Date(inst.dueDate).getTime() : null))
    .filter((d): d is number => d !== null)
  const paymentDateGaps = paymentDueDates
    .slice(1)
    .map((d, i) => Math.round((d - paymentDueDates[i]) / 86400000))
  const hasIrregularInstallmentDates =
    paymentDateGaps.length > 1 &&
    paymentDateGaps.some((gap) => gap !== paymentDateGaps[0])
  const shouldDetailPayment =
    hasDifferentInstallmentMethod || hasIrregularInstallmentDates

  // Verificar se há produtos compostos (múltiplas composições)
  const hasCompositeProducts = data.quotationItems.some(
    (item) => item.product.compositions.length > 1,
  )

  // Função para calcular larguras dinâmicas das colunas
  const getColumnWidths = () => {
    const numberWidth = 4

    if (isProduction) {
      return {
        number: `${numberWidth}%`,
        reference: `${55 - numberWidth}%`,
        qtyItem: '15%',
        details: '15%',
        qtyTotal: '15%',
        unitValue: '0%',
        discount: '0%',
        finalValue: '0%',
      }
    }

    // Larguras base quando todas as colunas estão visíveis
    const baseWidths = {
      reference: 38 - numberWidth,
      qtyItem: 8,
      details: 12,
      qtyTotal: 11,
      unitValue: 8,
      discount: 8,
      finalValue: 9,
    }

    // Calcular total de largura utilizada
    let totalWidth =
      baseWidths.reference + baseWidths.qtyItem + baseWidths.details

    if (printOptions.showDimensions) totalWidth += baseWidths.qtyTotal
    if (printOptions.showUnitValue) totalWidth += baseWidths.unitValue
    if (shouldShowItemDiscounts) totalWidth += baseWidths.discount
    if (printOptions.showFinalValue) totalWidth += baseWidths.finalValue

    // Calcular espaço restante e distribuir proporcionalmente
    const remainingSpace = 100 - totalWidth
    const distributeExtra = remainingSpace > 0

    // Função para ajustar largura
    const adjustWidth = (baseWidth: number, canGrow: boolean = true) => {
      if (!distributeExtra || !canGrow) return `${baseWidth}%`
      const proportion = baseWidth / totalWidth
      return `${baseWidth + remainingSpace * proportion}%`
    }

    return {
      number: `${numberWidth}%`,
      reference: adjustWidth(baseWidths.reference),
      qtyItem: adjustWidth(baseWidths.qtyItem),
      details: adjustWidth(baseWidths.details),
      qtyTotal: printOptions.showDimensions
        ? adjustWidth(baseWidths.qtyTotal)
        : '0%',
      unitValue: printOptions.showUnitValue
        ? adjustWidth(baseWidths.unitValue)
        : '0%',
      discount: shouldShowItemDiscounts
        ? adjustWidth(baseWidths.discount)
        : '0%',
      finalValue: printOptions.showFinalValue
        ? adjustWidth(baseWidths.finalValue)
        : '0%',
    }
  }

  const columnWidths = getColumnWidths()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho - marginTop negativo cancela paddingTop da Page para colar ao topo */}
        <View style={{ marginTop: -30 }}>
          <PdfHeader company={data.company} />
        </View>

        <View style={styles.infoContainer}>
          {/* Informações do Cliente e Orçamento */}
          <View style={styles.infoSection}>
            <View style={styles.infoBlock}>
              <Text>Destinado a</Text>
              <Text style={styles.infoBold}>{data.client?.name}</Text>
              {hasPrintableValue(clientDocument) && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <DocumentIcon />
                  <Text>{maskCpfCnpj(clientDocument)}</Text>
                </View>
              )}
              {hasPrintableValue(clientPhone) && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <PhoneIcon />
                  <Text>{MaskPhoneNumber(clientPhone)}</Text>
                </View>
              )}
              {hasPrintableValue(clientEmail) && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <EmailIcon />
                  <Text>{clientEmail}</Text>
                </View>
              )}
              {isProduction && data.client?.notes && (
                <Text style={styles.textSmallGray}>{data.client.notes}</Text>
              )}
            </View>

            {data.contact?.name && (
              <View style={styles.infoBlock}>
                <>
                  <Text>A/C</Text>
                  <Text style={styles.infoBold}>{data.contact.name}</Text>
                  {hasPrintableValue(data.contact?.phone) && (
                    <Text>{data.contact.phone}</Text>
                  )}
                  {hasPrintableValue(data.contact?.email) && (
                    <Text>{data.contact.email}</Text>
                  )}
                </>
              </View>
            )}

            <View style={styles.infoBlockRight}>
              <Text
                style={
                  type === 'order'
                    ? styles.infoTitleService
                    : isProduction
                      ? styles.infoTitleProduction
                      : { fontWeight: 'normal' }
                }
              >
                {type === 'quotation'
                  ? 'Orçamento'
                  : type === 'order'
                    ? 'Ordem de Serviço'
                    : 'Ficha de Produção'}
                : {data.quotation?.seriesCode}-{data.quotation?.number}
              </Text>
              <Text style={styles.textBoldWithMargin}>
                {data.quotation?.description}
              </Text>
              {!isProduction && (
                <>
                  <Text>
                    Emissão: {formatToLocaleDate(data.quotation?.createdAt)}
                  </Text>
                  <Text>
                    Validade: {formatToLocaleDate(data.quotation?.dueDate)}
                  </Text>
                </>
              )}
              <Text>Vendedor: {data.quotation?.seller?.name}</Text>
            </View>
          </View>

          {/* Texto Introdutório - não mostrar para produção */}
          {!isProduction && (
            <View>
              <Text>{data?.company.textBeforeItems}</Text>
              <View style={styles.totalDivider} />
            </View>
          )}

          {isProduction && <View style={styles.totalDivider} />}

          {/* Tabela de Itens */}
          <View style={styles.table}>
            {isProduction && (
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: columnWidths.number, textAlign: 'center' },
                  ]}
                >
                  #
                </Text>
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: columnWidths.reference },
                  ]}
                >
                  REFERÊNCIA
                </Text>

                {hasCompositeProducts && (
                  <Text
                    style={[
                      styles.tableHeaderCell,
                      {
                        width: columnWidths.qtyItem,
                        textAlign: 'center',
                      },
                    ]}
                  >
                    QTD. ITEM
                  </Text>
                )}

                <Text
                  style={[
                    styles.tableHeaderCell,
                    {
                      width: hasCompositeProducts
                        ? columnWidths.details
                        : `${parseFloat(columnWidths.qtyItem) + parseFloat(columnWidths.details)}%`,
                      textAlign: 'center',
                    },
                  ]}
                >
                  DETALHAMENTO
                </Text>

                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: columnWidths.qtyTotal, textAlign: 'center' },
                  ]}
                >
                  QTD. TOTAL
                </Text>
              </View>
            )}

            {data.quotationItems.map((item, index) => {
              const isComposite = item.product.compositions.length > 1

              // Para produtos simples (1 composição), renderizar apenas a linha da composição
              if (!isComposite && item.product.compositions.length === 1) {
                const composition = item.product.compositions[0]
                // Determinar tamanho da imagem: usa size se disponível, senão fallback para lógica legada
                const imageSize =
                  item.image?.size ??
                  (item.image?.original !== false ? 'small' : 'large')
                const showSmallImage =
                  printOptions.showImages &&
                  imageSize === 'small' &&
                  item.image?.url
                const showLargeImage =
                  printOptions.showImages &&
                  imageSize === 'large' &&
                  item.image?.url

                return (
                  <View
                    key={item.id || index}
                    style={styles.itemRowWrapper}
                    wrap={false}
                    minPresenceAhead={10}
                  >
                    {/* Linha com informações do produto */}
                    <View style={styles.itemRowContent}>
                      {/* Coluna Número */}
                      <View
                        style={[
                          styles.columnNumber,
                          { width: columnWidths.number },
                        ]}
                      >
                        <Text style={styles.columnNumberText}>
                          {index + 1}.
                        </Text>
                      </View>
                      {/* Coluna Referência - Nome da composição diretamente */}
                      <View
                        style={{
                          flexDirection: 'column',
                          width: columnWidths.reference,
                          gap: 2,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 6,
                            alignItems: 'flex-start',
                          }}
                        >
                          {showSmallImage && (
                            <View style={styles.itemImage}>
                              <PDFImage
                                src={getProxiedImageUrl(item.image?.url)}
                                style={{
                                  width: 86,
                                  height: 68,
                                  objectFit: 'contain',
                                }}
                              />
                            </View>
                          )}
                          <View style={{ flex: 1, gap: 2 }}>
                            <Text style={styles.itemTitle}>
                              {item?.description || '-'}
                            </Text>
                            {isProduction && item.technicalDescription && (
                              <Text style={styles.itemDescription}>
                                {item.technicalDescription}
                              </Text>
                            )}
                            {isProduction && item.notes && (
                              <Text
                                style={[
                                  styles.itemDescription,
                                  { fontStyle: 'italic' },
                                ]}
                              >
                                {item.notes}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>

                      {/* Detalhamento - para produtos simples */}
                      {!isProduction && (
                        <View
                          style={{
                            width: `${parseFloat(columnWidths.qtyItem) + parseFloat(columnWidths.details)}%`,
                          }}
                        >
                          <Text style={styles.textCenterSmall}>
                            {(() => {
                              const adaptedComp =
                                adaptCompositionForDisplayUtils(composition)
                              const compositionQty =
                                composition.quantity ||
                                composition.originalQuantity ||
                                1
                              const unitKind =
                                adaptedComp.unitKind?.toUpperCase() || 'UNITY'
                              let details = `${compositionQty} un`

                              if (
                                printOptions.showDimensions &&
                                unitKind !== 'UNITY'
                              ) {
                                const fullDetails =
                                  generateFormattedQuantityDetails(adaptedComp)
                                // Extrair apenas a parte das dimensões (tudo após "un ")
                                const dimensionPart = fullDetails.replace(
                                  /^\d+\s+un\s*/,
                                  '',
                                )
                                if (dimensionPart) {
                                  details += ` ${dimensionPart}`
                                }
                              }

                              return details
                            })()}
                          </Text>
                        </View>
                      )}

                      {/* Detalhamento - para produtos simples na ficha de produção */}
                      {isProduction && (
                        <View
                          style={{
                            width: `${parseFloat(columnWidths.qtyItem) + parseFloat(columnWidths.details)}%`,
                          }}
                        >
                          <Text style={styles.textCenterSmall}>
                            {(() => {
                              const adaptedComp =
                                adaptCompositionForDisplayUtils(composition)
                              const compositionQty =
                                composition.quantity ||
                                composition.originalQuantity ||
                                1
                              const unitKind =
                                adaptedComp.unitKind?.toUpperCase() || 'UNITY'
                              let details = `${compositionQty} un`

                              if (unitKind !== 'UNITY') {
                                const fullDetails =
                                  generateFormattedQuantityDetails(adaptedComp)
                                // Extrair apenas a parte das dimensões (tudo após "un ")
                                const dimensionPart = fullDetails.replace(
                                  /^\d+\s+un\s*/,
                                  '',
                                )
                                if (dimensionPart) {
                                  details += ` ${dimensionPart}`
                                }
                              }

                              return details
                            })()}
                          </Text>
                        </View>
                      )}

                      {/* Qtd. Total */}
                      {(printOptions.showDimensions || isProduction) && (
                        <View style={{ width: columnWidths.qtyTotal }}>
                          <Text style={styles.textCenterSmall}>
                            {
                              calculateTotalQuantity(
                                item.product.quantity,
                                adaptCompositionForDisplayUtils(composition),
                              ).formatted
                            }
                          </Text>
                        </View>
                      )}

                      {/* Valor Un. - valor do item dividido pela quantidade comercial */}
                      {!isProduction && printOptions.showUnitValue && (
                        <View style={{ width: columnWidths.unitValue }}>
                          <Text style={styles.textRight}>
                            {formatCurrencyToBrl(
                              calculateDisplayUnitValue(
                                item.product.quantity || 1,
                                {
                                  ...adaptCompositionForDisplayUtils(
                                    composition,
                                  ),
                                  totalValue: item.totalValue,
                                },
                              ),
                            )}
                          </Text>
                        </View>
                      )}

                      {/* Desconto - desconto do item */}
                      {!isProduction && shouldShowItemDiscounts && (
                        <View style={{ width: columnWidths.discount }}>
                          <Text style={styles.textDiscount}>
                            -
                            {formatCurrencyToBrl(
                              Math.max(0, item.totalValue - item.finalValue),
                            )}
                          </Text>
                        </View>
                      )}

                      {/* Valor Final - valor final do item */}
                      {!isProduction && printOptions.showFinalValue && (
                        <View style={{ width: columnWidths.finalValue }}>
                          <Text style={styles.textRight}>
                            {formatCurrencyToBrl(item.finalValue)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {!isProduction && item.technicalDescription && (
                      <View
                        style={{
                          marginTop: 4,
                          marginLeft: showSmallImage ? 113 : 22,
                        }}
                      >
                        <Text style={styles.itemTechnicalDescription}>
                          <Text style={styles.itemTechnicalLabel}>
                            Descritivo técnico:{' '}
                          </Text>
                          {item.technicalDescription}
                        </Text>
                      </View>
                    )}

                    {/* Imagem grande abaixo das informações quando não for original */}
                    {showLargeImage && (
                      <PDFImage
                        src={getProxiedImageUrl(item.image?.url)}
                        style={styles.itemImageLarge}
                      />
                    )}
                  </View>
                )
              }

              // Para produtos compostos, manter comportamento atual
              // Determinar tamanho da imagem: usa size se disponível, senão fallback para lógica legada
              const imageSize =
                item.image?.size ??
                (item.image?.original !== false ? 'small' : 'large')
              const showSmallImage =
                printOptions.showImages &&
                imageSize === 'small' &&
                item.image?.url
              const showLargeImage =
                printOptions.showImages &&
                imageSize === 'large' &&
                item.image?.url

              return (
                <View
                  key={item.id || index}
                  style={styles.itemRowWrapper}
                  wrap={false}
                  minPresenceAhead={10}
                >
                  {/* Linha com informações do produto */}
                  <View style={styles.itemRowContent}>
                    {/* Coluna Número */}
                    <View
                      style={[
                        styles.columnNumber,
                        { width: columnWidths.number },
                      ]}
                    >
                      <Text style={styles.columnNumberText}>{index + 1}.</Text>
                    </View>
                    {/* Coluna Referência - Imagem e Descrição do item */}
                    <View
                      style={{
                        flexDirection: 'column',
                        width: columnWidths.reference,
                        gap: 2,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 6,
                          alignItems: 'flex-start',
                        }}
                      >
                        {showSmallImage && (
                          <View style={styles.itemImage}>
                            <PDFImage
                              src={getProxiedImageUrl(item.image?.url)}
                              style={{
                                width: 86,
                                height: 68,
                                objectFit: 'contain',
                              }}
                            />
                          </View>
                        )}
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={styles.itemTitle}>
                            {item.description || '-'}
                          </Text>
                          {isProduction && item.technicalDescription && (
                            <Text style={styles.itemDescription}>
                              {item.technicalDescription}
                            </Text>
                          )}
                          {isProduction && item.notes && (
                            <Text
                              style={[
                                styles.itemDescription,
                                { fontStyle: 'italic' },
                              ]}
                            >
                              {item.notes}
                            </Text>
                          )}
                          {(isProduction ||
                            (printOptions.showDimensions &&
                              printOptions.showItemsDetails)) &&
                            item.product.compositions.map((comp) => (
                              <Text
                                key={comp.id}
                                style={styles.itemDescription}
                              >
                                {comp?.name}
                              </Text>
                            ))}
                        </View>
                      </View>
                    </View>

                    {/* Coluna Qtd. Item */}
                    {!isProduction && (
                      <View style={{ width: columnWidths.qtyItem }}>
                        <Text style={styles.textCenter}>
                          {item.product.quantity || 1}
                        </Text>
                        {printOptions.showDimensions &&
                          printOptions.showItemsDetails &&
                          item.product.compositions.map((comp) => (
                            <Text key={comp.id} style={styles.textComposition}>
                              {item.product.quantity || 1}
                            </Text>
                          ))}
                      </View>
                    )}

                    {/* Coluna Detalhamento - para não-produção */}
                    {!isProduction && (
                      <View style={{ width: columnWidths.details }}>
                        <Text style={styles.textCenterSmall}>-</Text>
                        {printOptions.showItemsDetails &&
                          item.product.compositions.map((comp) => {
                            const adaptedComp =
                              adaptCompositionForDisplayUtils(comp)
                            const compositionQty =
                              comp.quantity || comp.originalQuantity || 1
                            const unitKind =
                              adaptedComp.unitKind?.toUpperCase() || 'UNITY'
                            let details = `${compositionQty} un`

                            if (
                              printOptions.showDimensions &&
                              unitKind !== 'UNITY'
                            ) {
                              const fullDetails =
                                generateFormattedQuantityDetails(adaptedComp)
                              // Extrair apenas a parte das dimensões (tudo após "un ")
                              const dimensionPart = fullDetails.replace(
                                /^\d+\s+un\s*/,
                                '',
                              )
                              if (dimensionPart) {
                                details += ` ${dimensionPart}`
                              }
                            }

                            return (
                              <Text
                                key={comp.id}
                                style={styles.textComposition}
                              >
                                {details}
                              </Text>
                            )
                          })}
                      </View>
                    )}

                    {/* Coluna Qtd. Item para produção com produtos compostos */}
                    {isProduction && (
                      <View style={{ width: columnWidths.qtyItem }}>
                        <Text style={styles.textCenterSmall}>
                          {item.product.quantity || 1}
                        </Text>
                        {item.product.compositions.map((comp) => (
                          <Text key={comp.id} style={styles.textComposition}>
                            {item.product.quantity || 1}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* Coluna Detalhamento para produção com produtos compostos */}
                    {isProduction && (
                      <View style={{ width: columnWidths.details }}>
                        <Text style={styles.textCenterSmall}>-</Text>
                        {item.product.compositions.map((comp) => {
                          const adaptedComp =
                            adaptCompositionForDisplayUtils(comp)
                          const compositionQty =
                            comp.quantity || comp.originalQuantity || 1
                          const unitKind =
                            adaptedComp.unitKind?.toUpperCase() || 'UNITY'
                          let details = `${compositionQty} un`

                          if (unitKind !== 'UNITY') {
                            const fullDetails =
                              generateFormattedQuantityDetails(adaptedComp)
                            // Extrair apenas a parte das dimensões (tudo após "un ")
                            const dimensionPart = fullDetails.replace(
                              /^\d+\s+un\s*/,
                              '',
                            )
                            if (dimensionPart) {
                              details += ` ${dimensionPart}`
                            }
                          }

                          return (
                            <Text key={comp.id} style={styles.textComposition}>
                              {details}
                            </Text>
                          )
                        })}
                      </View>
                    )}

                    {/* Coluna Qtd. Total */}
                    {(printOptions.showDimensions || isProduction) && (
                      <View style={{ width: columnWidths.qtyTotal }}>
                        <Text style={styles.textCenterSmall}>
                          {`${item.product.quantity || 1} un`}
                        </Text>
                        {(isProduction ||
                          (printOptions.showDimensions &&
                            printOptions.showItemsDetails)) &&
                          item.product.compositions.map((comp) => (
                            <Text key={comp.id} style={styles.textComposition}>
                              {
                                calculateTotalQuantity(
                                  item.product.quantity,
                                  adaptCompositionForDisplayUtils(comp),
                                ).formatted
                              }
                            </Text>
                          ))}
                      </View>
                    )}

                    {/* Colunas financeiras - apenas para não-produção */}
                    {!isProduction && printOptions.showUnitValue && (
                      <View style={{ width: columnWidths.unitValue }}>
                        <Text style={styles.textRight}>
                          {formatCurrencyToBrl(
                            item.totalValue / (item.product.quantity || 1),
                          )}
                        </Text>
                        {printOptions.showDimensions &&
                          printOptions.showItemsDetails &&
                          item.product.compositions.map((comp) => (
                            <Text key={comp.id} style={styles.textComposition}>
                              {formatCurrencyToBrl(
                                calculateDisplayUnitValue(
                                  item.product.quantity || 1,
                                  adaptCompositionForDisplayUtils(comp),
                                ),
                              )}
                            </Text>
                          ))}
                      </View>
                    )}

                    {/* Colunas descontos */}
                    {!isProduction && shouldShowItemDiscounts && (
                      <View style={{ width: columnWidths.discount }}>
                        <Text style={styles.textDiscount}>
                          -
                          {formatCurrencyToBrl(
                            Math.max(0, item.totalValue - item.finalValue),
                          )}
                        </Text>
                      </View>
                    )}

                    {!isProduction && printOptions.showFinalValue && (
                      <View style={{ width: columnWidths.finalValue }}>
                        <Text style={styles.textRight}>
                          {formatCurrencyToBrl(item.finalValue)}
                        </Text>
                        {printOptions.showDimensions &&
                          printOptions.showItemsDetails &&
                          item.product.compositions.map((comp) => (
                            <Text key={comp.id} style={styles.textComposition}>
                              {formatCurrencyToBrl(comp?.totalValue || 0)}
                            </Text>
                          ))}
                      </View>
                    )}
                  </View>

                  {!isProduction && item.technicalDescription && (
                    <View
                      style={{
                        marginTop: 4,
                        marginLeft: showSmallImage ? 113 : 22,
                      }}
                    >
                      <Text style={styles.itemTechnicalDescription}>
                        <Text style={styles.itemTechnicalLabel}>
                          Descritivo técnico:{' '}
                        </Text>
                        {item.technicalDescription}
                      </Text>
                    </View>
                  )}

                  {/* Imagem grande abaixo das informações quando não for original */}
                  {showLargeImage && (
                    <PDFImage
                      src={getProxiedImageUrl(item.image?.url)}
                      style={styles.itemImageLarge}
                    />
                  )}
                </View>
              )
            })}
          </View>

          {/* Totais - apenas para não-produção */}
          {!isProduction &&
            (printOptions.showTotalValue || freightPrice > 0) && (
              <View style={styles.totalsSection}>
                {printOptions.showTotalValue && hasTotalDiscount && (
                  <View style={styles.totalRow}>
                    <Text>Subtotal itens</Text>
                    <Text>
                      {formatCurrencyToBrl(
                        data.total?.subtotal ?? totals.subtotal,
                      )}
                    </Text>
                  </View>
                )}

                {printOptions.showTotalValue && hasTotalDiscount && (
                  <View style={styles.totalRow}>
                    <Text>Desconto</Text>
                    <Text>
                      {formatCurrencyToBrl(data.total?.totalDiscount ?? 0)}
                    </Text>
                  </View>
                )}

                {printOptions.showTotalValue &&
                  (data.total?.commissionTotal ?? 0) > 0 && (
                    <View style={styles.totalRow}>
                      <Text>Comissão</Text>
                      <Text>
                        {formatCurrencyToBrl(data.total?.commissionTotal ?? 0)}
                      </Text>
                    </View>
                  )}

                {freightPrice > 0 && (
                  <View style={styles.totalRow}>
                    <Text>Frete</Text>
                    <Text>
                      {formatCurrencyToBrl(data.delivery?.freightPrice)}
                    </Text>
                  </View>
                )}

                {printOptions.showTotalValue && (
                  <View style={styles.totalRowFinal}>
                    <Text style={styles.textBold}>Total</Text>
                    <Text style={styles.textBold}>
                      {formatCurrencyToBrl(finalTotalWithFreight)}
                    </Text>
                  </View>
                )}
                <View style={styles.totalDivider} />
              </View>
            )}

          {/* Entrega e Pagamento */}
          <View
            style={
              isProduction ? { marginTop: 24 } : styles.deliveryPaymentSection
            }
          >
            {/* Seção de Entrega - só exibe se showPaymentDelivery estiver ativo */}
            {!printOptions.showPaymentDelivery && !isProduction && (
              <View style={styles.deliveryContainerHalf}>
                <TruckDeliveryIcon />
                <Text style={styles.sectionTitle}>Entrega</Text>
                <Text>*A Combinar</Text>
              </View>
            )}

            {printOptions.showPaymentDelivery && (
              <View
                style={
                  isProduction
                    ? styles.deliveryContainer
                    : styles.deliveryContainerHalf
                }
              >
                <TruckDeliveryIcon />
                <Text style={styles.sectionTitle}>Entrega</Text>
                {data.delivery?.modality &&
                  data.delivery.modality !== 'Indefinida' && (
                    <Text>{data.delivery.modality}</Text>
                  )}
                <Text>{data.delivery?.supplier?.name}</Text>
                {(() => {
                  const showDate =
                    data.delivery?.deliveryDisplayMode === 'DATE' &&
                    data.delivery?.estimatedDate
                  const showDays = !showDate && data.delivery?.daysAfterApproval

                  if (showDate) {
                    const timePart = data.delivery?.deliveryTime
                      ? ` às ${data.delivery.deliveryTime}`
                      : ''
                    return (
                      <Text>
                        Entrega em:{' '}
                        {formatToLocaleDate(data.delivery.estimatedDate)}
                        {timePart}
                      </Text>
                    )
                  }
                  if (showDays) {
                    const timePart = data.delivery?.deliveryTime
                      ? ` às ${data.delivery.deliveryTime}`
                      : ''
                    return (
                      <Text>
                        Até {data.delivery.daysAfterApproval} dias
                        {timePart}
                      </Text>
                    )
                  }
                  return null
                })()}
                <Text>
                  {[
                    data.delivery?.clientAddress?.street,
                    data.delivery?.clientAddress?.number,
                    data.delivery?.clientAddress?.complement,
                    data.delivery?.clientAddress?.neighborhood,
                    `${data.delivery?.clientAddress?.city || ''}${
                      data.delivery?.clientAddress?.state
                        ? ` - ${data.delivery?.clientAddress?.state}`
                        : ''
                    }`,
                    data.delivery?.clientAddress?.zipCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  .
                </Text>
                {isProduction && data.delivery?.supplier?.notes && (
                  <Text style={styles.textSmallGray}>
                    {data.delivery.supplier.notes}
                  </Text>
                )}
                {isProduction && data.delivery?.notes && (
                  <Text style={styles.textSmallGray}>
                    {data.delivery.notes}
                  </Text>
                )}
              </View>
            )}

            {/* Seção de Pagamento - apenas para não-produção */}
            {!isProduction && (
              <View style={styles.paymentContainerConditional}>
                <MoneySignIcon />
                <Text style={styles.sectionTitle}>Pagamento</Text>

                {printOptions.showPaymentDelivery && data.payment?.method ? (
                  // Exibição específica quando showPaymentDelivery está ativo e há dados
                  <>
                    {shouldDetailPayment ? (
                      <>
                        {data.payment?.downPayment && (
                          <Text>
                            Entrada:{' '}
                            {formatCurrencyToBrl(
                              data.payment.downPayment.amount,
                            )}{' '}
                            via{' '}
                            {data.payment.downPayment.paymentCondition?.name ||
                              data.payment.method}{' '}
                            em{' '}
                            {formatToLocaleDate(
                              data.payment.downPayment.dueDate,
                            )}
                          </Text>
                        )}
                        {paymentInstallments.map((installment, index) => (
                          <Text key={installment.number || index}>
                            Parcela {index + 1}/{paymentInstallments.length} de{' '}
                            {formatCurrencyToBrl(installment.value)} via{' '}
                            {installment.paymentMethod ||
                              installment.paymentCondition ||
                              data.payment.method}{' '}
                            em {formatToLocaleDate(installment.dueDate)}
                          </Text>
                        ))}
                      </>
                    ) : (
                      <>
                        {data.payment?.downPayment && (
                          <Text>
                            {formatCurrencyToBrl(
                              data.payment?.downPayment?.amount,
                            )}{' '}
                            (Entrada) +
                          </Text>
                        )}
                        <Text>{data.payment?.method}</Text>
                        {data.payment?.totalInstallments > 0 && (
                          <Text>
                            Até {data.payment?.totalInstallments}x no pedido
                          </Text>
                        )}
                      </>
                    )}
                    {data.payment?.description && (
                      <Text style={styles.textSmallGray}>
                        {data.payment.description}
                      </Text>
                    )}
                    {data.client?.financialNotes && (
                      <Text style={styles.textSmallGray}>
                        {data.client.financialNotes}
                      </Text>
                    )}
                  </>
                ) : printOptions.showPaymentDelivery ? (
                  // showPaymentDelivery ativo mas sem dados de pagamento
                  <>
                    <Text>A definir</Text>
                    {data.client?.financialNotes && (
                      <Text style={styles.textSmallGray}>
                        {data.client.financialNotes}
                      </Text>
                    )}
                  </>
                ) : (
                  // Exibição genérica quando showPaymentDelivery está desativo
                  <>
                    <Text>*A Combinar</Text>
                  </>
                )}
              </View>
            )}
            {!printOptions.showPaymentDelivery && !isProduction && (
              <Text style={styles.combinedUndefinedNote}>
                *Entrega e condições de pagamento serão definidas posteriormente
                e poderão impactar o valor final desta proposta.
              </Text>
            )}
          </View>

          {!isProduction && (
            <>
              <View style={styles.dividerContainer}>
                <View style={styles.totalDivider} />
              </View>
              {/* Texto após itens */}
              <Text>{data.company?.textAfterItems}</Text>

              <View style={styles.infoDate}>
                <View>
                  <Text>Atenciosamente</Text>
                  <Text style={styles.textBold}>
                    {data.quotation?.seller?.name}
                  </Text>
                </View>
                <View>
                  <Text>De acordo, ____/____/______</Text>
                </View>
              </View>

              {/* Assinaturas */}
              <View style={styles.signatures}>
                <View style={styles.signatureLine}>
                  {printOptions?.showSignature !== false &&
                    data.quotation?.seller?.signature && (
                      <PDFImage
                        src={getProxiedImageUrl(
                          data.quotation.seller.signature,
                        )}
                        style={styles.signatureImage}
                      />
                    )}
                  <Text>{data.company?.name}</Text>
                  <Text>{maskCnpj(data.company?.cnpj || '')}</Text>
                </View>
                <View style={styles.signatureSpacing} />
                <View style={styles.signatureLine}>
                  <Text>{data.client?.name}</Text>
                  <Text>{maskCpfCnpj(data.client?.document?.value)}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Rodapé */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{data.company?.name}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber }) =>
              `Orçamento #${data.quotation?.number}-${data.quotation?.seriesCode}  |  Página ${pageNumber}`
            }
          />
        </View>

        {/* Marca d'água - renderizada por último para ficar sobre todo conteúdo */}
        {showWatermark && (
          <View style={styles.watermark} fixed>
            <PreviewText width={400} height={107} opacity={0.1} />
          </View>
        )}
      </Page>
    </Document>
  )
}
