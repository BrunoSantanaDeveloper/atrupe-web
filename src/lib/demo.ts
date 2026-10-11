// Flag de demonstração (plano de implantação dos planos, 5.4)
//
// As telas novas ainda rodam sobre dados de exemplo em memória: as actions
// marcadas PROVISÓRIO em src/actions. Elas só respondem com a flag ligada,
// NEXT_PUBLIC_DEMO_DATA=on, que vale em local e em homolog. O Next embute as
// variáveis NEXT_PUBLIC_* no build: o build de produção sai sem a flag, e
// nenhuma tela, dado ou ação de demonstração aparece.
//
// A saída é por módulo: quando a API de uma action existir, a guarda dela sai
// junto com o dado de exemplo, a rota sai de DEMO_ROUTES
// (src/config/routes.ts) e o item do menu perde o `demo: true`.
export const DEMO_DATA = process.env.NEXT_PUBLIC_DEMO_DATA === 'on'

export const DEMO_OFF_MESSAGE = 'Recurso em implantação'

// A resposta de uma action de demonstração com a flag desligada, no formato
// das actions: a gravação é recusada, e a leitura de um item só volta nula
export const demoOff = () => ({
  success: false,
  data: null,
  message: DEMO_OFF_MESSAGE,
})
