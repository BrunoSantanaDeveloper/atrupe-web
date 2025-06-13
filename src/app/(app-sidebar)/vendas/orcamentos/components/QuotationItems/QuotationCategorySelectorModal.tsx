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
              data?.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant="neutralOutline"
                  className="p-2 flex-col aspect-square h-full w-full rounded-xl border-none text-gray-600 overflow-hidden shadow-sm"
                  onClick={() => handleSelect(option.id)}
                >
                  {option.icon ? (
                    createElement(sectorIcons[option.icon], {
                      className:
                        'mb-2 max-h-6 max-w-6 md:max-h-10 md:max-w-10 w-full',
                      'aria-hidden': 'true',
                    })
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
