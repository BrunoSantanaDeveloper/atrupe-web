'use client'

// O ícone de cada tipo de recurso da composição (design.md §6.10): o mesmo
// em botão, tabela de linhas, resumo por recurso e relatório. Quem precisar
// mostrar "máquina, material, mão de obra ou terceirizado" usa daqui, em vez
// de escolher um ícone na tela.

// Icons
import { IconTool, IconPackages, IconUsers } from '@tabler/icons-react'
import { IconOutsourced } from '@/assets/icons/CustomIcons'

// Types
import type { ComponentType } from 'react'
import type { ResourceKind } from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'

// Utils
import { ICON_SIZE } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// O que o ícone recebe: o mesmo contrato do Tabler, que o Button já usa
type IconLike = { size?: number | string; className?: string }

// Os ícones próprios do Figma (CustomIcons) não aceitam `size`: este adaptador
// deixa o terceirizado se comportar como um ícone do Tabler
const Outsourced = ({ size = 24, className }: IconLike) => (
  <IconOutsourced
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  />
)

// `provisional`: ainda não há ícone decidido para o tipo; fica em vermelho
// até alguém trocar (pedido do Maicol em 03/10/2026)
const icons: {
  [key in ResourceKind]: {
    Icon: ComponentType<IconLike>
    provisional: boolean
  }
} = {
  MACHINE: { Icon: IconTool, provisional: true },
  MATERIAL: { Icon: IconPackages, provisional: false }, // o mesmo do menu Materiais
  LABOR: { Icon: IconUsers, provisional: false },
  OUTSOURCED: { Icon: Outsourced, provisional: false }, // o mesmo do setor Terceirizado
}

export function ResourceKindIcon({
  kind,
  size = 16,
  className,
}: { kind: ResourceKind } & IconLike) {
  const { Icon, provisional } = icons[kind]
  return (
    <Icon
      size={size}
      className={cn(provisional && 'text-error-700', className)}
    />
  )
}

// Para o `LeftIcon` do Button: um componente por tipo, já com a cor
const bound = (kind: ResourceKind) => {
  const Bound = (props: IconLike) => <ResourceKindIcon kind={kind} {...props} />
  Bound.displayName = `ResourceKindIcon.${kind}`
  return Bound
}

export const resourceKindIcon: { [key in ResourceKind]: React.ElementType } = {
  MACHINE: bound('MACHINE'),
  MATERIAL: bound('MATERIAL'),
  LABOR: bound('LABOR'),
  OUTSOURCED: bound('OUTSOURCED'),
}

// Rótulo com ícone, para as células e sublinhas que hoje mostram só o texto
export function ResourceKindLabel({
  kind,
  label,
  className,
}: {
  kind: ResourceKind
  label: string
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <ResourceKindIcon kind={kind} size={ICON_SIZE.sm} className="shrink-0" />
      {label}
    </span>
  )
}
