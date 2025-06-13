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
    width: '100%',
    fontSize: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  companyName: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoContainer: {
    padding: 30,
    paddingTop: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoBlock: {
    width: '48%',
    lineHeight: 1.2,
  },
  infoTitle: {
    fontSize: 9,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    marginVertical: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    fontWeight: 'bold',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
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
    .filter((item) => item.type === 'INCREASE')
    .reduce((sum, item) => sum + item.amount, 0)

  const totalDeductions = data.items
    .filter((item) => item.type === 'DISCOUNT')
    .reduce((sum, item) => sum + item.amount, 0)

  const netSalary = totalAdditions - totalDeductions

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header} fixed>
          <View style={{ width: '100%' }}>
            <PDFImage src={mockCompany.logo} style={styles.logo} />
          </View>
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
            <View style={{ marginTop: 4, alignItems: 'flex-end' }}>
              <Text>{mockCompany.contacts.site}</Text>
              <Text>{mockCompany.contacts.email}</Text>
              <Text>{mockCompany.contacts.phone}</Text>
              <Text>{mockCompany.contacts.whatsapp}</Text>
              <Text>{mockCompany.contacts.support}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoContainer}>
          {/* Título */}
          <Text style={styles.title}>Controle de Folha de Pagamento</Text>

          {/* Informações do Colaborador e Referência */}
          <View style={styles.infoSection}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoTitle}>Nome do Colaborador</Text>
              <Text>{data.employee.name}</Text>
              {data.employee.email && <Text>{data.employee.email}</Text>}
              {data.employee.phone && <Text>{data.employee.phone}</Text>}
            </View>

            <View style={[styles.infoBlock, { textAlign: 'right' }]}>
              <Text style={styles.infoTitle}>Referência: {data.reference}</Text>
              <Text>
                Status: {data.status === 'OPEN' ? 'Em Aberto' : 'Fechado'}
              </Text>
              <Text>Criado em: {formatToLocaleDate(data.createdAt)}</Text>
              {data.updatedAt && (
                <Text>Atualizado em: {formatToLocaleDate(data.updatedAt)}</Text>
              )}
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
                <View style={{ width: '60%' }}>
                  <Text style={styles.tableCell}>{item.description}</Text>
                  {item.description && (
                    <Text
                      style={[
                        styles.tableCell,
                        { fontSize: 7, color: '#6B7280' },
                      ]}
                    >
                      {item.description}
                    </Text>
                  )}
                </View>

                <View style={{ width: '20%' }}>
                  <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                    {item.type === 'INCREASE'
                      ? 'Acréscimo'
                      : item.type === 'DISCOUNT'
                        ? 'Desconto'
                        : 'Adiantamento'}
                  </Text>
                </View>

                <View style={{ width: '20%' }}>
                  <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                    {item.type === 'DISCOUNT' ? '-' : ''}
                    {formatCurrencyToBrl(item.amount)}
                  </Text>
                </View>
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
          <View
            style={{
              marginTop: 30,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ width: '45%' }}>
              <Text style={styles.infoTitle}>Data</Text>
              <Text>Vencimento em: {formatToLocaleDate(data.createdAt)}</Text>
              <Text>Pagamento em: ___/___/_____</Text>
            </View>

            <View style={{ width: '45%', textAlign: 'right' }}>
              <Text style={styles.infoTitle}>Pagamento</Text>
              <Text>Valor: ________________</Text>
              <Text>Forma de pagamento: ________________</Text>
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
