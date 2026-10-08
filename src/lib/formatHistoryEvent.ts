import { TransactionHistoryItem } from '@/types/financial/financialFlow'
import { EmployeeHistoryItem } from '@/types/settings/employee'
import { QuotationHistoryItem } from '@/types/sales/quotation'
import { OrderHistoryItem } from '@/types/sales/order'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrencyToBrl, maskCpf, MaskPhoneNumber } from './utils'

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
    case 'PAID_WITH_DIFFERENCE':
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
        if (item.metadata.hasDifference && item.metadata.differenceAmount) {
          const diffType =
            item.metadata.differenceType === 'expense' ? 'a menos' : 'a mais'
          details.push(
            `Diferença: ${formatCurrencyToBrl(Math.abs(item.metadata.differenceAmount as number))} (${diffType})`,
          )
        }
      }
      break

    case 'UPDATE_INSTALLMENTS':
      if (item.metadata) {
        if (item.metadata.changeReason) {
          details.push(`Motivo: ${item.metadata.changeReason}`)
        }
        if (item.metadata.changeNotes) {
          details.push(`Observações: ${item.metadata.changeNotes}`)
        }
        // Show total amount change if available
        if (
          item.metadata.totalAmountBefore !== undefined &&
          item.metadata.totalAmountAfter !== undefined &&
          item.metadata.totalAmountBefore !== item.metadata.totalAmountAfter
        ) {
          details.push(
            `Valor total: ${formatCurrencyToBrl(item.metadata.totalAmountBefore as number)} 🡢 ${formatCurrencyToBrl(item.metadata.totalAmountAfter as number)}`,
          )
        }
      }

      if (item.changes) {
        const beforeCount = item.changes.before.length
        const afterCount = item.changes.after.length

        if (beforeCount !== afterCount) {
          details.push(`Quantidade: ${beforeCount}x 🡢 ${afterCount}x parcelas`)
        }

        // Create a map of before installments by ID for easier lookup
        const beforeMapById = new Map(
          item.changes.before.map((inst) => [inst.id, inst]),
        )

        // Create a map to track which installment numbers exist in before
        const beforeMapByNumber = new Map(
          item.changes.before.map((inst) => [inst.installmentNumber, inst]),
        )

        // Track which before IDs were matched
        const matchedBeforeIds = new Set<string>()

        // Show changes for each installment in 'after'
        item.changes.after.forEach((after) => {
          const beforeSameId = beforeMapById.get(after.id)
          const beforeSameNumber = beforeMapByNumber.get(
            after.installmentNumber,
          )

          if (beforeSameId) {
            // Same ID = same installment, check for amount changes
            if (beforeSameId.amount !== after.amount) {
              details.push(
                `Parcela ${after.installmentNumber}: ${formatCurrencyToBrl(beforeSameId.amount)} 🡢 ${formatCurrencyToBrl(after.amount)}`,
              )
            }
            matchedBeforeIds.add(beforeSameId.id)
          } else if (beforeSameNumber && beforeSameNumber.id !== after.id) {
            // Different ID but same number = replaced installment
            details.push(
              `Parcela ${beforeSameNumber.installmentNumber} removida: ${formatCurrencyToBrl(beforeSameNumber.amount)}`,
            )
            details.push(
              `Nova parcela ${after.installmentNumber}: ${formatCurrencyToBrl(after.amount)}`,
            )
            matchedBeforeIds.add(beforeSameNumber.id)
          } else {
            // Completely new installment
            details.push(
              `Nova parcela ${after.installmentNumber}: ${formatCurrencyToBrl(after.amount)}`,
            )
          }
        })

        // Any remaining items in beforeMapById that weren't matched were removed
        beforeMapById.forEach((removed) => {
          if (!matchedBeforeIds.has(removed.id)) {
            details.push(
              `Parcela ${removed.installmentNumber} removida: ${formatCurrencyToBrl(removed.amount)}`,
            )
          }
        })
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

export function formatEmployeeHistoryEvent(
  item: EmployeeHistoryItem,
): TimelineEvent {
  const createdAtDate = parseISO(item.createdAt)
  const date = format(createdAtDate, 'dd/MM/yyyy', { locale: ptBR })
  const time = format(createdAtDate, 'HH:mm', { locale: ptBR })

  const title = item.description
  const details: string[] = []

  // Format based on action type
  switch (item.action) {
    case 'CREATE':
      if (item.metadata) {
        if (item.metadata.roleId) {
          details.push(`Cargo criado`)
        }
        if (item.metadata.sectorId) {
          details.push(`Setor atribuído`)
        }
      }
      break

    case 'UPDATE':
      if (item.changes && item.metadata?.changedFields) {
        const { before, after } = item.changes
        const changedFields = item.metadata.changedFields

        changedFields.forEach((field) => {
          const beforeValue = before[field as keyof typeof before]
          const afterValue = after[field as keyof typeof after]

          // Format field-specific changes
          switch (field) {
            case 'cpf':
              if (beforeValue && afterValue) {
                details.push(
                  `CPF: ${maskCpf(String(beforeValue))} 🡢 ${maskCpf(String(afterValue))}`,
                )
              }
              break

            case 'phone':
            case 'mobile':
              if (beforeValue && afterValue) {
                const label = field === 'phone' ? 'Telefone' : 'Celular'
                details.push(
                  `${label}: ${MaskPhoneNumber(String(beforeValue))} 🡢 ${MaskPhoneNumber(String(afterValue))}`,
                )
              }
              break

            case 'sallary':
              if (beforeValue !== undefined && afterValue !== undefined) {
                details.push(
                  `Salário: ${formatCurrencyToBrl(Number(beforeValue))} 🡢 ${formatCurrencyToBrl(Number(afterValue))}`,
                )
              }
              break

            case 'name':
            case 'email':
            case 'rg':
              if (beforeValue && afterValue) {
                details.push(
                  `${formatFieldLabel(field)}: ${beforeValue} 🡢 ${afterValue}`,
                )
              }
              break

            case 'roleId':
              details.push(`Cargo alterado`)
              break

            case 'sectorId':
              details.push(`Setor alterado`)
              break

            case 'avatarUrl':
              details.push(`Avatar atualizado`)
              break

            case 'signatureUrl':
              details.push(`Assinatura atualizada`)
              break

            default:
              if (beforeValue && afterValue) {
                details.push(
                  `${formatFieldLabel(field)}: ${beforeValue} 🡢 ${afterValue}`,
                )
              }
          }
        })
      }
      break

    case 'DEACTIVATE':
      details.push('Status: Ativo 🡢 Inativo')
      break

    case 'REACTIVATE':
      details.push('Status: Inativo 🡢 Ativo')
      break

    case 'CREATE_USER':
      if (item.metadata) {
        if (item.metadata.userName) {
          details.push(`Nome: ${item.metadata.userName}`)
        }
        if (item.metadata.userEmail) {
          details.push(`E-mail: ${item.metadata.userEmail}`)
        }
      }
      break

    case 'UPDATE_USER':
      if (item.changes) {
        const { before, after } = item.changes
        if (before.email && after.email && before.email !== after.email) {
          details.push(`E-mail: ${before.email} 🡢 ${after.email}`)
        }
        if (
          before.isActive !== undefined &&
          after.isActive !== undefined &&
          before.isActive !== after.isActive
        ) {
          details.push(
            `Status: ${before.isActive ? 'Ativo' : 'Inativo'} 🡢 ${after.isActive ? 'Ativo' : 'Inativo'}`,
          )
        }
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

function formatFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    name: 'Nome',
    email: 'E-mail',
    cpf: 'CPF',
    rg: 'RG',
    phone: 'Telefone',
    mobile: 'Celular',
    sallary: 'Salário',
    avatarUrl: 'Avatar',
    signatureUrl: 'Assinatura',
    roleId: 'Cargo',
    sectorId: 'Setor',
    isActive: 'Status',
  }

  return labels[field] || formatKey(field)
}

export function formatQuotationHistoryEvent(
  item: QuotationHistoryItem,
): TimelineEvent {
  const createdAtDate = parseISO(item.createdAt)
  const date = format(createdAtDate, 'dd/MM/yyyy', { locale: ptBR })
  const time = format(createdAtDate, 'HH:mm', { locale: ptBR })

  const title = item.description
  const details: string[] = []

  // Format based on action type
  switch (item.action) {
    case 'CREATED':
      if (item.metadata) {
        if (item.metadata.clientName) {
          details.push(`Cliente: ${item.metadata.clientName}`)
        }
        if (item.metadata.totalValue) {
          details.push(
            `Valor total: ${formatCurrencyToBrl(item.metadata.totalValue as number)}`,
          )
        }
      }
      break

    case 'FINISHED':
      if (item.metadata?.finishedAt) {
        const finishedDate = parseISO(item.metadata.finishedAt as string)
        const formattedDate = format(finishedDate, 'dd/MM/yyyy HH:mm', {
          locale: ptBR,
        })
        details.push(`Data de conclusão: ${formattedDate}`)
      }
      break

    case 'REOPENED':
      if (item.metadata?.reason) {
        details.push(`Motivo: ${item.metadata.reason}`)
      }
      break

    case 'REJECTED':
      if (item.metadata?.reasonDescription) {
        details.push(`Motivo: ${item.metadata.reasonDescription}`)
      }
      if (item.metadata?.rejectionReason) {
        details.push(`Motivo: ${item.metadata.rejectionReason}`)
      }
      if (item.metadata?.rejectionNotes) {
        details.push(`Observações: ${item.metadata.rejectionNotes}`)
      }
      break

    case 'VALUE_CHANGED':
      if (item.changes) {
        const { before, after } = item.changes

        if (
          typeof before?.totalValue === 'number' &&
          typeof after?.totalValue === 'number'
        ) {
          details.push(
            `Valor total: ${formatCurrencyToBrl(before.totalValue)} 🡢 ${formatCurrencyToBrl(after.totalValue)}`,
          )
        }
      }
      if (item.metadata?.changeReason) {
        details.push(`Motivo: ${item.metadata.changeReason}`)
      }
      break

    case 'APPROVED':
      if (item.metadata?.approvedBy) {
        details.push(`Aprovado por: ${item.metadata.approvedBy}`)
      }
      if (item.metadata?.approvalNotes) {
        details.push(`Observações: ${item.metadata.approvalNotes}`)
      }
      break

    case 'DUPLICATED':
      if (item.metadata?.sourceQuotationId) {
        details.push(`Orçamento original: #${item.metadata.sourceQuotationId}`)
      }
      break

    case 'EDITED':
      if (item.changes) {
        const { before, after } = item.changes
        if (before && after) {
          Object.keys(after).forEach((field) => {
            const beforeVal = before[field]
            const afterVal = after[field]
            if (beforeVal !== afterVal) {
              details.push(
                `${field === 'serie' ? 'Série' : formatKey(field)}: ${beforeVal ?? '(vazio)'} 🡢 ${afterVal ?? '(vazio)'}`,
              )
            }
          })
        }
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

export function formatOrderHistoryEvent(item: OrderHistoryItem): TimelineEvent {
  const createdAtDate = parseISO(item.createdAt)
  const date = format(createdAtDate, 'dd/MM/yyyy', { locale: ptBR })
  const time = format(createdAtDate, 'HH:mm', { locale: ptBR })

  const title = item.description
  const details: string[] = []

  // Format based on action type
  switch (item.action) {
    case 'CREATED':
      if (item.metadata) {
        if (item.metadata.quotationId) {
          details.push(`Orçamento: ${item.metadata.quotationId}`)
        }
        if (item.metadata.clientName) {
          details.push(`Cliente: ${item.metadata.clientName}`)
        }
      }
      break

    case 'CANCELED':
      if (item.metadata?.cancelReason) {
        details.push(`Motivo: ${item.metadata.cancelReason}`)
      }
      if (item.metadata?.cancelNotes) {
        details.push(`Observações: ${item.metadata.cancelNotes}`)
      }
      break

    case 'DUPLICATED':
      if (item.metadata?.sourceOrderId) {
        details.push(
          `Ordem de serviço original: #${item.metadata.sourceOrderId}`,
        )
      }
      break

    case 'EDITED': {
      if (item.changes) {
        const { before, after } = item.changes as {
          before: Record<string, string | null>
          after: Record<string, string | null>
        }

        const fieldLabels: Record<string, string> = {
          clientId: 'Cliente',
          sellerId: 'Vendedor',
          contactId: 'Responsável',
          serie: 'Série',
          deliveryClientAddressId: 'Endereço de entrega',
          deliveryAddress: 'Endereço de entrega',
        }
        const nameFields: Record<string, string> = {
          clientId: 'clientName',
          sellerId: 'sellerName',
          contactId: 'contactName',
        }

        Object.keys(after).forEach((field) => {
          if (field.endsWith('Name')) return
          const label = fieldLabels[field] ?? formatKey(field)
          const nameField = nameFields[field]
          const beforeVal = nameField
            ? (before[nameField] ?? before[field] ?? '(vazio)')
            : (before[field] ?? '(vazio)')
          const afterVal = nameField
            ? (after[nameField] ?? after[field] ?? '(vazio)')
            : (after[field] ?? '(vazio)')
          if (beforeVal !== afterVal) {
            details.push(`${label}: ${beforeVal} 🡢 ${afterVal}`)
          }
        })
      }
      break
    }
  }

  return {
    date,
    time,
    author: item.createdByName,
    title,
    details: details.length > 0 ? details : undefined,
  }
}

export interface SubscriptionHistoryItem {
  id: string
  action: string
  description: string
  metadata?: {
    paymentId?: string
    value?: number
    billingType?: string
    dueDate?: string
    paymentDate?: string
    confirmedDate?: string
    invoiceUrl?: string
    planName?: string
    reason?: string
    notes?: string
    previousStatus?: string
    newStatus?: string
    [key: string]: unknown
  }
  createdAt: string
  createdByName: string
  type?: 'subscription' | 'payment'
}

export function formatSubscriptionHistoryEvent(
  item: SubscriptionHistoryItem,
): TimelineEvent {
  const createdAtDate = parseISO(item.createdAt)
  const date = format(createdAtDate, 'dd/MM/yyyy', { locale: ptBR })
  const time = format(createdAtDate, 'HH:mm', { locale: ptBR })

  const title = item.description
  const details: string[] = []

  // Format based on action type
  if (item.action.startsWith('PAYMENT_')) {
    // Eventos de pagamento
    if (item.metadata?.value) {
      // A cobrança guarda o valor em reais, como o Asaas; o formatador
      // espera centavos.
      details.push(
        `Valor: ${formatCurrencyToBrl(Math.round(item.metadata.value * 100))}`,
      )
    }
    if (item.metadata?.billingType) {
      const billingTypes: Record<string, string> = {
        CREDIT_CARD: 'Cartão de Crédito',
        BOLETO: 'Boleto',
        PIX: 'PIX',
        DEBIT_CARD: 'Cartão de Débito',
      }
      details.push(
        `Forma de pagamento: ${billingTypes[item.metadata.billingType] || item.metadata.billingType}`,
      )
    }
    if (item.metadata?.dueDate) {
      const dueDate = parseISO(item.metadata.dueDate)
      details.push(
        `Vencimento: ${format(dueDate, 'dd/MM/yyyy', { locale: ptBR })}`,
      )
    }
    if (item.metadata?.paymentDate) {
      const paymentDate = parseISO(item.metadata.paymentDate)
      details.push(
        `Pago em: ${format(paymentDate, 'dd/MM/yyyy', { locale: ptBR })}`,
      )
    }
    if (item.metadata?.confirmedDate) {
      const confirmedDate = parseISO(item.metadata.confirmedDate)
      details.push(
        `Confirmado em: ${format(confirmedDate, 'dd/MM/yyyy', { locale: ptBR })}`,
      )
    }
  } else {
    // Eventos de subscription
    switch (item.action) {
      case 'CREATED':
        if (item.metadata?.planName) {
          details.push(`Plano: ${item.metadata.planName}`)
        }
        if (item.metadata?.value) {
          details.push(`Valor: ${formatCurrencyToBrl(item.metadata.value)}`)
        }
        break

      case 'ACTIVATED':
        if (item.metadata?.reason) {
          details.push(`Motivo: ${item.metadata.reason}`)
        }
        break

      case 'BLOCKED':
        if (item.metadata?.reason) {
          details.push(`Motivo: ${item.metadata.reason}`)
        }
        if (item.metadata?.notes) {
          details.push(`Observações: ${item.metadata.notes}`)
        }
        break

      case 'STATUS_CHANGED':
        if (item.metadata?.previousStatus && item.metadata?.newStatus) {
          details.push(
            `Status: ${item.metadata.previousStatus} 🡢 ${item.metadata.newStatus}`,
          )
        }
        break
    }
  }

  return {
    date,
    time,
    author: item.createdByName || 'Sistema',
    title,
    details: details.length > 0 ? details : undefined,
  }
}
