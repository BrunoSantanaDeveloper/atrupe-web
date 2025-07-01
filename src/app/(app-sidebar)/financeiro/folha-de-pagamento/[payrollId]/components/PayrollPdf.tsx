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
import { formatCurrencyToBrl } from '@/lib/utils'

// Icons
import { MoneySignIcon, CalendarDollarIcon } from '@/assets/icons/PdfIcons'

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
    padding: 24,
    height: 76,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    fontSize: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoContainer: {
    padding: 24,
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
    borderTopColor: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    fontWeight: 'bold',
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    borderBottomColor: '#374151',
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
    marginBottom: 16,
    marginTop: 16,
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
})

interface Props {
  data: PayrollPdfType
}

export function PayrollPdf({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header} fixed>
          <PDFImage src={data.company.logo} style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.company.name}</Text>
            <Text>{data.company.cnpj}</Text>
            <Text>
              {data.company.address.street}, {data.company.address.number}
            </Text>
            <Text>
              {data.company.address.neighborhood}, {data.company.address.city},{' '}
              {data.company.address.state}.
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          {/* Linha do título e colaborador */}
          <View style={styles.infoRow}>
            <Text style={styles.title}>Controle de Folha de Pagamento</Text>
            <View style={styles.collaboratorBlock}>
              <Text style={styles.collaboratorName}>{data.employeeName}</Text>
              <Text style={styles.collaboratorRef}>
                Referência: {data.reference}
              </Text>
            </View>
          </View>

          {/* Tabela de Itens */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '50%' }]}>
                REFERÊNCIA
              </Text>
              <Text style={[styles.tableHeaderCell, { width: '25%' }]}>
                TIPO
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: '25%', textAlign: 'right' },
                ]}
              >
                VALOR
              </Text>
            </View>
            {data.items.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={styles.referenceCell}>{item.description}</Text>
                <Text style={styles.typeCell}>
                  {item.type === 'INCREASE'
                    ? 'Acréscimo'
                    : item.type === 'DISCOUNT'
                      ? 'Desconto'
                      : 'Adiantamento'}
                </Text>
                <Text style={styles.valueCell}>
                  {item.type === 'DISCOUNT' ? '-' : ''}
                  {formatCurrencyToBrl(item.amount)}
                </Text>
              </View>
            ))}
          </View>

          {/* Total a Pagar */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Salário a pagar</Text>
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
                {data.payment.dueDate
                  ? formatToLocaleDate(data.payment.dueDate)
                  : '___/___/_____'}{' '}
              </Text>
              <Text style={styles.bottomText}>
                Pagamento em:{' '}
                {data.payment.paidAt
                  ? formatToLocaleDate(data.payment.paidAt)
                  : '___/___/_____'}{' '}
              </Text>
            </View>
            <View style={styles.bottomBlock}>
              <MoneySignIcon />
              <Text style={styles.bottomTitle}>Pagamento</Text>
              <Text style={styles.bottomText}>
                Valor: {formatCurrencyToBrl(data.payment.amountPaid)}
              </Text>
              <Text style={styles.bottomText}>
                Forma de pagamento: {data.payment.paymentMethod}
              </Text>
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
