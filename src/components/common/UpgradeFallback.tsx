'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconLock } from '@tabler/icons-react'

interface UpgradeFallbackProps {
  title?: string
  description?: string
  redirectTo?: string
  className?: string
}

export function UpgradeFallback({
  title = 'Funcionalidade Bloqueada',
  description = 'Esta funcionalidade não está incluída no seu plano atual. Faça upgrade para acessar esta feature.',
  redirectTo = '/assinatura/contratar',
  className = '',
}: UpgradeFallbackProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[400px] p-8 ${className}`}
    >
      <FeaturedIcon
        Icon={IconLock}
        variant="neutralBorderedLight"
        size="xl"
        rounded
        className="mb-6"
      />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>
      <Button type="button" asChild>
        <Link href={redirectTo}>Fazer Upgrade</Link>
      </Button>
    </div>
  )
}
