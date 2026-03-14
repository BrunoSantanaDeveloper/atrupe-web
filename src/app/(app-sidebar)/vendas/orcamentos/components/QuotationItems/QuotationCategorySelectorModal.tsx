import { createElement } from 'react'

import {
  DialogBody,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { useSectorWithProducts } from '@/hooks/queries/useSectorWithProducts'
import { Dialog } from '@radix-ui/react-dialog'
import { IconLayoutGridAdd, IconQuestionMark } from '@tabler/icons-react'
import { useQuotation } from '@/contexts/quotationContext'
import { sectorIcons } from '@/consts/sectors'
import { Loader2 } from 'lucide-react'

interface QuotationCategorySelectorModalProps {
  open: boolean
  onSelect: () => void
}

// Ordem fixa: Criação → Impressão → Gráfica → CNC → Serralheria → (outros) → Instalação
const SECTOR_ORDER: Array<string[]> = [
  ['criação', 'criacao'],
  ['impressão', 'impressao'],
  ['gráfica', 'grafica'],
  ['cnc'],
  ['serralheria'],
]

const INSTALACAO_KEYWORDS = ['instalação', 'instalacao']

function getSectorPriority(name: string): number {
  const lower = name.toLowerCase()

  // Instalação sempre último (prioridade alta = final)
  if (INSTALACAO_KEYWORDS.some((kw) => lower.includes(kw))) {
    return SECTOR_ORDER.length + 1
  }

  // Verificar ordem fixa
  for (let i = 0; i < SECTOR_ORDER.length; i++) {
    if (SECTOR_ORDER[i].some((kw) => lower.includes(kw))) {
      return i
    }
  }

  // Setores não mapeados ficam antes de Instalação
  return SECTOR_ORDER.length
}

function sortSectors(
  sectors: Array<{ id: string; name: string; icon: string }>,
) {
  return [...sectors].sort((a, b) => {
    const priorityA = getSectorPriority(a.name)
    const priorityB = getSectorPriority(b.name)

    if (priorityA !== priorityB) return priorityA - priorityB

    // Mesma prioridade → ordem alfabética
    return a.name.localeCompare(b.name)
  })
}

export function QuotationCategorySelectorModal({
  open = true,
  onSelect,
}: QuotationCategorySelectorModalProps) {
  const { data, isLoading } = useSectorWithProducts()

  const { updateQuotationData, openChangeModal } = useQuotation()

  function handleSelect(category: string) {
    updateQuotationData({ sectorId: category })
    openChangeModal(false)
    onSelect()
  }

  // Ordenar os dados antes de renderizar
  const sortedData = data ? sortSectors(data) : []

  return (
    <Dialog open={open} onOpenChange={openChangeModal}>
      <DialogContent className="sm:max-w-fit">
        <DialogHeader className="border-0">
          <DialogTitle className="flex items-center justify-center gap-4 flex-col">
            <FeaturedIcon
              rounded
              variant="borderedLight"
              Icon={IconLayoutGridAdd}
              size={'lg'}
            />
            <span className="text-lg text-gray-900 font-semibold w-full text-center">
              Qual item deseja adicionar?
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Selecione o item desejado
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div
            className={`gap-3 grid ${
              sortedData.length <= 1
                ? 'grid-cols-1'
                : sortedData.length === 2
                  ? 'grid-cols-2'
                  : sortedData.length === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-4'
            }`}
          >
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <Loader2 className="text-gray size-6 animate-spin" />
              </div>
            ) : (
              sortedData?.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant="neutralOutline"
                  className="p-2 flex-col w-[120px] h-[120px] rounded-xl border-none text-gray-600 overflow-hidden shadow-sm"
                  onClick={() => handleSelect(option.id)}
                >
                  {option.icon ? (
                    createElement(
                      sectorIcons[option.icon]?.icon || IconQuestionMark,
                      {
                        className:
                          'mb-2 max-h-6 max-w-6 md:max-h-10 md:max-w-10 w-full',
                        'aria-hidden': 'true',
                      },
                    )
                  ) : (
                    <IconQuestionMark
                      className="mb-2 max-h-6 max-w-6 md:max-h-10 md:max-w-10 w-full"
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-xs text-wrap">{option.name}</span>
                </Button>
              ))
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
