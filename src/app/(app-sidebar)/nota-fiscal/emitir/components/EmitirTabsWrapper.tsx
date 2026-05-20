'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconFilePlus, IconHistory } from '@tabler/icons-react'
import { ReactNode } from 'react'

interface Props {
  emitirContent: ReactNode
  gestaoContent: ReactNode
}

export function EmitirTabsWrapper({ emitirContent, gestaoContent }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'emitir'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)

    // Clear pagination and search filters when switching tabs
    params.delete('page')
    params.delete('search')
    params.delete('status')
    params.delete('nfeStatus')

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
          <TabsTrigger value="emitir" className="flex items-center gap-2">
            <IconFilePlus className="size-4" />
            Emissão de Notas
          </TabsTrigger>
          <TabsTrigger value="gestao" className="flex items-center gap-2">
            <IconHistory className="size-4" />
            Gestão de Notas Emitidas
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="emitir"
        className="flex-1 min-h-0 m-0 overflow-hidden"
      >
        {emitirContent}
      </TabsContent>

      <TabsContent
        value="gestao"
        className="flex-1 min-h-0 m-0 overflow-hidden flex flex-col"
      >
        {gestaoContent}
      </TabsContent>
    </Tabs>
  )
}
