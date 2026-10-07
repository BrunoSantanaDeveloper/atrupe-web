'use client'

// React
import { useEffect, useState } from 'react'

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
  activeVariant?: 'brand' | 'success' | 'dark'
  // Primeira carga: reserva a altura da paginação, sem mostrar "1"
  isLoading?: boolean
}

export function TablePagination({
  searchParams,
  lastPage = 1,
  activeVariant = 'brand',
  isLoading,
}: TablePaginationProps) {
  const currentPage = Number(searchParams?.page) || 1

  // Página marcada no clique, antes de a página nova chegar
  // (design/openspec/changes/microinteracoes, Decisão 5)
  const [selectedPage, setSelectedPage] = useState(currentPage)
  useEffect(() => {
    setSelectedPage(currentPage)
  }, [currentPage])

  const searchParamsObject = new URLSearchParams(searchParams)

  function buildUrlWithPageParam(page: number): string {
    const params = new URLSearchParams(searchParamsObject.toString())
    params.set('page', page.toString())
    return `?${params.toString()}`
  }

  // Função para gerar os itens de paginação com reticências
  function getPaginationItems() {
    const pages: (number | 'ellipsis')[] = []
    const delta = 1 // Quantidade de páginas antes/depois da atual
    const range = []
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(lastPage - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }
    if (currentPage - delta > 2) {
      pages.push(1, 'ellipsis', ...range)
    } else {
      pages.push(
        ...Array.from(
          { length: Math.max(currentPage + delta, 1) },
          (_, i) => i + 1,
        ).filter((p) => p <= lastPage),
      )
    }
    if (currentPage + delta < lastPage - 1) {
      pages.push('ellipsis', lastPage)
    } else if (lastPage > 1 && !pages.includes(lastPage)) {
      pages.push(lastPage)
    }
    // Garante que a primeira página sempre aparece
    if (!pages.includes(1)) pages.unshift(1)
    return pages.filter((v, i, arr) => arr.indexOf(v) === i)
  }

  const paginationItems = getPaginationItems()

  if (isLoading) return <div aria-hidden="true" className="h-10" />

  return (
    <Pagination>
      <PaginationContent className="w-full justify-center gap-2 flex-nowrap overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-gray-300">
        <PaginationItem>
          <PaginationPrevious
            href={
              currentPage > 1 ? buildUrlWithPageParam(currentPage - 1) : '#'
            }
            scroll={false}
            onClick={() => currentPage > 1 && setSelectedPage(currentPage - 1)}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        <PaginationContent className="gap-1 flex-nowrap">
          {paginationItems.map((page, idx) =>
            page === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-gray-400 select-none"
              >
                ...
              </span>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  href={buildUrlWithPageParam(page as number)}
                  isActive={selectedPage === page}
                  scroll={false}
                  onClick={() => setSelectedPage(page as number)}
                  activeVariant={activeVariant}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
        </PaginationContent>
        <PaginationItem>
          <PaginationNext
            href={
              currentPage < lastPage
                ? buildUrlWithPageParam(currentPage + 1)
                : '#'
            }
            scroll={false}
            onClick={() =>
              currentPage < lastPage && setSelectedPage(currentPage + 1)
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
