'use client'

// Configuração do acompanhamento comercial (área 13, 27/10/2026): os três
// modelos de mensagem do WhatsApp e do e-mail, o e-mail diário ao vendedor
// e os dias para o cliente contar como sem compra. O caminho da venda não
// fica aqui: é da série.

import { InfoHint } from '@/components/common/InfoHint'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'

import {
  getFollowUpSettings,
  updateFollowUpSettings,
} from '@/actions/follow-up'
import { FOLLOW_UP_SETTINGS_KEY } from '@/hooks/queries/useFollowUp'
import { DEFAULT_TEMPLATES, fillTemplate, TEMPLATE_VARS } from '@/lib/whatsapp'
import type { FollowUpSettings } from '@/types/sales/followUp'

const templates: {
  key: 'templateProposalSent' | 'templateValidity' | 'templateResume'
  title: string
  help: string
}[] = [
  {
    key: 'templateProposalSent',
    title: 'Proposta enviada',
    help: 'Quando a proposta vai ao cliente.',
  },
  {
    key: 'templateValidity',
    title: 'Lembrete de validade',
    help: 'Quando a proposta está vencendo (usado pelo WhatsApp na aba Aguardando).',
  },
  {
    key: 'templateResume',
    title: 'Retomada',
    help: 'Quando o vendedor volta a falar com o cliente.',
  },
]

const sample = {
  cliente: 'Maria',
  numero: '128-V1',
  valor: 'R$ 350,00',
  validade: '30/10/2026',
  vendedor: 'João',
  empresa: 'Gráfica Exemplo',
}

export function FollowUpSettingsForm() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: [FOLLOW_UP_SETTINGS_KEY],
    queryFn: () => getFollowUpSettings(),
    staleTime: Infinity,
  })
  const settings = data?.success ? data.data : null

  // Sem a configuração na API, a tela mostra os modelos padrão
  const [values, setValues] = useState<FollowUpSettings>({
    ...DEFAULT_TEMPLATES,
    dailyEmail: false,
    dailyEmailHour: 8,
    inactiveDays: 90,
  })

  useEffect(() => {
    if (settings) setValues(settings)
  }, [settings])

  const set = <K extends keyof FollowUpSettings>(
    key: K,
    value: FollowUpSettings[K],
  ) => setValues((current) => ({ ...current, [key]: value }))

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateFollowUpSettings(values),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)
      toast.success('Acompanhamento atualizado')
      queryClient.invalidateQueries({ queryKey: [FOLLOW_UP_SETTINGS_KEY] })
    },
    onError: () => toast.error('Erro ao salvar'),
  })

  const topbar = (
    <Topbar
      title="Acompanhamento comercial"
      previousPage="/configuracoes/vendas"
      supportText="Modelos de mensagem, lembrete por e-mail e clientes sem compra"
    />
  )

  if (isLoading) {
    return (
      <div className="space-y-5">
        {topbar}
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {topbar}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Modelos de mensagem</CardTitle>
            <InfoHint title="Modelos de mensagem">
              <p>
                O botão &quot;Chamar no WhatsApp&quot; e o e-mail de
                acompanhamento usam estes textos.
              </p>
              <p>
                O que está entre chaves o sistema troca pelo dado do orçamento
                na hora de enviar.
              </p>
            </InfoHint>
          </div>
          <CardDescription>
            Entre chaves, o que o sistema preenche:{' '}
            {TEMPLATE_VARS.map((item) => `{${item.key}}`).join(' ')}.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-6">
          {templates.map((template) => (
            <div key={template.key} className="space-y-2">
              <div>
                <p className="text-sm font-medium">{template.title}</p>
                <p className="text-sm text-gray">{template.help}</p>
              </div>
              <Textarea
                rows={3}
                value={values[template.key]}
                onChange={(event) => set(template.key, event.target.value)}
              />
              <p className="text-xs text-gray-500">
                Exemplo: {fillTemplate(values[template.key] || '', sample)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Lembrete por e-mail</CardTitle>
            <InfoHint title="Lembrete por e-mail">
              <p>
                Todo dia, na hora escolhida, cada vendedor recebe a lista dos
                orçamentos para retomar: contato marcado para hoje, atrasado ou
                proposta vencendo. Só quem tem e-mail no cadastro recebe.
              </p>
            </InfoHint>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <p className="font-medium">Enviar o e-mail diário</p>
            <PermissionGate permissions={['sales_settings:series:edit']}>
              <Switch
                checked={values.dailyEmail}
                onCheckedChange={(checked) => set('dailyEmail', checked)}
                aria-label="Enviar o e-mail diário"
              />
            </PermissionGate>
          </div>
          {values.dailyEmail && (
            <div className="w-full max-w-[200px] space-y-1.5">
              <label htmlFor="daily-hour" className="text-sm font-medium">
                Hora do envio
              </label>
              <Input
                id="daily-hour"
                type="number"
                min={0}
                max={23}
                endAdornment={<span className="text-sm">h</span>}
                value={values.dailyEmailHour}
                onChange={(event) =>
                  set('dailyEmailHour', Number(event.target.value) || 0)
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Cliente sem compra</CardTitle>
            <InfoHint title="Cliente sem compra">
              <p>
                Quantos dias sem comprar para o cliente entrar no relatório
                &quot;Clientes sem compra&quot;, em Relatórios › Vendas.
              </p>
            </InfoHint>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="w-full max-w-[200px] space-y-1.5">
            <label htmlFor="inactive-days" className="text-sm font-medium">
              Dias sem compra
            </label>
            <Input
              id="inactive-days"
              type="number"
              min={7}
              max={730}
              endAdornment={<span className="text-sm">dias</span>}
              value={values.inactiveDays}
              onChange={(event) =>
                set('inactiveDays', Number(event.target.value) || 0)
              }
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <PermissionGate permissions={['sales_settings:series:edit']}>
            <Button isLoading={isPending} onClick={() => save()}>
              Salvar
            </Button>
          </PermissionGate>
        </CardFooter>
      </Card>
    </div>
  )
}
