'use client'

// Lib
import {
  maskCnpj,
  formatCurrencyToBrl,
  calculateQuotationTotals,
  adaptNewItemsToOldFormat,
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

// Types
import type { PrintOptionsType } from './PrintQuotationDialog'
import type { PrintQuotationType } from '@/types/print/quotation'

// Icons
import {
  EmailIcon,
  WebsiteIcon,
  LinkedinIcon,
  FacebookIcon,
  MoneySignIcon,
  InstagramIcon,
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    padding: 30,
    height: 76,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  companyInfo: {
    fontSize: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
  },
  companyName: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  socialInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '25%',
    paddingRight: 0,
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
    width: 70,
    height: 51,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 8,
    gap: 4,
  },
  itemTitle: {
    fontSize: 8,
    fontWeight: 'medium',
    color: '#111827',
    marginBottom: 2,
    marginLeft: -10,
  },
  itemDescription: {
    fontSize: 7,
    color: '#4B5563',
    marginLeft: 3.5,
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
    top: '30%',
    left: '30%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 100,
    color: '#000000',
    opacity: 0.1,
    fontWeight: 'bold',
    zIndex: 1,
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
  return {
    ...comp,
    unitOfMeasure: comp.unitOfMeasure
      ? {
          id: '',
          code: comp.unitOfMeasure,
          name: comp.unitOfMeasure,
          kind: 'UNITY', // valor padrão, será inferido pelas funções utilitárias
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
  const finalTotalWithFreight = totals.finalTotal + freightPrice

  // As inconsistências agora são tratadas no componente pai PrintQuotationDialog
  // O PDF sempre usa os valores corretos calculados

  const isProduction = type === 'production'
  const showWatermark = data.quotation?.status === 'OPEN'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Marca d'água - apenas se status for OPEN */}
        {showWatermark && (
          <Text style={styles.watermark} fixed>
            PRÉVIA
          </Text>
        )}

        {/* Cabeçalho */}
        <View style={styles.header} fixed>
          <View style={{ width: '35%' }}>
            <PDFImage
              src={
                data.company?.logo ||
                '/src/assets/icons/companyIconPlaceholder.png'
              }
              style={styles.logo}
            />
          </View>
          <View style={[styles.companyInfo, { width: '50%' }]}>
            <Text style={styles.companyName}>{data.company?.name}</Text>
            <Text>{maskCnpj(data.company?.cnpj)}</Text>
            <Text>
              {[
                data.company?.address?.street,
                data.company?.address?.number,
                isProduction ? data.company?.address?.neighborhood : null,
              ]
                .filter(Boolean)
                .join(', ')}
            </Text>
            {!isProduction && (
              <Text>
                {[
                  data.company?.address?.neighborhood,
                  data.company?.address?.city,
                  data.company?.address?.state,
                ]
                  .filter(Boolean)
                  .join(', ')}
                {data.company?.address?.city || data.company?.address?.state
                  ? '.'
                  : ''}
              </Text>
            )}
            {isProduction && (
              <Text>
                {[data.company?.address?.city, data.company?.address?.state]
                  .filter(Boolean)
                  .join(', ')}
                {data.company?.address?.city || data.company?.address?.state
                  ? '.'
                  : ''}
              </Text>
            )}
          </View>
          <View style={styles.socialInfo}>
            {data.company?.socialNetworks?.instagram && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <Text style={{ fontSize: 7, textAlign: 'right' }}>
                  {data.company?.socialNetworks?.instagram}
                </Text>
                <InstagramIcon />
              </View>
            )}
            {data.company?.socialNetworks?.facebook && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <Text style={{ fontSize: 7, textAlign: 'right' }}>
                  {data.company?.socialNetworks?.facebook}
                </Text>
                <FacebookIcon />
              </View>
            )}
            {data.company?.socialNetworks?.linkedin && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <Text style={{ fontSize: 7, textAlign: 'right' }}>
                  {data.company?.socialNetworks?.linkedin}
                </Text>
                <LinkedinIcon />
              </View>
            )}
            {data.company?.siteUrl && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <Text style={{ fontSize: 7, textAlign: 'right' }}>
                  {data.company?.siteUrl}
                </Text>
                <WebsiteIcon />
              </View>
            )}
            {data.company?.email && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'flex-end',
                }}
              >
                <Text style={{ fontSize: 7, textAlign: 'right' }}>
                  {data.company?.email}
                </Text>
                <EmailIcon />
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoContainer}>
          {/* Informações do Cliente e Orçamento */}
          <View style={styles.infoSection}>
            <View style={styles.infoBlock}>
              <Text>Destinado a</Text>
              <Text style={styles.infoBold}>{data.client?.name}</Text>
              <Text>{data.client?.document?.value}</Text>
              <Text>{data.client?.phone}</Text>
              <Text>{data.client?.email}</Text>
              {/* {isProduction && data.client?.notes && (
                <Text style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}>
                  {data.client.notes}
                </Text>
              )} */}
            </View>

            <View style={styles.infoBlock}>
              <Text>A/C</Text>
              <Text style={styles.infoBold}>{data.contact?.name}</Text>
              <Text>{data.contact?.phone}</Text>
              <Text>{data.contact?.email}</Text>
              {/* {isProduction && data.contact?.notes && (
                <Text style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}>
                  {data.contact.notes}
                </Text>
              )} */}
            </View>

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
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
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
                  { width: isProduction ? '85%' : '35%' },
                ]}
              >
                REFERÊNCIA
              </Text>

              {!isProduction && (
                <Text
                  style={[
                    styles.tableHeaderCell,
                    {
                      width: isProduction ? '15%' : '10%',
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
                    { width: '15%', textAlign: 'center' },
                  ]}
                >
                  DETALHAMENTO
                </Text>
              )}

              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: '12%', textAlign: 'center' },
                ]}
              >
                QTD. TOTAL
              </Text>

              {!isProduction && printOptions.showUnitValue && (
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: '9%', textAlign: 'right' },
                  ]}
                >
                  VALOR UN.
                </Text>
              )}

              {!isProduction && printOptions.showDiscounts && (
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: '9%', textAlign: 'right' },
                  ]}
                >
                  DESCONTO
                </Text>
              )}

              {!isProduction && printOptions.showFinalValue && (
                <Text
                  style={[
                    styles.tableHeaderCell,
                    { width: '10%', textAlign: 'right' },
                  ]}
                >
                  VALOR FINAL
                </Text>
              )}
            </View>

            {data.quotationItems.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow} wrap={false}>
                {/* Coluna Referência - Imagem e Descrição */}
                <View
                  style={{
                    width: isProduction ? '85%' : '35%',
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  <View style={styles.itemImage}>
                    <PDFImage
                      src={item.image?.url || '/img/product-placeholder.png'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>
                      {item.description || '-'}
                    </Text>
                    {isProduction && item.technicalDescription && (
                      <Text
                        style={[
                          styles.itemDescription,
                          { color: '#059669', fontWeight: 'medium' },
                        ]}
                      >
                        {item.technicalDescription}
                      </Text>
                    )}
                    {isProduction && item.notes && (
                      <Text
                        style={[
                          styles.itemDescription,
                          { color: '#DC6803', fontStyle: 'italic' },
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
                  <View style={{ width: isProduction ? '15%' : '10%' }}>
                    <Text style={{ textAlign: 'center' }}>
                      {item.product.quantity || 1}
                    </Text>
                    {printOptions.showDimensions &&
                      printOptions.showItemsDetails &&
                      item.product.compositions.map((comp) => (
                        <Text
                          key={comp.id}
                          style={{
                            textAlign: 'center',
                            color: '#4B5563',
                            fontSize: 7,
                          }}
                        >
                          {item.product.quantity || 1}
                        </Text>
                      ))}
                  </View>
                )}

                {/* Coluna Detalhamento - apenas para não-produção */}
                {!isProduction && (
                  <View style={{ width: '15%' }}>
                    <Text style={{ textAlign: 'center', fontSize: 7 }}>-</Text>
                    {printOptions.showDimensions &&
                      printOptions.showItemsDetails &&
                      item.product.compositions.map((comp) => (
                        <Text
                          key={comp.id}
                          style={{
                            textAlign: 'center',
                            color: '#4B5563',
                            fontSize: 7,
                          }}
                        >
                          {generateFormattedQuantityDetails(
                            adaptCompositionForDisplayUtils(comp),
                          )}
                        </Text>
                      ))}
                  </View>
                )}

                {/* Coluna Qtd. Total - sempre visível */}
                <View style={{ width: '12%' }}>
                  <Text style={{ textAlign: 'center', fontSize: 7 }}>
                    {`${item.product.quantity || 1} un`}
                  </Text>
                  {(isProduction ||
                    (printOptions.showDimensions &&
                      printOptions.showItemsDetails)) &&
                    item.product.compositions.map((comp) => (
                      <Text
                        key={comp.id}
                        style={{
                          textAlign: 'center',
                          color: '#4B5563',
                          fontSize: 7,
                        }}
                      >
                        {
                          calculateTotalQuantity(
                            item.product.quantity,
                            adaptCompositionForDisplayUtils(comp),
                          ).formatted
                        }
                      </Text>
                    ))}
                </View>

                {/* Colunas financeiras - apenas para não-produção */}
                {!isProduction && printOptions.showUnitValue && (
                  <View style={{ width: '9%' }}>
                    <Text style={{ textAlign: 'right' }}>
                      {formatCurrencyToBrl(
                        item.finalValue / (item.product.quantity || 1),
                      )}
                    </Text>
                    {printOptions.showDimensions &&
                      printOptions.showItemsDetails &&
                      item.product.compositions.map((comp) => (
                        <Text
                          key={comp.id}
                          style={{
                            textAlign: 'right',
                            color: '#4B5563',
                            fontSize: 7,
                          }}
                        >
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
                  <View style={{ width: '9%' }}>
                    <Text
                      style={{
                        textAlign: 'right',
                        color: '#DC6803',
                        fontSize: 7,
                      }}
                    >
                      -
                      {formatCurrencyToBrl(
                        Math.max(0, item.totalValue - item.finalValue),
                      )}
                    </Text>
                  </View>
                )}

                {!isProduction && printOptions.showFinalValue && (
                  <View style={{ width: '10%' }}>
                    <Text style={{ textAlign: 'right' }}>
                      {formatCurrencyToBrl(item.finalValue)}
                    </Text>
                    {printOptions.showDimensions &&
                      printOptions.showItemsDetails &&
                      item.product.compositions.map((comp) => (
                        <Text
                          key={comp.id}
                          style={{
                            textAlign: 'right',
                            color: '#4B5563',
                            fontSize: 7,
                          }}
                        >
                          {formatCurrencyToBrl(comp?.totalValue || 0)}
                        </Text>
                      ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Totais - apenas para não-produção */}
          {!isProduction && printOptions.showTotalValue && (
            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text>Subtotal itens</Text>
                <Text>{totals.formatted.subtotal}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text>Desconto</Text>
                <Text>{totals.formatted.discountLabel}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text>Frete</Text>
                <Text>{formatCurrencyToBrl(data.delivery?.freightPrice)}</Text>
              </View>

              <View style={styles.totalRowFinal}>
                <Text style={{ fontWeight: 'bold' }}>Total</Text>
                <Text style={{ fontWeight: 'bold' }}>
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
              <View style={{ width: isProduction ? '100%' : '50%' }}>
                <TruckDeliveryIcon />
                <Text style={styles.sectionTitle}>Entrega</Text>
                <Text>{data.delivery?.supplier?.name}</Text>
                <Text>Até {data.delivery?.daysAfterApproval} dias</Text>
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
                {/* {isProduction && data.delivery?.supplier?.notes && (
                  <Text style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}>
                    {data.delivery.supplier.notes}
                  </Text>
                )} */}
                {isProduction && data.delivery?.supplier?.financialNotes && (
                  <Text style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}>
                    {data.delivery.supplier.financialNotes}
                  </Text>
                )}
                {isProduction && data.delivery?.notes && (
                  <Text style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}>
                    {data.delivery.notes}
                  </Text>
                )}
              </View>
            )}

            {/* Seção de Pagamento - apenas para não-produção */}
            {!isProduction && (
              <View
                style={{
                  width: printOptions.showPaymentDelivery ? '50%' : '100%',
                }}
              >
                <MoneySignIcon />
                <Text style={styles.sectionTitle}>Pagamento</Text>

                {printOptions.showPaymentDelivery ? (
                  // Exibição específica quando showPaymentDelivery está ativo
                  <>
                    <Text>{data.payment?.method}</Text>
                    <Text>
                      Até {data.payment?.totalInstallments}x no pedido
                    </Text>
                    {data.payment?.description && (
                      <Text
                        style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}
                      >
                        {data.payment.description}
                      </Text>
                    )}
                    {data.client?.financialNotes && (
                      <Text
                        style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}
                      >
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
                        <Text style={{ marginTop: 4 }}>
                          {data.payment.availablePaymentMethods.join(', ')}.
                        </Text>
                      )}
                    <Text style={{ marginTop: 4 }}>
                      Valores podem sofrer acréscimo conforme forma de
                      pagamento.
                    </Text>
                    {data.payment?.description && (
                      <Text
                        style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}
                      >
                        {data.payment.description}
                      </Text>
                    )}
                    {data.client?.financialNotes && (
                      <Text
                        style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}
                      >
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
              <View style={{ marginTop: 5, marginBottom: 5 }}>
                <View style={styles.totalDivider} />
              </View>
              {/* Texto após itens */}
              <Text>{data.company?.textAfterItems}</Text>

              <View style={styles.infoDate}>
                <View>
                  <Text>Atenciosamente</Text>
                  <Text style={{ fontWeight: 'bold' }}>
                    {data.client?.name}
                  </Text>
                </View>
                <View>
                  <Text>De acordo, ____/____/______</Text>
                </View>
              </View>

              {/* Assinaturas */}
              <View style={styles.signatures}>
                <View style={styles.signatureLine}>
                  <Text>{data.client?.name}</Text>
                </View>
                <View style={{ width: '33%' }} />
                <View style={styles.signatureLine}>
                  {data.quotation?.seller?.signature && (
                    <PDFImage
                      src={data.quotation.seller.signature}
                      style={styles.signatureImage}
                    />
                  )}
                  <Text>{data.company?.name}</Text>
                  <Text>{maskCnpj(data.company?.cnpj || '')}</Text>
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
      </Page>
    </Document>
  )
}
