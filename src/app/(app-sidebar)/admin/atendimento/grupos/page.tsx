import { Topbar } from '@/components/common/Topbar'
import { GruposEquipe } from '../_components/GruposEquipe'

export function metadata() {
  return {
    title: 'Atendimento - Grupos da equipe',
  }
}

// Grupos de conversa interna da equipe dentro do painel do atendimento: só o
// superadmin cria e muda, e a API confere de novo.
export default function GruposPage() {
  return (
    <div className="space-y-5">
      <Topbar
        title="Grupos da equipe"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />
      <GruposEquipe />
    </div>
  )
}
