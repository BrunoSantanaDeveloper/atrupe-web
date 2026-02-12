'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// Components
import { PdfHeader } from '@/components/common/PdfHeader'

// Types
import type {
  CommissionPdfData,
  CommissionPdfGroup,
  CommissionPdfRecord,
} from '../../pdf-types'

// Utils
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
  container: {
    padding: 30,
    paddingTop: 0,
  },
  title: {
    fontSize: 10,
    color: '#667085',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1D2939',
    marginBottom: 15,
  },
  // Table Header
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#344054',
    borderBottomWidth: 1,
    borderBottomColor: '#D0D5DD',
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#667085',
    textTransform: 'uppercase',
  },
  colServices: { width: '30%' },
  colSaleDate: { width: '14%' },
  colReceivedDate: { width: '14%' },
  colSaleValue: { width: '16%', textAlign: 'right' },
  colReceivedValue: { width: '16%', textAlign: 'right' },
  colPercent: { width: '10%', textAlign: 'right' },
  // Group Header Row
  groupHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D5DD',
    backgroundColor: '#fff',
  },
  groupName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1D2939',
  },
  groupValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1D2939',
    textAlign: 'right',
  },
  // Table Row
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  cellText: {
    fontSize: 8,
    color: '#1D2939',
  },
  cellSubText: {
    fontSize: 7,
    color: '#667085',
  },
  cellDate: {
    fontSize: 8,
    color: '#667085',
  },
  cellValue: {
    fontSize: 8,
    color: '#1D2939',
    textAlign: 'right',
  },
  cellReceivedValue: {
    fontSize: 8,
    color: '#027A48',
    textAlign: 'right',
  },
  cellPercent: {
    fontSize: 8,
    color: '#667085',
    textAlign: 'right',
  },
  // Page Number
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    fontSize: 8,
    textAlign: 'center',
    color: '#667085',
  },
})

interface Props {
  data: CommissionPdfData
}

export function CommissionReportPdf({ data }: Props) {
  const renderRecord = (record: CommissionPdfRecord) => (
    <View key={record.id} style={styles.tableRow} wrap={false}>
      <View style={styles.colServices}>
        <Text style={styles.cellText}>{record.clientName}</Text>
        <Text style={styles.cellSubText}>{record.description}</Text>
      </View>
      <View style={styles.colSaleDate}>
        <Text style={styles.cellDate}>{record.saleDate}</Text>
      </View>
      <View style={styles.colReceivedDate}>
        <Text style={styles.cellDate}>{record.receivedDate}</Text>
      </View>
      <View style={styles.colSaleValue}>
        <Text style={styles.cellValue}>
          {formatCurrencyToBrl(record.saleValue)}
        </Text>
      </View>
      <View style={styles.colReceivedValue}>
        <Text style={styles.cellReceivedValue}>
          {formatCurrencyToBrl(record.receivedValue)}
        </Text>
      </View>
      <View style={styles.colPercent}>
        <Text style={styles.cellPercent}>{record.percentage}%</Text>
      </View>
    </View>
  )

  const renderGroup = (group: CommissionPdfGroup) => (
    <View key={group.vendedorId} wrap={false}>
      {/* Group Header */}
      <View style={styles.groupHeader}>
        <View style={styles.colServices}>
          <Text style={styles.groupName}>{group.vendedorName}</Text>
        </View>
        <View style={styles.colSaleDate} />
        <View style={styles.colReceivedDate} />
        <View style={styles.colSaleValue}>
          <Text style={styles.groupValue}>
            {formatCurrencyToBrl(group.saleTotal)}
          </Text>
        </View>
        <View style={styles.colReceivedValue}>
          <Text style={styles.groupValue}>
            {formatCurrencyToBrl(group.receivedTotal)}
          </Text>
        </View>
        <View style={styles.colPercent} />
      </View>
      {/* Group Records */}
      {group.records.map(renderRecord)}
    </View>
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader company={data.company} />

        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>Relatório</Text>
          <Text style={styles.subtitle}>Comissões</Text>

          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <View style={styles.colServices}>
              <Text style={styles.tableHeaderCell}>SERVIÇOS</Text>
            </View>
            <View style={styles.colSaleDate}>
              <Text style={styles.tableHeaderCell}>DATA VENDA</Text>
            </View>
            <View style={styles.colReceivedDate}>
              <Text style={styles.tableHeaderCell}>DATA RECEB.</Text>
            </View>
            <View style={styles.colSaleValue}>
              <Text style={styles.tableHeaderCell}>
                {formatCurrencyToBrl(data.totalSaleValue)}
              </Text>
            </View>
            <View style={styles.colReceivedValue}>
              <Text style={styles.tableHeaderCell}>
                {formatCurrencyToBrl(data.totalReceivedValue)}
              </Text>
            </View>
            <View style={styles.colPercent}>
              <Text style={styles.tableHeaderCell}>%</Text>
            </View>
          </View>

          {/* Groups */}
          {data.groups.map(renderGroup)}
        </View>

        {/* Page Number */}
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
