// UI component Imports
import { Button } from '../ui/button'

// Icon Imports
import {
  IconArrowLeft as ArrowLeft,
  IconArrowRight as ArrowRight,
} from '@tabler/icons-react'

interface Props {
  page?: number
  lastPage?: number
  setPage: (page: number) => void
}

export function TablePaginationControlled(props: Props) {
  const { page = 1, lastPage = 10, setPage } = props
  const paginationItems = getPaginationItems(page, lastPage)

  const handleNextPage = () => {
    if (page < lastPage) {
      setPage(page + 1)
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  return (
    <div className="flex flex-wrap gap-3 justify-between p-5">
      <Button
        type="button"
        variant="outline"
        onClick={handlePrevPage}
        disabled={page <= 1}
      >
        <ArrowLeft size={16} />
        <span className="ml-1">Anterior</span>
      </Button>

      <div className="flex flex-wrap gap-2 justify-center">
        {paginationItems.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center text-gray-500"
            >
              ...
            </span>
          ) : (
            <Button
              type="button"
              key={item}
              variant={page === item ? 'default' : 'light'}
              onClick={() => setPage(item)}
              size="icon"
              aria-current={page === item ? 'page' : undefined}
            >
              {item}
            </Button>
          ),
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleNextPage}
        disabled={page >= lastPage}
      >
        <span className="mr-1">Proxima</span>
        <ArrowRight size={18} />
      </Button>
    </div>
  )
}

function getPaginationItems(currentPage: number, lastPage: number) {
  const totalPages = Math.max(lastPage || 1, 1)
  const safePage = Math.min(Math.max(currentPage || 1, 1), totalPages)

  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([
    1,
    2,
    totalPages - 1,
    totalPages,
    safePage - 1,
    safePage,
    safePage + 1,
  ])

  const validPages = Array.from(pages)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)

  return validPages.reduce<(number | 'ellipsis')[]>((items, item, index) => {
    const previous = validPages[index - 1]
    if (previous && item - previous > 1) {
      items.push('ellipsis')
    }
    items.push(item)
    return items
  }, [])
}
