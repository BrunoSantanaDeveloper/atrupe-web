// React
import { memo } from 'react'

// UI
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Icons
import { IconCircle, IconCircleFilled, IconPlus } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Actions
import { updateItem } from '@/actions/_cruds'

// Libs
import { cn } from '@/lib/utils'

interface Props {
  quotation: QuotationType
  tagsList: {
    id: string
    title: string
    color: string
  }[]
}

function QuotationTag({ quotation, tagsList }: Props) {
  const allowChangeStatus =
    quotation?.status === 'OPEN' || quotation?.status === 'OVERDUE'

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (quotationStatus: { tagId: string | null }) =>
      updateItem('quotationRoute', quotation.id, quotationStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
      queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
    },
  })

  const handleChangeStatus = async (tagId: string | null) => {
    if (!allowChangeStatus) return

    const body = {
      tagId,
    }

    toast.promise(mutation.mutateAsync(body), {
      loading: 'Aguarde...',
      success: () => {
        return 'Status alterado'
      },
      error: 'Ocorreu um erro',
    })
  }

  const status = quotation?.tag

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="none" variant="none">
          <Badge
            size={status ? 'default' : 'roundSm'}
            LeftIcon={status ? undefined : IconPlus}
            className={cn(status ? 'text-white' : '')}
            variant="neutralLight"
            style={{
              backgroundColor: status?.color,
            }}
          >
            {status?.text}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48" align="start">
        <DropdownMenuGroup>
          {tagsList.map((tag) => (
            <DropdownMenuItem
              key={tag.id}
              onClick={() => handleChangeStatus(tag.id)}
              disabled={!allowChangeStatus}
            >
              <IconCircleFilled
                size={ICON_SIZE.md}
                aria-hidden="true"
                className="mr-2"
                color={tag.color}
              />
              {tag.title}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => handleChangeStatus(null)}
            disabled={!allowChangeStatus || !quotation.tag}
          >
            <IconCircle aria-hidden="true" className="size-2 mr-2" />
            Remover status
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const QuotationTagDropdown = memo(QuotationTag)
