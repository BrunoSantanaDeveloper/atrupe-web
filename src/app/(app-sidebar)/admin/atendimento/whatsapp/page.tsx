import { Topbar } from '@/components/common/Topbar'
import { ConectarWhatsApp } from '../_components/ConectarWhatsApp'

export function metadata() {
  return {
    title: 'Atendimento - WhatsApp',
  }
}

// O número do suporte: pela API oficial da Meta ou pelo WhatsApp Web (OpenWA,
// não oficial), que a tela só libera depois do aceite do risco.
export default function WhatsAppPage() {
  return (
    <div className="space-y-5">
      <Topbar
        title="WhatsApp do suporte"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />
      <ConectarWhatsApp />
    </div>
  )
}
