import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconInfoCircle } from '@tabler/icons-react'
import { FormType } from './schema'

interface ConversionPreviewProps {
  data: FormType
}

export function ConversionPreview({ data }: ConversionPreviewProps) {
  const getConversionExample = (
    type: 'length' | 'weight' | 'capacity',
    unit: string,
  ) => {
    const examples = {
      length: {
        MT: '1 metro = 1 MT',
        CM: '1 metro = 100 CM',
        MM: '1 metro = 1000 MM',
      },
      weight: {
        KG: '1 quilograma = 1 KG',
        GR: '1 quilograma = 1000 GR',
        MG: '1 quilograma = 1.000.000 MG',
      },
      capacity: {
        LT: '1 litro = 1 LT',
        ML: '1 litro = 1000 ML',
      },
    }

    return examples[type][unit as keyof (typeof examples)[typeof type]] || unit
  }

  const getUnitLabel = (unit: string) => {
    const labels: { [key: string]: string } = {
      // Comprimento
      MT: 'Metros',
      CM: 'Centímetros',
      MM: 'Milímetros',
      // Peso
      KG: 'Quilogramas',
      GR: 'Gramas',
      MG: 'Miligramas',
      // Capacidade
      LT: 'Litros',
      ML: 'Mililitros',
    }
    return labels[unit] || unit
  }

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Preview das configurações</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Comprimento padrão:
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getUnitLabel(data.length)}</Badge>
              <span className="text-xs text-muted-foreground">
                {getConversionExample('length', data.length)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Peso padrão:</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getUnitLabel(data.weight)}</Badge>
              <span className="text-xs text-muted-foreground">
                {getConversionExample('weight', data.weight)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Capacidade padrão:
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getUnitLabel(data.capacity)}</Badge>
              <span className="text-xs text-muted-foreground">
                {getConversionExample('capacity', data.capacity)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            ℹ️ Estas unidades serão usadas por padrão nos novos produtos
            cadastrados. Você pode alterar individualmente cada produto quando
            necessário.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
