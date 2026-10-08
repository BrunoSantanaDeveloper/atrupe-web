'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

// UI
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icons
import { IconAlertTriangle, IconChevronRight } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Actions
import { getItem } from '@/actions/_cruds'

interface Pendencia {
  campo: string
  gravidade: 'bloqueia' | 'atencao'
  mensagem: string
  valorAtual?: string | null
}

interface ItemPendente {
  produtoId: string
  nome: string
  codigo?: string | null
  temCadastroFiscal: boolean
  pendencias: Pendencia[]
}

interface PendenciasResponse {
  totalServicos: number
  comPendencia: number
  bloqueiamEmissao: number
  itens: ItemPendente[]
}

const ROTULO_CAMPO: Record<string, string> = {
  codigoServico: 'Código do serviço (LC 116)',
  cnae: 'CNAE',
  aliquotaIss: 'Alíquota ISS',
  nbs: 'NBS',
  codTribNacional: 'Cód. tributação nacional',
}

/**
 * Alerta de serviços com cadastro fiscal incompleto.
 *
 * Fica na listagem de produtos porque é ali que o problema se resolve. Sem
 * código da LC 116, a emissão não falha: ela cai no código padrão do emissor e
 * a nota é autorizada com uma classificação que pode não ser a do serviço — um
 * erro que só aparece numa fiscalização.
 */
export function FiscalPendenciasAlert() {
  const [dados, setDados] = useState<PendenciasResponse | null>(null)
  const [aberto, setAberto] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const resultado = await getItem({
        route: '/fiscal/product/pendencias-fiscais',
      })
      if (resultado.success && resultado.data) {
        setDados(resultado.data as PendenciasResponse)
      }
    } catch {
      // Alerta é complementar: falhar ao carregar não pode atrapalhar a tela.
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  if (!dados || dados.comPendencia === 0) return null

  const bloqueiam = dados.bloqueiamEmissao
  const severo = bloqueiam > 0

  return (
    <>
      <div
        className={
          severo
            ? 'flex items-center gap-3 rounded-lg border border-error-200 bg-error-50 p-3'
            : 'flex items-center gap-3 rounded-lg border border-warning-200 bg-warning-50 p-3'
        }
      >
        <FeaturedIcon
          variant={severo ? 'errorLight' : 'warningLight'}
          Icon={IconAlertTriangle}
        />
        <div className="flex-1">
          <p
            className={
              severo
                ? 'text-sm font-semibold text-error-700'
                : 'text-sm font-semibold text-warning-800'
            }
          >
            {severo
              ? `${bloqueiam} ${bloqueiam === 1 ? 'serviço sai' : 'serviços saem'} com classificação fiscal incorreta na nota`
              : `${dados.comPendencia} ${dados.comPendencia === 1 ? 'serviço tem' : 'serviços têm'} cadastro fiscal incompleto`}
          </p>
          <p
            className={
              severo ? 'text-xs text-error-600' : 'text-xs text-warning-700'
            }
          >
            {severo
              ? 'Sem o código da LC 116 a nota usa o código padrão do emissor, que pode não corresponder ao serviço.'
              : 'Campos que a Reforma Tributária vai exigir do Simples Nacional a partir de 01/01/2027.'}
          </p>
        </div>
        <Button
          variant="neutralOutline"
          size="sm"
          onClick={() => setAberto(true)}
        >
          Ver serviços
        </Button>
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon
                  variant={severo ? 'errorLight' : 'warningLight'}
                  Icon={IconAlertTriangle}
                />
                <div>
                  <span>Pendências fiscais dos serviços</span>
                  <p className="text-sm font-normal text-gray-500">
                    {dados.comPendencia} de {dados.totalServicos}{' '}
                    {dados.totalServicos === 1 ? 'serviço' : 'serviços'}
                  </p>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>

          <DialogBody className="max-h-[60vh] overflow-y-auto space-y-3">
            {dados.itens.map((item) => (
              <div
                key={item.produtoId}
                className="rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.nome}
                    </p>
                    {item.codigo && (
                      <p className="text-xs text-gray-500">
                        Código: {item.codigo}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/configuracoes/produtos?produto=${item.produtoId}`}
                    onClick={() => setAberto(false)}
                  >
                    <Button variant="neutralLight" size="sm">
                      Corrigir
                      <IconChevronRight size={ICON_SIZE.sm} className="ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-2 space-y-1.5">
                  {item.pendencias.map((p) => (
                    <div
                      key={p.campo}
                      className="flex items-start gap-2 text-xs"
                    >
                      <Badge
                        variant={
                          p.gravidade === 'bloqueia'
                            ? 'errorLight'
                            : 'warningLight'
                        }
                        className="shrink-0"
                      >
                        {ROTULO_CAMPO[p.campo] || p.campo}
                      </Badge>
                      <span className="text-gray-600">
                        {p.mensagem}
                        {p.valorAtual ? ` (atual: "${p.valorAtual}")` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  )
}
