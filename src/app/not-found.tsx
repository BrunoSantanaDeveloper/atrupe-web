// Next Imports
import Link from 'next/link'

// UI component Imports
import { Button } from '@/components/ui/button'
import { IconHome } from '@tabler/icons-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="text-center space-y-4">
        <p className="text-7xl font-semibold">404</p>
        <p className="text-3xl font-semibold">Página não encontrada</p>
        <Button type="button" asChild LeftIcon={IconHome}>
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  )
}
