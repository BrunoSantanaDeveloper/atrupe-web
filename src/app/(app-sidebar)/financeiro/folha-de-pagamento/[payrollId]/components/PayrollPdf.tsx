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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    marginVertical: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    fontWeight: 'bold',
    backgroundColor: '#F9FAFB',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    justifyContent: 'space-between',
  },
  tableCell: {
    fontSize: 8,
    color: '#111827',
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#374151',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomSection: {
    marginTop: 20,
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
})

interface Props {
  data: PayrollPdfType
}

// Mock da empresa - dados baseados na imagem
const mockCompany = {
  name: 'Atrupe Comunicação Visual',
  cnpj: '00.000.000/0001-00',
  address: {
    street: 'Avenida Getúlio Vargas',
    number: '192',
    neighborhood: 'Vila Operária',
    city: 'Itajaí',
    state: 'SC',
  },
  logo: '/src/assets/icons/companyIconPlaceholder.png',
  contacts: {
    site: 'atrupe.sistemas',
    email: 'atrupe.sistemas',
    phone: 'atrupe.sistemas',
    whatsapp: '(47) 2122-9184',
    support: 'suporte@atrupe.com.br',
  },
}

export function PayrollPdf({ data }: Props) {
  // Calcular totais
  const totalAdditions = data.items
    .filter((item) => item.type === 'INCREASE' || item.type === 'ADVANCE')
    .reduce((sum, item) => sum + item.amount, 0)

  const totalDeductions = data.items
    .filter((item) => item.type === 'DISCOUNT')
    .reduce((sum, item) => sum + item.amount, 0)

  const netSalary = totalAdditions - totalDeductions

  // Buscar informações de pagamento e vencimento do primeiro movimento (se houver)
  const firstMovement =
    data.movements && data.movements.length > 0 ? data.movements[0] : undefined
  const dueDate = firstMovement ? firstMovement.dueDate : undefined
  const paymentDate = firstMovement ? firstMovement.completedDate : undefined
  // Não há campo de paymentMethod, então deixar como 'PIX' ou underline
  const paymentMethod = 'PIX'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header} fixed>
          <PDFImage src={mockCompany.logo} style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{mockCompany.name}</Text>
            <Text>{mockCompany.cnpj}</Text>
            <Text>
              {mockCompany.address.street}, {mockCompany.address.number}
            </Text>
            <Text>
              {mockCompany.address.neighborhood}, {mockCompany.address.city},{' '}
              {mockCompany.address.state}.
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          {/* Título */}
          <Text style={styles.title}>Controle de Folha de Pagamento</Text>

          {/* Informações do Colaborador e Referência */}
          <View style={styles.infoSection}>
            <View style={{ width: '50%' }} />
            <View style={styles.infoBlock}>
              <Text style={styles.infoTitle}>Nome do Colaborador</Text>
              <Text>{data.employee.name}</Text>
              <Text style={{ marginTop: 2 }}>Referência: {data.reference}</Text>
            </View>
          </View>

          {/* Tabela de Itens */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '60%' }]}>
                REFERÊNCIA
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: '20%', textAlign: 'center' },
                ]}
              >
                TIPO
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  { width: '20%', textAlign: 'right' },
                ]}
              >
                VALOR
              </Text>
            </View>
            {data.items.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '60%' }]}>
                  {item.description}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: '20%', textAlign: 'center' },
                  ]}
                >
                  {' '}
                  {item.type === 'INCREASE'
                    ? 'Acréscimo'
                    : item.type === 'DISCOUNT'
                      ? 'Desconto'
                      : 'Adiantamento'}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: '20%', textAlign: 'right' },
                  ]}
                >
                  {' '}
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
              {formatCurrencyToBrl(netSalary)}
            </Text>
          </View>

          {/* Informações de Data e Pagamento */}
          <View style={styles.bottomSection}>
            <View style={styles.bottomBlock}>
              <Text style={styles.bottomTitle}>Data</Text>
              <Text style={styles.bottomText}>
                Vencimento em:{' '}
                {dueDate ? formatToLocaleDate(dueDate) : '___/___/_____'}{' '}
              </Text>
              <Text style={styles.bottomText}>
                Pagamento em:{' '}
                {paymentDate
                  ? formatToLocaleDate(paymentDate)
                  : '___/___/_____'}{' '}
              </Text>
            </View>
            <View
              style={[
                styles.bottomBlock,
                { alignItems: 'flex-end', textAlign: 'right' },
              ]}
            >
              <Text style={styles.bottomTitle}>Pagamento</Text>
              <Text style={styles.bottomText}>
                Valor: {formatCurrencyToBrl(netSalary)}
              </Text>
              <Text style={styles.bottomText}>
                Forma de pagamento: {paymentMethod}
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
