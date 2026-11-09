import { Topbar } from '@/components/common/Topbar'
import { Lacunas } from './Lacunas'

export function metadata() {
  return {
    title: 'Atendimento - O que o robô não soube',
  }
}

export default function LacunasPage() {
  return (
    <div className="space-y-5">
      <Topbar
        title="O que o robô não soube"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />
      <Lacunas />
    </div>
  )
}
