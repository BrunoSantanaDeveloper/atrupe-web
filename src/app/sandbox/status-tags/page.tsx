'use client'

import React from 'react'
import { StatusTag } from '@/components/ui/status-tag'
import {
  IconPencil,
  IconCheck,
  IconClock,
  IconSearch,
  IconX,
  IconRocket,
  IconLock,
  IconShieldCheck,
} from '@tabler/icons-react'

export const dynamic = 'force-dynamic'

export default function StatusTagSandboxPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-32">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Status Tags — Sandbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualização de todos os estados e tamanhos dos componentes de
            Fase/Status (Figma).
          </p>
        </div>

        {/* --- TAMANHO LARGE (Semelhante à proporção maior padrão) --- */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
            Tamanho: Large (lg)
          </h2>
          <div className="flex flex-wrap gap-8 items-end">
            <StatusTag
              size="lg"
              variant="draft"
              tabLabel="Rascunho"
              title="Planejamento"
              icon={<IconPencil aria-hidden className="w-1/2 h-1/2" />}
            />
            <StatusTag
              size="lg"
              variant="approval"
              tabLabel="Aprovação"
              title="Aguardando Diretoria"
              icon={<IconCheck aria-hidden className="w-1/2 h-1/2" />}
            />
            <StatusTag
              size="lg"
              variant="inProgress"
              tabLabel="Em Progresso"
              title="Desenvolvimento"
              icon={<IconClock aria-hidden className="w-1/2 h-1/2" />}
            />
            <StatusTag
              size="lg"
              variant="inReview"
              tabLabel="Em Revisão"
              title="Code Review"
              icon={<IconSearch aria-hidden className="w-1/2 h-1/2" />}
            />
            <StatusTag
              size="lg"
              variant="rejected"
              tabLabel="Rejeitada"
              title="Ajustes Necessários"
              icon={<IconX aria-hidden className="w-1/2 h-1/2" />}
            />
            <StatusTag
              size="lg"
              variant="readyForDev"
              tabLabel="Pronto para Dev"
              title="Prioridade Alta"
              icon={<IconRocket aria-hidden className="w-1/2 h-1/2" />}
            />
            <StatusTag
              size="lg"
              variant="blocked"
              tabLabel="Bloqueada"
              title="Dependência Externa"
              icon={<IconLock aria-hidden className="w-1/2 h-1/2" />}
            />
            <StatusTag
              size="lg"
              variant="complete"
              tabLabel="Concluída"
              title="Finalizada com Sucesso"
              icon={<IconShieldCheck aria-hidden className="w-1/2 h-1/2" />}
            />
          </div>
        </section>

        {/* --- TAMANHO MEDIUM (Tamanho Padrão MD) --- */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
            Tamanho: Medium (md) - Padrão
          </h2>
          <div className="flex flex-wrap gap-6 items-end">
            <StatusTag
              size="md"
              variant="draft"
              title="Ajustar Contrato"
              tabLabel="Draft"
            />
            <StatusTag
              size="md"
              variant="approval"
              title="Nota Fiscal"
              tabLabel="Approval"
            />
            <StatusTag
              size="md"
              variant="inProgress"
              title="Fechamento do Mês"
              tabLabel="In Progress"
            />
            <StatusTag
              size="md"
              variant="inReview"
              title="Auditoria"
              tabLabel="In Review"
            />
            <StatusTag
              size="md"
              variant="rejected"
              title="NF Recusada"
              tabLabel="Rejected"
            />
            <StatusTag
              size="md"
              variant="readyForDev"
              title="Homologação"
              tabLabel="Ready"
            />
            <StatusTag
              size="md"
              variant="blocked"
              title="Falta Assinatura"
              tabLabel="Blocked"
            />
            <StatusTag
              size="md"
              variant="complete"
              title="Pagamento Efetuado"
              tabLabel="Complete"
            />
          </div>
        </section>

        {/* --- TAMANHO SMALL (SM) --- */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
            Tamanho: Small (sm) - Compacto
          </h2>
          <div className="flex flex-wrap gap-4 items-end">
            <StatusTag
              size="sm"
              variant="draft"
              title="DOC001"
              tabLabel="Rascunho"
            />
            <StatusTag
              size="sm"
              variant="approval"
              title="DOC002"
              tabLabel="Aprovação"
            />
            <StatusTag
              size="sm"
              variant="inProgress"
              title="DOC003"
              tabLabel="Em Progresso"
            />
            <StatusTag
              size="sm"
              variant="inReview"
              title="DOC004"
              tabLabel="Revisão"
            />
            <StatusTag
              size="sm"
              variant="rejected"
              title="DOC005"
              tabLabel="Rejeitado"
            />
            <StatusTag
              size="sm"
              variant="readyForDev"
              title="DOC006"
              tabLabel="Pronto"
            />
            <StatusTag
              size="sm"
              variant="blocked"
              title="DOC007"
              tabLabel="Bloqueado"
            />
            <StatusTag
              size="sm"
              variant="complete"
              title="DOC008"
              tabLabel="Concluído"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
