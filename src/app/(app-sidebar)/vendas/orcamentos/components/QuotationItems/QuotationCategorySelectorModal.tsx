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
  onClose: () => void
  onSelect: () => void
}

// Função para ordenar os setores com Criação primeiro e Instalação por último
function sortSectors(
  sectors: Array<{ id: string; name: string; icon: string }>,
) {
  return sectors.sort((a, b) => {
    // Criação sempre primeiro
    if (
      a.name.toLowerCase().includes('criação') ||
      a.name.toLowerCase().includes('criacao')
    ) {
      return -1
    }
    if (
      b.name.toLowerCase().includes('criação') ||
      b.name.toLowerCase().includes('criacao')
    ) {
      return 1
    }

    // Instalação sempre por último
    if (
      a.name.toLowerCase().includes('instalação') ||
      a.name.toLowerCase().includes('instalacao')
    ) {
      return 1
    }
    if (
      b.name.toLowerCase().includes('instalação') ||
      b.name.toLowerCase().includes('instalacao')
    ) {
      return -1
    }

    // Para os demais, manter ordem alfabética
    return a.name.localeCompare(b.name)
  })
}

export function QuotationCategorySelectorModal({
  open = true,
  onClose,
  onSelect,
}: QuotationCategorySelectorModalProps) {
  const { data, isLoading } = useSectorWithProducts()

  const { updateQuotationData } = useQuotation()

  function handleSelect(category: string) {
    updateQuotationData({ sectorId: category })
    onClose()
    onSelect()
  }

  // Ordenar os dados antes de renderizar
  const sortedData = data ? sortSectors(data) : []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[696px]">
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
          <div className="gap-3 grid grid-cols-4 sm:grid-cols-5">
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
                  className="p-2 flex-col aspect-square h-full w-full rounded-xl border-none text-gray-600 overflow-hidden shadow-sm"
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
