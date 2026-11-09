'use client'

import { useRouter } from 'next/navigation'

import { LacunasRobo } from '../_components/LacunasRobo'

// O relatório das passagens para a equipe; "criar pergunta" abre a tela do
// robô com uma pergunta nova sobre o assunto, para o superadmin responder.
export function Lacunas() {
  const router = useRouter()
  return (
    <LacunasRobo
      escopo="plataforma"
      onCriarPergunta={(assunto) =>
        router.push(
          `/admin/atendimento/robo?pergunta=${encodeURIComponent(assunto)}`,
        )
      }
    />
  )
}
