'use client'

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// Components
import { PdfHeader } from '@/components/common/PdfHeader'

// Types
import type {
  SalesReportPdfData,
  SalesReportPdfGroup,
  SalesReportPdfRecord,
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
  firstPage: {
    paddingTop: 90,
  },
  otherPages: {
    paddingTop: 30,
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
  colOs: { width: '9%', paddingRight: 4 },
  colServices: { width: '29%', paddingRight: 4 },
  colCity: { width: '13%', paddingRight: 4 },
  colApproved: { width: '10%' },
  colDelivery: { width: '10%' },
  // Nome do grupo ocupa O.S. + Serviços + Cidade + Aprovado + Entrega
  colGroupName: { width: '71%' },
  colPhase: { width: '11%' },
  colValue: { width: '12%', textAlign: 'right' },
  colPercent: { width: '6%', textAlign: 'right' },
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
  groupPercent: {
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
  cellPhase: {
    fontSize: 8,
    color: '#667085',
  },
  cellValue: {
    fontSize: 8,
    color: '#1D2939',
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
  data: SalesReportPdfData
  groupBy?: 'none' | 'client' | 'seller'
}

export function SalesReportPdf({ data, groupBy = 'client' }: Props) {
  const renderRecord = (record: SalesReportPdfRecord) => (
    <View key={record.id} style={styles.tableRow} wrap={false}>
      <View style={styles.colOs}>
        <Text style={styles.cellText}>{record.osNumber}</Text>
      </View>
      <View style={styles.colServices}>
        {groupBy === 'client' ? (
          <Text style={styles.cellText}>{record.description}</Text>
        ) : (
          <>
            <Text style={styles.cellText}>{record.clientName}</Text>
            <Text style={styles.cellSubText}>{record.description}</Text>
          </>
        )}
      </View>
      <View style={styles.colCity}>
        <Text style={styles.cellText}>{record.clientCity || '-'}</Text>
      </View>
      <View style={styles.colApproved}>
        <Text style={styles.cellText}>{record.approvedDate || '-'}</Text>
      </View>
      <View style={styles.colDelivery}>
        <Text style={styles.cellText}>{record.deliveryDate || '-'}</Text>
      </View>
      <View style={styles.colPhase}>
        <Text style={styles.cellPhase}>{record.phase}</Text>
      </View>
      <View style={styles.colValue}>
        <Text style={styles.cellValue}>
          {formatCurrencyToBrl(record.value)}
        </Text>
      </View>
      <View style={styles.colPercent}>
        <Text style={styles.cellPercent}>{record.percentage}%</Text>
      </View>
    </View>
  )

  const renderGroup = (group: SalesReportPdfGroup) => {
    const totalSuffix =
      groupBy === 'client'
        ? ' (Total do Cliente)'
        : groupBy === 'seller'
          ? ' (Total do Vendedor)'
          : ''
    return (
      <View key={group.clientId} wrap={false}>
        {/* Group Header */}
        <View style={styles.groupHeader}>
          <View style={styles.colGroupName}>
            <Text style={styles.groupName}>
              {group.clientName}
              {totalSuffix}
            </Text>
          </View>
          <View style={styles.colPhase} />
          <View style={styles.colValue}>
            <Text style={styles.groupValue}>
              {formatCurrencyToBrl(group.total)}
            </Text>
          </View>
          <View style={styles.colPercent}>
            <Text style={styles.groupPercent}>{group.percentage}%</Text>
          </View>
        </View>
        {/* Group Records */}
        {group.records.map(renderRecord)}
      </View>
    )
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - only on first page (fixed=false means only first page) */}
        <PdfHeader company={data.company} />

        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>Relatório</Text>
          <Text style={styles.subtitle}>Vendas</Text>

          {/* Table Header */}
          <View style={styles.tableHeader} fixed>
            <View style={styles.colOs}>
              <Text style={styles.tableHeaderCell}>O.S.</Text>
            </View>
            <View style={styles.colServices}>
              <Text style={styles.tableHeaderCell}>SERVIÇOS</Text>
            </View>
            <View style={styles.colCity}>
              <Text style={styles.tableHeaderCell}>CIDADE</Text>
            </View>
            <View style={styles.colApproved}>
              <Text style={styles.tableHeaderCell}>APROVADO</Text>
            </View>
            <View style={styles.colDelivery}>
              <Text style={styles.tableHeaderCell}>ENTREGA</Text>
            </View>
            <View style={styles.colPhase}>
              <Text style={styles.tableHeaderCell}>FASE</Text>
            </View>
            <View style={styles.colValue}>
              <Text style={styles.tableHeaderCell}>
                {formatCurrencyToBrl(data.totalValue)}
              </Text>
            </View>
            <View style={styles.colPercent}>
              <Text style={styles.tableHeaderCell}>
                {data.totalPercentage}%
              </Text>
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
