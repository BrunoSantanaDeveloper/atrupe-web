// UI component Imports
import { Button } from '../ui/button'

// Icon Imports
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface Props {
  page?: number
  lastPage?: number
  setPage: (page: number) => void
}

export function TablePaginationControlled(props: Props) {
  const { page = 1, lastPage = 10, setPage } = props

  const totalPages = Array.from({ length: lastPage || 1 }, (_, i) => i)

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
    <div className="flex gap-2 justify-between p-5">
      <Button type="button" variant="outline" onClick={handlePrevPage}>
        <ArrowLeft size={16} />
        <span className="ml-1">Anterior</span>
      </Button>
      <div className="flex flex-wrap gap-2 justify-center">
        {totalPages.map((_, index) => (
          <Button
            type="button"
            key={index}
            variant={page === index + 1 ? 'light' : 'light'}
            onClick={() => setPage(index + 1)}
            size="icon"
          >
            {index + 1}
          </Button>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={handleNextPage}>
        <span className="mr-1">Próxima</span>
        <ArrowRight size={18} />
      </Button>
    </div>
  )
}
