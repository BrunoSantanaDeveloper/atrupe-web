// React
import Image from 'next/image'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icons
import { IconPackage } from '@tabler/icons-react'

// Types
import { QuotationType, QuotationItemType } from '@/types/sales/quotation'

import noImage from '@/assets/images/image-placeholder.svg'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  quotationData: QuotationType
  rowData?: QuotationItemType
}

export function ItemImageDialog({ open, setOpen, rowData }: Props) {
  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'image' : '')
  }

  const imageBadge = rowData?.image?.url
    ? rowData?.image?.original
      ? 'Imagem original'
      : 'Imagem alterada'
    : 'Sem imagem'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[348px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPackage} />
            <DialogTitle>{rowData?.description}</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody className="relative">
          <Image
            src={rowData?.image?.url ?? noImage}
            width={600}
            height={0}
            alt="Foto do item"
            className="min-h-[300px] w-[300px] object-cover object-center rounded-xl"
          />
          <Badge variant="light" size="lg" className="absolute top-12 left-12">
            {imageBadge}
          </Badge>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
