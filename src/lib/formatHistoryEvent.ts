import { TransactionHistoryItem } from '@/types/financial/financialFlow'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrencyToBrl } from './utils'

export type TimelineEvent = {
  date: string
  time: string
  author: string
  title: string
  details?: string[]
}

export function formatHistoryEvent(
  item: TransactionHistoryItem,
): TimelineEvent {
  const createdAtDate = parseISO(item.createdAt)
  const date = format(createdAtDate, 'dd/MM/yyyy', { locale: ptBR })
  const time = format(createdAtDate, 'HH:mm', { locale: ptBR })

  const title = item.description
  const details: string[] = []

  // Format based on action type
  switch (item.action) {
    case 'PAY_INSTALLMENT':
      if (item.metadata) {
        if (item.metadata.paidAmount) {
          details.push(
            `Valor pago: ${formatCurrencyToBrl(item.metadata.paidAmount as number)}`,
          )
        }
        if (item.metadata.paymentConditionName) {
          details.push(
            `Forma de pagamento: ${item.metadata.paymentConditionName}`,
          )
        }
        if (item.metadata.bankAccountName) {
          details.push(`Conta: ${item.metadata.bankAccountName}`)
        }
      }
      break

    case 'UPDATE_INSTALLMENTS':
      if (item.changes) {
        const beforeCount = item.changes.before.length
        const afterCount = item.changes.after.length

        if (beforeCount !== afterCount) {
          details.push(`Quantidade: ${beforeCount}x → ${afterCount}x parcelas`)
        }

        // Show value changes for each installment
        item.changes.before.forEach((before, index) => {
          const after = item.changes?.after[index]
          if (after && before.amount !== after.amount) {
            details.push(
              `Parcela ${before.installmentNumber}: ${formatCurrencyToBrl(before.amount)} → ${formatCurrencyToBrl(after.amount)}`,
            )
          }
        })

        // Show new installments
        if (afterCount > beforeCount) {
          item.changes.after.slice(beforeCount).forEach((installment) => {
            details.push(
              `Nova parcela ${installment.installmentNumber}: ${formatCurrencyToBrl(installment.amount)}`,
            )
          })
        }
      }
      break

    case 'CREATE':
      if (item.metadata) {
        if (item.metadata.totalAmount) {
          details.push(
            `Valor total: ${formatCurrencyToBrl(item.metadata.totalAmount as number)}`,
          )
        }
        if (item.metadata.installmentQty) {
          details.push(`Parcelas: ${item.metadata.installmentQty}x`)
        }
        if (item.metadata.clientName) {
          details.push(`Cliente: ${item.metadata.clientName}`)
        }
        if (item.metadata.supplierName) {
          details.push(`Fornecedor: ${item.metadata.supplierName}`)
        }
      }
      break

    case 'CANCEL':
    case 'CANCEL_INSTALLMENT':
      if (item.metadata) {
        if (item.metadata.installmentNumber) {
          details.push(`Parcela: ${item.metadata.installmentNumber}`)
        }
        if (item.metadata.cancelNotes) {
          details.push(`Observações: ${item.metadata.cancelNotes}`)
        }
      }
      break

    case 'COMPENSATE':
      if (item.metadata) {
        if (item.metadata.installmentNumber) {
          details.push(`Parcela: ${item.metadata.installmentNumber}`)
        }
        if (item.metadata.bankAccountName) {
          details.push(`Conta: ${item.metadata.bankAccountName}`)
        }
      }
      break

    case 'UPDATE_DETAILS':
      // Generic metadata display for updates
      if (item.metadata) {
        Object.entries(item.metadata).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            !['installmentNumber', 'amount'].includes(key)
          ) {
            details.push(`${formatKey(key)}: ${value}`)
          }
        })
      }
      break
  }

  return {
    date,
    time,
    author: item.createdByName,
    title,
    details: details.length > 0 ? details : undefined,
  }
}

function formatKey(key: string): string {
  // Convert camelCase to readable format
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}
