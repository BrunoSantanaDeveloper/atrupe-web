/**
 * Configuração centralizada de rotas do middleware.
 * Extraído do middleware.ts para facilitar manutenção e testes.
 */

/** Rotas acessíveis sem autenticação */
export const GUEST_ROUTES = [
  'login',
  'cadastro',
  'cadastro/inicio',
  'cadastro/verificar-email',
  'cadastro/nova-senha',
  'validar-cadastro',
  'termos-de-uso',
  'aviso-de-privacidade',
  'esqueci-minha-senha',
  'esqueci-minha-senha/email-enviado',
  'redefinir-senha',
  'redefinindo-senha',
] as const

/**
 * Rotas compartilhadas (acessíveis por todos, com ou sem sessão). O convite de
 * transferência é aberto por quem ainda não tem conta.
 */
export const SHARED_ROUTES = [
  'shared-route',
  'convite-de-transferencia',
] as const

/** Rotas permitidas quando a empresa está bloqueada (FULL ou PARTIAL) */
export const ALLOWED_WHEN_BLOCKED = [
  '/logout',
  '/blocked',
  '/assinatura',
] as const

/** Rotas permitidas em modo PARTIAL (empresa com restrições parciais) */
export const ALLOWED_WHEN_PARTIAL = [
  '/dashboard',
  '/perfil',
  '/assinatura',
  '/blocked',
  '/logout',
  '/admin',
] as const

/** Rotas permitidas quando o trial expirou */
export const ALLOWED_WHEN_TRIAL_EXPIRED = ['/logout', '/assinatura'] as const

/**
 * Rotas de demonstração: as telas novas que só existem sobre dados de exemplo
 * (as actions PROVISÓRIO de src/actions). Sem a flag de demonstração
 * (src/lib/demo.ts), o middleware responde "página não encontrada" para elas
 * e para as subpáginas. Um segmento entre colchetes vale qualquer valor. A
 * rota sai da lista quando a API dela estiver publicada. O /sandbox (as
 * vitrines) também está aqui: o notFound() do layout dele, sozinho, mostrava a
 * página de não encontrada com status 200 e às vezes quebrava no navegador.
 */
export const DEMO_ROUTES = [
  '/base-de-custos',
  '/precificacao',
  '/estoque',
  '/producao/gerenciador',
  '/producao/projetos',
  '/producao/produtividade',
  '/configuracoes/producao',
  '/configuracoes/empresa-e-sistema/patrimonios',
  '/configuracoes/produtos/processos',
  '/configuracoes/produtos/[id]/composicao',
  '/configuracoes/vendas/terceirizados',
  '/configuracoes/vendas/venda-rapida',
  '/vendas/orcamentos/[quotationId]/composicao',
  '/vendas/orcamentos/[quotationId]/resultado',
  '/sandbox',
] as const

/** O caminho é uma rota de demonstração ou uma subpágina dela */
export const isDemoRoute = (pathname: string) => {
  const path = pathname.split('/')

  return DEMO_ROUTES.some((route) =>
    route
      .split('/')
      .every((segment, index) =>
        segment.startsWith('[')
          ? !!path[index]
          : segment === (path[index] ?? null),
      ),
  )
}

/** Páginas de destino */
export const HOME_PAGE = '/dashboard'
export const SYSTEM_HOME_PAGE = '/admin'
export const SUBSCRIPTION_PAGE = '/assinatura'
export const BLOCKED_PAGE = '/blocked'
export const PARTIAL_BLOCKED_PAGE = '/blocked?level=partial'
