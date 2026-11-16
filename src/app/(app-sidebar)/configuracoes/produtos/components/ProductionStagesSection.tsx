'use client'

// As etapas de produção do produto numa sanfona (14/11/2026): ficam abaixo
// das configurações de venda e começam fechadas. A lista continua montada
// com a sanfona fechada, porque é ela que preenche os setores do produto
// novo ao abrir o cadastro.

// React
import { useState } from 'react'

// Third-party
import { useFormContext, useWatch } from 'react-hook-form'

// Components
import { ProductionStages } from './ProductionStages'
import { ProductFormAccordion } from './ProductFormAccordion'

// Types
import type { NewProductsFormType } from './schema'

export function ProductionStagesSection() {
  const [open, setOpen] = useState(false)
  const { control } = useFormContext<NewProductsFormType>()
  const stages = useWatch({ control, name: 'productionStages' }) || []
  const active = stages.filter((stage) => stage?.isActive).length

  return (
    <ProductFormAccordion
      title="Etapas de produção"
      description={
        stages.length
          ? `${active} de ${stages.length} etapas usadas por este produto`
          : 'Os setores por onde o produto passa na produção'
      }
      open={open}
      onOpenChange={setOpen}
    >
      <ProductionStages hideTitle />
    </ProductFormAccordion>
  )
}
