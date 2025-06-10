// UI component Imports
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationContent,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface TablePaginationProps {
  searchParams?: { [key: string]: string }
  lastPage?: number
}

export function TablePagination({
  searchParams,
  lastPage = 1,
}: TablePaginationProps) {
  const currentPage = Number(searchParams?.page) || 1
  const items = Array.from({ length: lastPage ?? 1 }, (_, i) => i + 1)

  const searchParamsObject = new URLSearchParams(searchParams)

  function buildUrlWithPageParam(page: number): string {
    const params = new URLSearchParams(searchParamsObject.toString())
    params.set('page', page.toString())
    return `?${params.toString()}`
  }

  return (
    <Pagination>
      <PaginationContent className="w-full justify-between">
        <PaginationItem>
          <PaginationPrevious
            href={
              currentPage > 1 ? buildUrlWithPageParam(currentPage - 1) : '#'
            }
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        <PaginationContent>
          {items.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href={buildUrlWithPageParam(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
        <PaginationItem>
          <PaginationNext
            href={
              currentPage < lastPage
                ? buildUrlWithPageParam(currentPage + 1)
                : '#'
            }
            className={
              currentPage === lastPage ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
