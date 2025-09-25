'use client'

// Component
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image as PDFImage,
} from '@react-pdf/renderer'

// Types
import { PayrollPdfType } from '@/types/financial/payroll'

// Utils
import { formatToLocaleDate } from '@/lib/formatDate'
import { formatCurrencyToBrl, maskCnpj } from '@/lib/utils'
import { numberToWords } from '@/lib/numberToWords'
import { getProxiedImageUrl } from '@/lib/image-proxy'

// Icons
import {
  MoneySignIcon,
  CalendarDollarIcon,
  EmailIcon,
  WebsiteIcon,
  LinkedinIcon,
  FacebookIcon,
  InstagramIcon,
} from '@/assets/icons/PdfIcons'

const styles = StyleSheet.create({
  page: {
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingBottom: 30,
    paddingTop: 90,
    backgroundColor: '#fff',
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
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    marginTop: 10,
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoBlock: {
    width: '50%',
    lineHeight: 1.2,
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  infoTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#344054',
    borderBottomWidth: 1,
    borderBottomColor: '#D0D5DD',
    fontWeight: 'bold',
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableHeaderCellAdvance: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
    width: '75%',
  },
  tableHeaderCellType: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
    width: '25%',
  },
  tableHeaderCellValue: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
    width: '25%',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D5DD',
  },
  tableCell: {
    fontSize: 9,
    color: '#111827',
  },
  referenceCell: {
    width: '50%',
    fontSize: 9,
    color: '#111827',
  },
  referenceCellAdvance: {
    width: '75%',
    fontSize: 9,
    color: '#111827',
  },
  typeCell: {
    width: '25%',
    fontSize: 9,
    color: '#111827',
  },
  valueCell: {
    width: '25%',
    fontSize: 9,
    color: '#111827',
    textAlign: 'right',
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#344054',
  },
  totalLabel: {
    fontSize: 9,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomSection: {
    marginTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  bottomBlock: {
    width: '48%',
    flexDirection: 'column',
    gap: 2,
  },
  bottomTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bottomText: {
    fontSize: 8,
    marginBottom: 1,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    fontSize: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  collaboratorBlock: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  collaboratorName: {
    fontSize: 10,
    fontWeight: 'normal',
  },
  collaboratorRef: {
    fontSize: 9,
    color: '#374151',
    marginTop: 2,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: '#344054',
    marginVertical: 10,
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
  advanceTextContainer: {
    marginBottom: 15,
    lineHeight: 0.7,
  },
  advanceParagraph: {
    fontSize: 9,
    textAlign: 'justify',
  },
  clarityTextContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  clarityParagraph: {
    fontSize: 9,
    textAlign: 'justify',
  },
})

interface Props {
  data: PayrollPdfType
  type?: 'payroll' | 'advance'
}

export function PayrollPdf({ data, type = 'payroll' }: Props) {
  const isAdvance = type === 'advance'
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header} fixed>
          <View style={{ width: '35%' }}>
            <PDFImage
              src={
                getProxiedImageUrl(data.company?.logo) ||
                '/src/assets/icons/companyIconPlaceholder.png'
              }
              style={styles.logo}
            />
          </View>
          <View style={[styles.companyInfo, { width: '50%' }]}>
            <Text style={styles.companyName}>{data.company?.name}</Text>
            <Text>{maskCnpj(data.company?.cnpj)}</Text>
            <Text>
              {[data.company?.address?.street, data.company?.address?.number]
                .filter(Boolean)
                .join(', ')}
            </Text>
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
          {/* Linha do título e colaborador */}
          <View style={styles.infoRow}>
            <Text style={styles.title}>
              {isAdvance
                ? 'Adiantamento de salário'
                : 'Controle de Folha de Pagamento'}
            </Text>
            <View style={styles.collaboratorBlock}>
              <Text style={styles.collaboratorName}>{data.employeeName}</Text>
              <Text style={styles.collaboratorRef}>
                Referência: {data.reference}
              </Text>
            </View>
          </View>

          {/* Texto de adiantamento de salário */}
          {isAdvance && (
            <View style={styles.advanceTextContainer}>
              <Text style={styles.advanceParagraph}>
                Recibi(emos) de {data.company?.name} o valor de{' '}
                {formatCurrencyToBrl(data.netSalary)} (
                {numberToWords(data.netSalary, true)}) na data de{' '}
                {new Date(
                  data.payables?.[0]?.installments?.[0]?.dueDate || new Date(),
                ).getDate()}{' '}
                de{' '}
                {new Date(
                  data.payables?.[0]?.installments?.[0]?.dueDate || new Date(),
                ).toLocaleDateString('pt-BR', { month: 'long' })}{' '}
                de{' '}
                {new Date(
                  data.payables?.[0]?.installments?.[0]?.dueDate || new Date(),
                ).getFullYear()}{' '}
                correspondente aos itens descritos abaixo:
              </Text>
            </View>
          )}

          {/* Tabela de Itens */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={
                  isAdvance
                    ? styles.tableHeaderCellAdvance
                    : styles.tableHeaderCell
                }
              >
                REFERÊNCIA
              </Text>
              {!isAdvance && (
                <Text style={styles.tableHeaderCellType}>TIPO</Text>
              )}
              <Text style={styles.tableHeaderCellValue}>VALOR</Text>
            </View>
            {data.items.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text
                  style={
                    isAdvance
                      ? styles.referenceCellAdvance
                      : styles.referenceCell
                  }
                >
                  {item.description}
                </Text>
                {!isAdvance && (
                  <Text style={styles.typeCell}>
                    {item.type === 'INCREASE'
                      ? 'Acréscimo'
                      : item.type === 'DISCOUNT'
                        ? 'Desconto'
                        : 'Adiantamento'}
                  </Text>
                )}
                <Text style={styles.valueCell}>
                  {item.type === 'DISCOUNT' ? '-' : ''}
                  {formatCurrencyToBrl(item.amount)}
                </Text>
              </View>
            ))}
          </View>

          {/* Total a Pagar */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {isAdvance ? 'Total a pagar' : 'Salário a pagar'}
            </Text>
            <Text style={styles.totalValue}>
              {formatCurrencyToBrl(data.netSalary)}
            </Text>
          </View>

          {/* Informações de Data e Pagamento */}
          <View style={styles.bottomSection}>
            <View style={styles.bottomBlock}>
              <CalendarDollarIcon />
              <Text style={styles.bottomTitle}>Data</Text>
              <Text style={styles.bottomText}>
                Vencimento em:{' '}
                {data.payables?.[0]?.installments?.[0]?.dueDate
                  ? formatToLocaleDate(data.payables[0].installments[0].dueDate)
                  : ''}
              </Text>
              <Text style={styles.bottomText}>
                Pagamento em:{' '}
                {data.payables?.[0]?.installments?.[0]?.paidDate
                  ? formatToLocaleDate(
                      data.payables[0].installments[0].paidDate,
                    )
                  : ''}
              </Text>
            </View>
            <View style={styles.bottomBlock}>
              <MoneySignIcon />
              <Text style={styles.bottomTitle}>Pagamento</Text>
              <Text style={styles.bottomText}>
                Valor:{' '}
                {data.payables?.[0]?.installments?.[0]?.paidAmount
                  ? formatCurrencyToBrl(
                      data.payables[0].installments[0].paidAmount,
                    )
                  : ''}
              </Text>
              <Text style={styles.bottomText}>
                Forma de pagamento:{' '}
                {data.payables?.[0]?.installments?.[0]?.paymentMethod || ''}
              </Text>
            </View>
          </View>

          {/* Seção de acordo e assinaturas - apenas para adiantamento */}
          {isAdvance && (
            <>
              <View style={styles.clarityTextContainer}>
                <Text style={styles.clarityParagraph}>
                  e para clareza, firmo(amos) o presente.
                </Text>
              </View>

              <View style={styles.infoDate}>
                <View />
                <View>
                  <Text>De acordo, ____/____/______</Text>
                </View>
              </View>

              {/* Assinaturas */}
              <View style={styles.signatures}>
                <View style={styles.signatureLine}>
                  <Text>{data.employeeName}</Text>
                </View>
                <View style={{ width: '33%' }} />
                <View style={styles.signatureLine}>
                  <Text>{data.company?.name}</Text>
                  <Text>{maskCnpj(data.company?.cnpj || '')}</Text>
                </View>
              </View>
            </>
          )}

          {/* Linha divisória - apenas para folha de pagamento */}
          {!isAdvance && <View style={styles.divider} />}
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
