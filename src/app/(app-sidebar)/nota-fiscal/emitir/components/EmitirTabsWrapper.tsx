'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconFilePlus, IconHistory } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'
import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

interface Props {
  emitirContent: ReactNode
  gestaoContent: ReactNode
}

export function EmitirTabsWrapper({ emitirContent, gestaoContent }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { hasPermission } = usePermissions()

  // Abas com permissoes distintas: consultar notas emitidas nao exige poder
  // emitir. Sem isso, quem so tem 'emitidas:view' nao alcanca a gestao.
  const canEmitir = hasPermission('nota_fiscal:emitir:create')
  const canGestao = hasPermission('nota_fiscal:emitidas:view')

  const requestedTab = searchParams.get('tab') || 'emitir'
  // Se a aba pedida nao e permitida, cai na outra que o usuario pode ver.
  const currentTab =
    requestedTab === 'gestao' && !canGestao
      ? 'emitir'
      : requestedTab === 'emitir' && !canEmitir
        ? 'gestao'
        : requestedTab

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)

    // Clear pagination and search filters when switching tabs
    params.delete('page')
    params.delete('search')
    params.delete('status')
    params.delete('nfeStatus')
    // Sem isso a aba de gestão herdaria o ambiente escolhido na emissão.
    params.delete('ambiente')

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs
      value={currentTab}
      onValueChange={handleTabChange}
      className="flex-1 flex flex-col min-h-0 w-full overflow-hidden"
    >
      <div className="flex flex-col mb-4">
        <TabsList className="w-fit">
          {canEmitir && (
            <TabsTrigger value="emitir" className="flex items-center gap-2">
              <Icon icon={IconFilePlus} size="sm" />
              Emissão de Notas
            </TabsTrigger>
          )}
          {canGestao && (
            <TabsTrigger value="gestao" className="flex items-center gap-2">
              <Icon icon={IconHistory} size="sm" />
              Gestão de Notas Emitidas
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      {canEmitir && (
        <TabsContent
          value="emitir"
          className="flex-1 min-h-0 m-0 overflow-hidden"
        >
          {emitirContent}
        </TabsContent>
      )}

      {canGestao && (
        <TabsContent
          value="gestao"
          className="flex-1 min-h-0 m-0 overflow-hidden flex flex-col"
        >
          {gestaoContent}
        </TabsContent>
      )}
    </Tabs>
  )
}
