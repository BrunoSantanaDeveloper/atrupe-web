'use client'

// Tela "Conectar WhatsApp": o cliente escolhe a API oficial (credenciais da Meta) ou a conexão
// não oficial (QR do WhatsApp Web, depois de ler o aviso de risco). Os passos vêm de base/ui/connect.mjs.
// Com o número já ligado, mostra o que a conferência viu e retoma a mesma caixa quando ele para: o QR de
// novo na não oficial, o token novo na oficial. Com o número oficial e o do WhatsApp Web ao mesmo tempo,
// mostra um bloco por canal, e um deles pode deixar de ser usado.

import { useEffect, useReducer, useState } from 'react'

import {
  connectReducer,
  initialConnectState,
  OFFICIAL_FIELDS,
  pollingDelay,
  UNOFFICIAL_RISK,
  validateOfficial,
} from '@/lib/atendimento-kit/ui/connect.mjs'
import {
  supportApi,
  type WhatsappChannel,
  type WhatsappStatus,
} from '@/lib/atendimento-kit/ui/client.mjs'
import {
  Alert,
  Button,
  Card,
  Choice,
  Loading,
  Stack,
  Text,
  TextField,
  Toggle,
} from './primitives'

const api = supportApi()

const SEM_LEITURA: WhatsappStatus = {
  connected: false,
  route: null,
  status: null,
  qrCode: null,
  level: null,
  findings: [],
}

/** 554792621081 vira +55 47 9262-1081; o que não for número do Brasil fica como veio. */
function numeroLegivel(phone: string) {
  const d = phone.replace(/\D/g, '')
  if (!d.startsWith('55') || (d.length !== 12 && d.length !== 13)) return phone
  const local = d.slice(4)
  return `+55 ${d.slice(2, 4)} ${local.slice(0, -4)}-${local.slice(-4)}`
}

function Achados({ itens }: { itens: WhatsappStatus['findings'] }) {
  return (
    <Stack gap={8}>
      {itens.map((item) => (
        <Text key={item.code}>
          {item.detail} {item.fix}
        </Text>
      ))}
    </Stack>
  )
}

export function ConectarWhatsApp({
  permitirNaoOficial = true,
}: {
  permitirNaoOficial?: boolean
}) {
  const [state, dispatch] = useReducer(connectReducer, initialConnectState)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [problemas, setProblemas] = useState<Record<string, string>>({})
  const [situacao, setSituacao] = useState<WhatsappStatus | null>(null)
  const [outroNumero, setOutroNumero] = useState(false)
  const [confirmar, setConfirmar] = useState<WhatsappChannel['route'] | null>(
    null,
  )
  const noInicio = state.step === 'escolher'

  useEffect(() => {
    if (!noInicio) return
    api
      .whatsappStatus()
      .then(setSituacao)
      .catch(() => setSituacao(SEM_LEITURA))
  }, [noInicio])

  useEffect(() => {
    const delay = pollingDelay(state.step)
    if (!delay) return
    const timer = setInterval(async () => {
      try {
        const status = await api.whatsappStatus()
        // O QR é sempre do WhatsApp Web. Com o oficial ligado depois dele, os
        // campos de cima são do oficial e a tela ficaria esperando para sempre.
        const web =
          status.channels?.find((canal) => canal.route === 'nao_oficial') ??
          status
        dispatch({
          type: 'estado',
          status: web.status ?? 'unknown',
          qrCode: web.qrCode,
        })
      } catch (error) {
        dispatch({ type: 'erro', message: (error as Error).message })
      }
    }, delay)
    return () => clearInterval(timer)
  }, [state.step])

  async function enviarOficial() {
    const encontrados = validateOfficial(valores)
    setProblemas(encontrados)
    if (Object.keys(encontrados).length) return
    dispatch({ type: 'enviar' })
    try {
      const { metaWebhook } = await api.connectOfficial(valores)
      dispatch({ type: 'conectou_oficial', metaWebhook })
    } catch (error) {
      dispatch({ type: 'erro', message: (error as Error).message })
    }
  }

  async function criarSessao() {
    dispatch({ type: 'enviar' })
    try {
      await api.connectUnofficial()
      dispatch({ type: 'criou_sessao' })
    } catch (error) {
      dispatch({ type: 'erro', message: (error as Error).message })
    }
  }

  async function lerQrDeNovo() {
    dispatch({ type: 'enviar' })
    try {
      await api.reconnect()
      dispatch({ type: 'criou_sessao' })
    } catch (error) {
      dispatch({ type: 'erro', message: (error as Error).message })
    }
  }

  async function deixarDeUsar(route: WhatsappChannel['route']) {
    setConfirmar(null)
    try {
      await api.retireRoute(route)
      setSituacao(await api.whatsappStatus())
    } catch (error) {
      dispatch({ type: 'erro', message: (error as Error).message })
    }
  }

  if (situacao === null) return <Loading />
  // Um bloco por canal: o número oficial e o do WhatsApp Web podem estar de pé
  // ao mesmo tempo.
  const canais: WhatsappChannel[] =
    situacao.channels ??
    (situacao.route
      ? [{ ...situacao, route: situacao.route, inbox_id: 0, phone: null }]
      : [])
  if (noInicio && canais.length && !outroNumero) {
    return (
      <Stack>
        {canais.map((canal) => {
          const ok =
            canal.connected &&
            canal.level !== 'fora' &&
            canal.level !== 'atencao'
          const parou = canal.level === 'fora' || !canal.connected
          const forma =
            canal.route === 'oficial' ? 'API oficial' : 'WhatsApp Web'
          return (
            <Card
              key={canal.route}
              title={
                ok
                  ? 'WhatsApp conectado'
                  : parou
                    ? 'O WhatsApp do atendimento parou'
                    : 'O WhatsApp do atendimento pede atenção'
              }
            >
              <Stack>
                <Text tone="muted">
                  {canal.phone
                    ? `${forma}, ${numeroLegivel(canal.phone)}`
                    : forma}
                </Text>
                {ok ? (
                  <Text>
                    As conversas deste número chegam no painel de atendimento.
                  </Text>
                ) : null}
                {canal.findings.length ? (
                  <Alert tone={!ok && parou ? 'danger' : 'warning'}>
                    <Achados itens={canal.findings} />
                  </Alert>
                ) : null}
                {ok && canal.route === 'nao_oficial' ? (
                  <Text tone="muted">
                    Conectado pelo WhatsApp Web: deixe o celular do número
                    ligado e com internet.
                  </Text>
                ) : null}
                <Stack direction="row" gap={8}>
                  {!ok && canal.route === 'nao_oficial' ? (
                    <Button onClick={lerQrDeNovo}>Ler o QR de novo</Button>
                  ) : null}
                  {!ok && canal.route === 'oficial' ? (
                    <Button
                      onClick={() =>
                        dispatch({ type: 'escolher_rota', route: 'oficial' })
                      }
                    >
                      Trocar o token da Meta
                    </Button>
                  ) : null}
                  {canais.length > 1 && confirmar !== canal.route ? (
                    <Button
                      variant="secondary"
                      onClick={() => setConfirmar(canal.route)}
                    >
                      Deixar de usar este número
                    </Button>
                  ) : null}
                </Stack>
                {confirmar === canal.route ? (
                  <Alert tone="warning">
                    <Stack gap={8}>
                      <Text>
                        O número sai desta tela e da conferência. As conversas
                        dele continuam no painel de atendimento.
                      </Text>
                      <Stack direction="row" gap={8}>
                        <Button onClick={() => deixarDeUsar(canal.route)}>
                          Deixar de usar
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setConfirmar(null)}
                        >
                          Voltar
                        </Button>
                      </Stack>
                    </Stack>
                  </Alert>
                ) : null}
              </Stack>
            </Card>
          )
        })}
        <Text tone="muted">
          {canais.length > 1
            ? 'Para trocar um dos números, conecte outro número na mesma forma de conexão: ele toma o lugar do anterior. '
            : 'Dá para ter também um número na outra forma de conexão, os dois ao mesmo tempo. Na mesma forma, o número novo toma o lugar do atual. '}
          Cada número é conferido a cada 15 minutos, e os superadmins recebem um
          e-mail se ele parar.
        </Text>
        <div>
          <Button variant="secondary" onClick={() => setOutroNumero(true)}>
            Conectar outro número
          </Button>
        </div>
      </Stack>
    )
  }

  return (
    <Card title="Conectar WhatsApp">
      <Stack>
        {state.step === 'escolher' ? (
          <Choice
            label="Como conectar o número"
            value={'' as 'oficial' | 'nao_oficial'}
            onChange={(route) => dispatch({ type: 'escolher_rota', route })}
            options={[
              {
                value: 'oficial',
                label: 'API oficial do WhatsApp (recomendado)',
                hint: 'Pela Meta, com o número verificado. Sem risco de banimento por uso da API.',
              },
              ...(permitirNaoOficial
                ? [
                    {
                      value: 'nao_oficial' as const,
                      label: 'Conexão pelo WhatsApp Web (não oficial)',
                      hint: 'Lê um QR no celular, como um aparelho conectado. Tem risco de banimento.',
                    },
                  ]
                : []),
            ]}
          />
        ) : null}
        {state.step === 'escolher' && canais.length ? (
          <div>
            <Button variant="secondary" onClick={() => setOutroNumero(false)}>
              Voltar aos números conectados
            </Button>
          </div>
        ) : null}

        {state.step === 'formulario_oficial' ? (
          <Stack>
            {OFFICIAL_FIELDS.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                hint={field.hint}
                secret={field.secret}
                value={valores[field.name] ?? ''}
                error={problemas[field.name]}
                onChange={(value) =>
                  setValores({ ...valores, [field.name]: value })
                }
              />
            ))}
            <Stack direction="row" gap={8}>
              <Button onClick={enviarOficial}>Conectar</Button>
              <Button
                variant="secondary"
                onClick={() => dispatch({ type: 'voltar' })}
              >
                Voltar
              </Button>
            </Stack>
          </Stack>
        ) : null}

        {state.step === 'configurar_meta' ? (
          <Alert tone="success">
            <Stack gap={8}>
              <Text>
                Falta um passo no app da Meta: em WhatsApp, Configuração,
                cadastre o retorno abaixo e assine o campo messages.
              </Text>
              <Text>
                URL de retorno:{' '}
                {state.metaWebhook?.callbackUrl ??
                  'veja na caixa do painel de atendimento'}
              </Text>
              <Text>
                Token de verificação:{' '}
                {state.metaWebhook?.verifyToken ??
                  'veja na caixa do painel de atendimento'}
              </Text>
            </Stack>
          </Alert>
        ) : null}

        {state.step === 'aviso_nao_oficial' ||
        state.step === 'pronto_para_criar' ? (
          <Stack>
            <Alert tone="warning">
              <Stack gap={8}>
                {UNOFFICIAL_RISK.map((line) => (
                  <Text key={line}>{line}</Text>
                ))}
              </Stack>
            </Alert>
            <Toggle
              label="Li e entendi os riscos"
              checked={state.accepted}
              onChange={(checked) =>
                checked && dispatch({ type: 'aceitar_risco' })
              }
            />
            <Stack direction="row" gap={8}>
              <Button disabled={!state.accepted} onClick={criarSessao}>
                Gerar QR
              </Button>
              <Button
                variant="secondary"
                onClick={() => dispatch({ type: 'voltar' })}
              >
                Voltar
              </Button>
            </Stack>
          </Stack>
        ) : null}

        {state.step === 'conectando' || state.step === 'aguardando_qr' ? (
          <Loading label="Preparando a conexão" />
        ) : null}

        {state.step === 'mostrar_qr' && state.qrCode ? (
          <Stack>
            <Text>
              No celular do número, abra o WhatsApp, vá em Aparelhos conectados,
              toque em Conectar um aparelho e leia o QR.
            </Text>
            <img
              src={state.qrCode}
              alt="QR para conectar o WhatsApp"
              width={264}
              height={264}
            />
          </Stack>
        ) : null}

        {state.step === 'conectado' ? (
          <Alert tone="success">
            WhatsApp conectado. As conversas chegam no painel de atendimento.
          </Alert>
        ) : null}

        {state.step === 'erro' ? (
          <Stack>
            <Alert tone="danger">{state.error}</Alert>
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: 'voltar' })}
            >
              Começar de novo
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  )
}
