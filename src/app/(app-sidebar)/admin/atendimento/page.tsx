import { Topbar } from '@/components/common/Topbar'
import { AtendimentoBotao } from './_components/AtendimentoBotao'
import { Card, Stack, Text } from './_components/primitives'

export function metadata() {
  return {
    title: 'Atendimento - Painel da equipe',
  }
}

// Super Admin › Atendimento: a entrada da equipe no painel do Chatwoot, já
// logada pelo Atrupe. O link vale 5 minutos e uma vez só, por isso é pedido
// no clique. É também para cá que o painel manda quem sai dele.
export default function AtendimentoPage() {
  return (
    <div className="space-y-5">
      <Topbar
        title="Atendimento no WhatsApp"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />
      <Card title="Painel da equipe">
        <Stack>
          <Text>
            As conversas do WhatsApp do suporte chegam no painel de atendimento.
            O robô responde o que está na base de suporte e passa para a equipe
            o que não sabe, o que pede decisão de uma pessoa e quem pede para
            falar com alguém.
          </Text>
          <Text tone="muted">
            O painel abre em outra aba, já com o seu login. Quem deixa de ser
            superadmin sai do painel na conferência diária.
          </Text>
          <div>
            <AtendimentoBotao rotulo="Abrir painel de atendimento" />
          </div>
        </Stack>
      </Card>
    </div>
  )
}
