'use client'

import { useRouter } from 'next/navigation'

// Components
import { Button } from '@/components/ui/button'

// Icons
import { RefreshCw } from 'lucide-react'

export function TryAgainButton() {
  const router = useRouter()

  return (
    <Button
      variant="neutralOutline"
      className="w-full"
      LeftIcon={RefreshCw}
      onClick={() => router.replace('/logout')}
    >
      Tentar novamente
    </Button>
  )
}
