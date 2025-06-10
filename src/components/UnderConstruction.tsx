// Icons
import { IconTools } from '@tabler/icons-react'
import { FeaturedIcon } from './ui/featured-icon'

export function UnderConstruction() {
  return (
    <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 py-12 w-full max-w-lg">
        <FeaturedIcon
          Icon={IconTools}
          size="xxl"
          variant="neutralBorderedLight"
          rounded
        />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            Página em Construção
          </h2>
          <p className="text-gray-500">
            Esta funcionalidade está sendo desenvolvida e estará disponível em
            breve.
          </p>
        </div>
      </div>
    </div>
  )
}
