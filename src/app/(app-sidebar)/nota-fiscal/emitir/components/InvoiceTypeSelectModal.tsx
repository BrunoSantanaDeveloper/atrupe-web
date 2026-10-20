'use client'

import { useRouter } from '@/hooks/useRouter'

// UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

// Icons
import {
  IconFileInvoice,
  IconBuildingStore,
  IconTool,
} from '@tabler/icons-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

interface InvoiceTypeOption {
  key: string
  icon: React.ElementType
  title: string
  description: string
  disabled?: boolean
  badge?: string
  href?: string
}

const invoiceTypes: InvoiceTypeOption[] = [
  {
    key: 'nfe',
    icon: IconBuildingStore,
    title: 'NF-e (Produto)',
    description: 'Nota Fiscal Eletrônica para venda de produtos',
    disabled: false,
  },
  {
    key: 'nfse',
    icon: IconTool,
    title: 'NFS-e (Serviço)',
    description: 'Nota Fiscal de Serviço Eletrônico',
    disabled: false,
  },
  {
    key: 'nfce',
    icon: IconFileInvoice,
    title: 'NFC-e (Consumidor)',
    description: 'Nota Fiscal de Consumidor',
  },
]

export function InvoiceTypeSelectModal({ open, onOpenChange, orderId }: Props) {
  const router = useRouter()

  const handleSelect = (type: InvoiceTypeOption) => {
    if (type.disabled) return

    onOpenChange(false)

    if (type.key === 'nfe') {
      router.push(`/nota-fiscal/emitir/${orderId}`)
    } else if (type.key === 'nfse') {
      router.push(`/nota-fiscal/emitir-nfse/${orderId}`)
    } else if (type.key === 'nfce') {
      const query = orderId ? `?orderId=${encodeURIComponent(orderId)}` : ''
      router.push(`/nota-fiscal/emitir/avulsa/nfce${query}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar tipo de nota fiscal</DialogTitle>
          <DialogDescription>
            Escolha o tipo de nota fiscal a ser emitida para este pedido.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-3 pt-2">
            {invoiceTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.key}
                  type="button"
                  disabled={type.disabled}
                  onClick={() => handleSelect(type)}
                  className={`
                  group relative flex items-center gap-4 rounded-lg border p-4 text-left transition-all
                  ${
                    type.disabled
                      ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                      : 'cursor-pointer border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-300'
                  }
                `}
                >
                  <div
                    className={`
                  flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                  ${type.disabled ? 'bg-gray-100 text-gray-400' : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'}
                `}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm ${type.disabled ? 'text-gray-400' : 'text-gray-800'}`}
                    >
                      {type.title}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${type.disabled ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {type.description}
                    </p>
                  </div>

                  {type.badge && (
                    <Badge variant="neutralLight" className="shrink-0 text-xs">
                      {type.badge}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
