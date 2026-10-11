'use client'

// Next
import Link from 'next/link'

// Components
import { Button } from '@/components/ui/button'

// Icons
import { IconHome, IconRefresh, IconAlertTriangle } from '@tabler/icons-react'
import { FeaturedIcon } from '@/components/ui/featured-icon'

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <FeaturedIcon
          Icon={IconAlertTriangle}
          size="xl"
          variant="warningBorderedLight"
          rounded
        />
        <h2 className="type-section-title">Algo deu errado!</h2>
        <div className="flex gap-5">
          <Button
            type="button"
            variant="outline"
            onClick={reset}
            LeftIcon={IconRefresh}
          >
            Tentar novamente
          </Button>
          <Button type="button" asChild LeftIcon={IconHome}>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
      <p className="absolute bottom-16 text-gray-400 text-sm">
        {error?.message || 'Ocorreu um erro inesperado'}
      </p>
    </div>
  )
}
