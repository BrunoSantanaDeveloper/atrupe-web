'use client'

// A estrutura do produto (EP-1 a EP-3, área 03, 17/11/2026; back de
// 18/11/2026): a primeira pergunta do cadastro. Ela define os blocos que o
// cadastro abre. Não é o tipo de produto (cartão de visita) nem o setor (o
// setor é da gestão da produção). Pode ser trocada depois: o bloco que some
// fica guardado e volta se a estrutura voltar.

import { useFormContext } from 'react-hook-form'
import {
  IconBox,
  IconCalendarEvent,
  IconFileText,
  IconPrinter,
  IconTruckDelivery,
  type Icon as TablerIcon,
} from '@tabler/icons-react'

import { InfoHint } from '@/components/common/InfoHint'
import { ICON_SIZE } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

import type { NewProductsFormType, ProductStructure } from './schema'

type Option = {
  value: ProductStructure
  label: string
  description: string
  Icon: TablerIcon
  // A locação ainda não tem os campos dela (período, agenda e ponto)
  soon?: boolean
}

const OPTIONS: Option[] = [
  {
    value: 'STANDARD',
    label: 'Padrão',
    description: 'Medida, material e serviço. Serviço por hora também.',
    Icon: IconBox,
  },
  {
    value: 'SHEET',
    label: 'Gráfica',
    // Gráfica rápida e offset numa opção só, chamada só de "Gráfica" (Maicol,
    // 25/11/2026, Lista Lite 24/11, item 2): o offset não tinha nada próprio
    // (tiragem, cores e chapas nunca foram feitos) e abria os mesmos blocos
    description: 'Papel, sangria e folhas de acerto: gráfica rápida ou offset.',
    Icon: IconFileText,
  },
  {
    value: 'OFFSET',
    label: 'Offset',
    description: 'Impresso em folha, com tiragem, cores e chapas.',
    Icon: IconPrinter,
  },
  {
    value: 'RENTAL',
    label: 'Locação',
    description: 'Período, agenda e ponto.',
    Icon: IconCalendarEvent,
    soon: true,
  },
  {
    value: 'OUTSOURCED',
    label: 'Terceirizado',
    description: 'Comprado pronto de um fornecedor e revendido.',
    Icon: IconTruckDelivery,
  },
]

const isSheet = (value: ProductStructure) =>
  value === 'SHEET' || value === 'OFFSET'

// O que fica guardado quando a troca esconde um bloco (EP-3). Em JSX para a
// biblioteca de idiomas (IN-7)
function KeptNotice({
  from,
  to,
}: {
  from: ProductStructure
  to: ProductStructure
}) {
  if (from === to) return null
  if (from === 'OUTSOURCED')
    return (
      <p className="text-xs text-gray">
        O fornecedor e o custo do terceirizado ficam guardados. Se o produto
        voltar a ser terceirizado, eles voltam.
      </p>
    )
  if (isSheet(from) && !isSheet(to))
    return (
      <p className="text-xs text-gray">
        A sangria, as folhas de acerto e o papel das variações ficam guardados.
        Se o produto voltar a ser impresso em folha, eles voltam.
      </p>
    )
  return null
}

export function ProductStructureField({
  saved,
  sheetAvailable,
}: {
  // A estrutura gravada, na edição: avisa o que fica guardado na troca
  saved?: ProductStructure
  // Gráfica e offset abrem a configuração de Papéis do plano
  sheetAvailable: boolean
}) {
  const { watch, setValue } = useFormContext<NewProductsFormType>()
  const current = watch('structure') || 'STANDARD'

  const options = OPTIONS.filter(
    (option) =>
      // O offset saiu da escolha (item 2, 25/11/2026): só aparece no produto
      // que já foi gravado como offset, para não mudar o que ele é
      (option.value !== 'OFFSET' || saved === 'OFFSET') &&
      (sheetAvailable ||
        (option.value !== 'SHEET' && option.value !== 'OFFSET') ||
        option.value === saved),
  )

  return (
    <fieldset className="w-full space-y-3">
      <legend className="mb-3 flex items-center gap-1.5">
        <span className="type-card-title">Estrutura do produto</span>
        <InfoHint title="Estrutura do produto">
          <p>
            Diz como o produto é feito e vendido. O cadastro abre só os campos
            dessa estrutura: o impresso em folha pede papel, sangria e folhas de
            acerto; o terceirizado pede fornecedor e custo.
          </p>
          <p>
            Não é o tipo de produto nem o setor. A maioria dos produtos da
            comunicação visual é Padrão.
          </p>
          <p>
            Dá para trocar depois. O que a estrutura antiga tinha fica guardado
            e volta se ela voltar.
          </p>
        </InfoHint>
      </legend>
      <div
        role="radiogroup"
        aria-label="Estrutura do produto"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
      >
        {options.map(({ value, label, description, Icon, soon }) => {
          const checked = current === value
          const disabled = !!soon && saved !== value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={label}
              aria-describedby={`estrutura-${value}`}
              disabled={disabled}
              onClick={() =>
                setValue('structure', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className={cn(
                'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
                'border-gray-200 bg-white hover:bg-gray-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                checked && 'border-brand-500 bg-brand-50 hover:bg-brand-50',
                disabled && 'cursor-not-allowed opacity-60 hover:bg-white',
              )}
            >
              <span className="flex w-full items-center gap-1.5">
                <Icon
                  aria-hidden
                  size={ICON_SIZE.sm}
                  className={cn(
                    'shrink-0',
                    checked ? 'text-brand-600' : 'text-gray-500',
                  )}
                />
                <span className="text-sm font-medium text-gray-800">
                  {label}
                </span>
              </span>
              <span id={`estrutura-${value}`} className="text-xs text-gray">
                {description}
              </span>
              {soon && (
                <span className="mt-auto rounded-full bg-gray-100 px-2 text-xs text-gray-600">
                  Em breve
                </span>
              )}
            </button>
          )
        })}
      </div>
      {saved && <KeptNotice from={saved} to={current} />}
    </fieldset>
  )
}
