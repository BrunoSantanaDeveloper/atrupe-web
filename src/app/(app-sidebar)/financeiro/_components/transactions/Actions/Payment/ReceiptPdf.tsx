'use client'

// Component
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// Types
import { ReceiptPdfType } from '@/types/financial/receipt'

// Utils
import { numberToWords } from '@/lib/numberToWords'
import { formatCurrencyToBrl, maskCnpj } from '@/lib/utils'

// Components
import { PdfHeader } from '@/components/common/PdfHeader'

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
  infoContainer: {
    padding: 30,
    paddingTop: 0,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  receiptTextContainer: {
    marginBottom: 15,
    lineHeight: 0.7,
  },
  receiptParagraph: {
    fontSize: 9,
    textAlign: 'justify',
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
    width: '50%',
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableHeaderCellDate: {
    width: '15%',
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'left',
  },
  tableHeaderCellPayment: {
    width: '20%',
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'left',
  },
  tableHeaderCellValue: {
    width: '15%',
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
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
  dateCell: {
    width: '15%',
    fontSize: 9,
    color: '#111827',
    textAlign: 'left',
  },
  paymentCell: {
    width: '20%',
    fontSize: 9,
    color: '#111827',
    textAlign: 'left',
  },
  valueCell: {
    width: '15%',
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
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    fontSize: 8,
  },
  clarityTextContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  clarityParagraph: {
    fontSize: 9,
    textAlign: 'justify',
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
})

interface Props {
  data: ReceiptPdfType
}

export function ReceiptPdf({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <PdfHeader company={data.company} />

        <View style={styles.infoContainer}>
          {/* Título */}
          <Text style={styles.title}>Recibo</Text>

          {/* Texto do recibo */}
          <View style={styles.receiptTextContainer}>
            <Text style={styles.receiptParagraph}>
              Recibi(emos) de {data.company?.name} o valor de{' '}
              {formatCurrencyToBrl(data.totalValue)} (
              {numberToWords(data.totalValue, true)}) na data de {data.day} de{' '}
              {data.month} de {data.year} correspondente aos itens descritos
              abaixo:
            </Text>
          </View>

          {/* Tabela de Informações */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>REFERÊNCIA</Text>
              <Text style={styles.tableHeaderCellDate}>DATA</Text>
              <Text style={styles.tableHeaderCellPayment}>
                FORMA DE PAGAMENTO
              </Text>
              <Text style={styles.tableHeaderCellValue}>VALOR</Text>
            </View>
            {data.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.referenceCell}>
                  {item.reference && `${item.reference} - `}
                  {item.description}
                </Text>
                <Text style={styles.dateCell}>{item.date}</Text>
                <Text style={styles.paymentCell}>{item.paymentMethod}</Text>
                <Text style={styles.valueCell}>
                  {formatCurrencyToBrl(item.value)}
                </Text>
              </View>
            ))}
          </View>

          {/* Total a Pagar */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor total</Text>
            <Text style={styles.totalValue}>
              {formatCurrencyToBrl(data.totalValue)}
            </Text>
          </View>

          {/* Seção de acordo */}
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
              <Text>{data.clientName}</Text>
            </View>
            <View style={{ width: '33%' }} />
            <View style={styles.signatureLine}>
              <Text>{data.company?.name}</Text>
              <Text>{maskCnpj(data.company?.cnpj || '')}</Text>
            </View>
          </View>
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
