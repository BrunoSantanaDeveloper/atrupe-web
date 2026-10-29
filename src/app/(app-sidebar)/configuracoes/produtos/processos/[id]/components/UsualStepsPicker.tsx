'use client'

// Etapas anteriores e seguintes do processo (FL-7, revisto em 28/10/2026):
// a lista mostra só o que está marcado, e "Acrescentar etapa" busca o resto.
// Antes eram todos os processos com uma caixa de marcar cada, ilegível com
// trinta processos.

import { useState } from 'react'
import { IconPlus, IconX } from '@tabler/icons-react'

// UI
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { SectorIcon } from '@/components/common/SectorIcon'

// Types
import type { UsualNeighbor } from '../../../[id]/composicao/assembly'

interface Props {
  label: string
  help: string
  items?: UsualNeighbor[]
  canEdit: boolean
  onToggle: (otherId: string, usual: boolean) => void
}

export function UsualStepsPicker({
  label,
  help,
  items,
  canEdit,
  onToggle,
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const marked = items?.filter((item) => item.usual) || []
  // Busca pelo trecho digitado, sem acento: a busca aproximada do Command
  // achava "Lamina" em "E2E Ilhós … Administração", letra por letra
  const plain = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const others = (items?.filter((item) => !item.usual) || []).filter(
    (item) =>
      !search.trim() ||
      plain(`${item.name} ${item.sector}`).includes(plain(search.trim())),
  )
  const hasOthers = !!items?.some((item) => !item.usual)

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <p className="text-xs text-gray">{help}</p>
      {!items ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <div className="space-y-2">
          {marked.length ? (
            <ul className="space-y-1">
              {marked.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2"
                >
                  <SectorIcon name={item.sector} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-gray-800">
                      {item.name}
                    </span>
                    <span className="block text-xs text-gray">
                      {item.sector}
                    </span>
                  </span>
                  {canEdit && (
                    <Button
                      type="button"
                      size="iconSm"
                      variant="neutralGhost"
                      aria-label={`Tirar ${item.name}`}
                      onClick={() => onToggle(item.id, false)}
                    >
                      <IconX aria-hidden="true" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray">
              Nenhuma etapa marcada.
            </p>
          )}
          {canEdit && hasOthers && (
            <Popover
              open={open}
              onOpenChange={(next) => {
                setOpen(next)
                if (!next) setSearch('')
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  LeftIcon={IconPlus}
                >
                  Acrescentar etapa
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar processo"
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    {!others.length && (
                      <CommandEmpty>Nenhum processo encontrado.</CommandEmpty>
                    )}
                    {others.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.name} ${item.sector}`}
                        onSelect={() => {
                          setOpen(false)
                          setSearch('')
                          onToggle(item.id, true)
                        }}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-gray-800">
                            {item.name}
                          </span>
                          <span className="block text-xs text-gray">
                            {item.sector}
                          </span>
                        </span>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  )
}
