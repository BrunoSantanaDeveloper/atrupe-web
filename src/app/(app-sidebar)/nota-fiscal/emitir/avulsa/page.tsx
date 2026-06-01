'use client'

import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FiscalModuleGate } from '../../components/FiscalModuleGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import {
  IconBuildingStore,
  IconTool,
  IconFileInvoice,
  IconChevronRight,
} from '@tabler/icons-react'

interface AvulsaTypeOption {
  key: string
  icon: React.ElementType
  title: string
  description: string
  href: string
  disabled?: boolean
  badge?: string
}

const avulsaTypes: AvulsaTypeOption[] = [
  {
    key: 'nfe',
    icon: IconBuildingStore,
    title: 'NF-e (Produto)',
    description: 'Nota Fiscal Eletrônica para venda de produtos',
    href: '/nota-fiscal/emitir/avulsa/nfe',
    disabled: false,
  },
  {
    key: 'nfse',
    icon: IconTool,
    title: 'NFS-e (Serviço)',
    description: 'Nota Fiscal de Serviço Eletrônico',
    href: '/nota-fiscal/emitir/avulsa/nfse',
    disabled: false,
  },
  {
    key: 'nfce',
    icon: IconFileInvoice,
    title: 'NFC-e (Consumidor)',
    description: 'Nota Fiscal de Consumidor',
    href: '/nota-fiscal/emitir/avulsa/nfce',
    disabled: false,
  },
]

export default function NotaAvulsaPage() {
  return (
    <PermissionGate
      permissions={['nota_fiscal:emitir:create']}
      fallback={
        <div className="p-4">
          Você não tem permissão para emitir nota fiscal.
        </div>
      }
    >
      <FiscalModuleGate>
        <div className="space-y-5">
          <Topbar
            title="Nota Fiscal Avulsa"
            supportText="Emita notas fiscais sem depender de uma ordem de serviço"
            previousPage="/nota-fiscal/emitir"
          />

          <div className="max-w-lg">
            <div className="flex flex-col gap-3">
              {avulsaTypes.map((type) => {
                const Icon = type.icon
                const content = (
                  <div
                    className={`
                      group relative flex items-center gap-4 rounded-lg border p-5 text-left transition-all
                      ${
                        type.disabled
                          ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                          : 'cursor-pointer border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 hover:shadow-sm'
                      }
                    `}
                  >
                    <div
                      className={`
                        flex h-11 w-11 shrink-0 items-center justify-center rounded-full
                        ${type.disabled ? 'bg-gray-100 text-gray-400' : 'bg-primary-100 text-primary-600 group-hover:bg-primary-200'}
                      `}
                    >
                      <Icon size={22} />
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

                    {type.badge ? (
                      <Badge
                        variant="neutralLight"
                        className="shrink-0 text-xs"
                      >
                        {type.badge}
                      </Badge>
                    ) : (
                      <IconChevronRight
                        size={18}
                        className={`shrink-0 transition-transform ${type.disabled ? 'text-gray-300' : 'text-gray-400 group-hover:translate-x-0.5 group-hover:text-primary-500'}`}
                      />
                    )}
                  </div>
                )

                if (type.disabled) {
                  return <div key={type.key}>{content}</div>
                }

                return (
                  <Link key={type.key} href={type.href} className="block">
                    {content}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </FiscalModuleGate>
    </PermissionGate>
  )
}
