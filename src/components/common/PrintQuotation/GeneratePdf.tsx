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
    paddingTop: 90,
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
    width: 80,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 4,
    gap: 4,
  },
  itemTitle: {
    fontSize: 8,
    fontWeight: 'medium',
    color: '#111827',
    marginBottom: 2,
    marginLeft: -3,
  },
  itemDescription: {
    fontSize: 6,
    color: '#4B5563',
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
    gap: 10,
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
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    fontSize: 8,
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
  // Estilos para imagens
  itemImageFull: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
    width: '50%',
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
    width: '50%',
  },
  paymentContainerFull: {
    width: '100%',
  },
  // Estilos para imagens grandes (não originais)
  itemImageLarge: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 4,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 4,
  },
  itemRowWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 4,
    paddingBottom: 4,
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
  // Usar o valor final do backend (após desconto das condições de pagamento)
  const backendFinalTotal = data.total?.finalTotal ?? totals.finalTotal
  const finalTotalWithFreight = backendFinalTotal + freightPrice

  // As inconsistências agora são tratadas no componente pai PrintQuotationDialog
  // O PDF sempre usa os valores corretos calculados

  const isProduction = type === 'production'
  const showWatermark = data.quotation?.status === 'OPEN'

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
      reference: 35 - numberWidth,
      qtyItem: 10,
      details: 15,
      qtyTotal: 12,
      unitValue: 9,
      discount: 9,
      finalValue: 10,
    }

    // Calcular total de largura utilizada
    let totalWidth =
      baseWidths.reference + baseWidths.qtyItem + baseWidths.details

    if (printOptions.showDimensions) totalWidth += baseWidths.qtyTotal
    if (printOptions.showUnitValue) totalWidth += baseWidths.unitValue
    if (printOptions.showDiscounts) totalWidth += baseWidths.discount
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
      discount: printOptions.showDiscounts
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
        {/* Cabeçalho */}
        <PdfHeader company={data.company} />

        <View style={styles.infoContainer}>
          {/* Informações do Cliente e Orçamento */}
          <View style={styles.infoSection}>
            <View style={styles.infoBlock}>
              <Text>Destinado a</Text>
              <Text style={styles.infoBold}>{data.client?.name}</Text>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <DocumentIcon />
                <Text>{maskCpfCnpj(data.client?.document?.value)}</Text>
              </View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <PhoneIcon />
                <Text>{MaskPhoneNumber(data.client?.phone)}</Text>
              </View>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <EmailIcon />
                <Text>{data.client?.email}</Text>
              </View>
              {isProduction && data.client?.notes && (
                <Text style={styles.textSmallGray}>{data.client.notes}</Text>
              )}
            </View>

            {data.contact?.name && (
              <View style={styles.infoBlock}>
                <>
                  <Text>A/C</Text>
                  <Text style={styles.infoBold}>{data.contact.name}</Text>
                  <Text>{data.contact?.phone}</Text>
                  <Text>{data.contact?.email}</Text>
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

              {!isProduction && hasCompositeProducts && (
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

              {!isProduction && (
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
              )}

              {isProduction && hasCompositeProducts && (
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

              {isProduction && (
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
              )}

              {(printOptions.showDimensions || isProduction) && (
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: columnWidths.qtyTotal, textAlign: 'center' },
                  ]}
                >
                  QTD. TOTAL
                </Text>
              )}

              {!isProduction && printOptions.showUnitValue && (
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: columnWidths.unitValue, textAlign: 'right' },
                  ]}
                >
                  VALOR UN.
                </Text>
              )}

              {!isProduction && printOptions.showDiscounts && (
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: columnWidths.discount, textAlign: 'right' },
                  ]}
                >
                  DESCONTO
                </Text>
              )}

              {!isProduction && printOptions.showFinalValue && (
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: columnWidths.finalValue, textAlign: 'right' },
                  ]}
                >
                  VALOR FINAL
                </Text>
              )}
            </View>

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
                        style={[
                          styles.columnReference,
                          { width: columnWidths.reference },
                        ]}
                      >
                        {showSmallImage && (
                          <View style={styles.itemImage}>
                            <PDFImage
                              src={getProxiedImageUrl(item.image?.url)}
                              style={styles.itemImageFull}
                            />
                          </View>
                        )}

                        <View style={styles.itemInfo}>
                          <Text style={styles.itemTitle}>
                            {item?.description || '-'}
                          </Text>
                          {item.technicalDescription && (
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

                      {/* Valor Un. - valor do item dividido pela quantidade */}
                      {!isProduction && printOptions.showUnitValue && (
                        <View style={{ width: columnWidths.unitValue }}>
                          <Text style={styles.textRight}>
                            {formatCurrencyToBrl(
                              item.totalValue /
                                calculateTotalQuantity(
                                  item.product.quantity,
                                  adaptCompositionForDisplayUtils(composition),
                                ).value,
                            )}
                          </Text>
                        </View>
                      )}

                      {/* Desconto - desconto do item */}
                      {!isProduction && printOptions.showDiscounts && (
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

                    {/* Imagem grande abaixo das informações quando não for original */}
                    {showLargeImage && (
                      <View style={styles.itemImageLarge}>
                        <PDFImage
                          src={getProxiedImageUrl(item.image?.url)}
                          style={styles.itemImageFull}
                        />
                      </View>
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
                      style={[
                        styles.columnReference,
                        { width: columnWidths.reference },
                      ]}
                    >
                      {showSmallImage && (
                        <View style={styles.itemImage}>
                          <PDFImage
                            src={getProxiedImageUrl(item.image?.url)}
                            style={styles.itemImageFull}
                          />
                        </View>
                      )}

                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle}>
                          {item.description || '-'}
                        </Text>
                        {item.technicalDescription && (
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
                            <Text key={comp.id} style={styles.itemDescription}>
                              {comp?.name}
                            </Text>
                          ))}
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
                    {!isProduction && printOptions.showDiscounts && (
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

                  {/* Imagem grande abaixo das informações quando não for original */}
                  {showLargeImage && (
                    <View style={styles.itemImageLarge}>
                      <PDFImage
                        src={getProxiedImageUrl(item.image?.url)}
                        style={styles.itemImageFull}
                      />
                    </View>
                  )}
                </View>
              )
            })}
          </View>

          {/* Totais - apenas para não-produção */}
          {!isProduction && printOptions.showTotalValue && (
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text>Subtotal itens</Text>
                <Text>
                  {formatCurrencyToBrl(data.total?.subtotal ?? totals.subtotal)}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text>Desconto</Text>
                <Text>
                  {formatCurrencyToBrl(data.total?.totalDiscount ?? 0)}
                </Text>
              </View>

              <View style={styles.totalRow}>
                <Text>Frete</Text>
                <Text>{formatCurrencyToBrl(data.delivery?.freightPrice)}</Text>
              </View>

              <View style={styles.totalRowFinal}>
                <Text style={styles.textBold}>Total</Text>
                <Text style={styles.textBold}>
                  {formatCurrencyToBrl(finalTotalWithFreight)}
                </Text>
              </View>
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
                <Text>{data.delivery?.supplier?.name}</Text>
                {data.delivery?.estimatedDate && isProduction ? (
                  <Text>
                    Data estimada:{' '}
                    {formatToLocaleDate(data.delivery?.estimatedDate)}
                  </Text>
                ) : (
                  <Text>Até {data.delivery?.daysAfterApproval} dias</Text>
                )}
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
              <View
                style={
                  printOptions.showPaymentDelivery
                    ? styles.paymentContainerConditional
                    : styles.paymentContainerFull
                }
              >
                <MoneySignIcon />
                <Text style={styles.sectionTitle}>Pagamento</Text>

                {printOptions.showPaymentDelivery ? (
                  // Exibição específica quando showPaymentDelivery está ativo
                  <>
                    {data.payment?.downPayment && (
                      <Text>
                        {formatCurrencyToBrl(data.payment?.downPayment?.amount)}{' '}
                        (Entrada) +
                      </Text>
                    )}
                    <Text>{data.payment?.method}</Text>
                    <Text>
                      Até {data.payment?.totalInstallments}x no pedido
                    </Text>
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
                ) : (
                  // Exibição genérica quando showPaymentDelivery está desativo
                  <>
                    <Text>A combinar</Text>
                    {data.payment?.availablePaymentMethods &&
                      data.payment.availablePaymentMethods.length > 0 && (
                        <Text style={styles.paymentContainer}>
                          {data.payment.availablePaymentMethods.join(', ')}.
                        </Text>
                      )}
                    <Text style={styles.paymentContainer}>
                      Valores podem sofrer acréscimo conforme forma de
                      pagamento.
                    </Text>
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
                )}
              </View>
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
                  {data.quotation?.seller?.signature && (
                    <PDFImage
                      src={getProxiedImageUrl(data.quotation.seller.signature)}
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

        {/* Número da Página */}
        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
        />

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
