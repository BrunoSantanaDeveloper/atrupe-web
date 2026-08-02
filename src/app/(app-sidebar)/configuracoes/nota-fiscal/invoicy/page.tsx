import { redirect } from 'next/navigation'

/**
 * Tela legada de "Configurações Gerais" do Invoicy.
 *
 * Não era linkada em FiscalSettingsClient nem na navegação — só alcançável por
 * URL direta — e estava quebrada: enviava `emitCmun` (ausente do
 * UpdateInvoicyConfigDto, causando erro de whitelist), `cscToken` (rejeitado
 * pelo mapDtoToDb) e `environment`/`ambiente` (silenciosamente descartados,
 * pois ambiente só muda pelo assistente de ativação).
 *
 * Redireciona para a tela de Emissores, que é a fonte de verdade.
 */
export default function InvoicyConfigPage() {
  redirect('/configuracoes/nota-fiscal/emissores')
}
