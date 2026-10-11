// API de mentira para a suíte da fronteira (playwright.fronteira.config.ts).
//
// A suíte roda o build sem a flag de demonstração no próprio runner, sem
// depender de homolog. Sem API, o front encerra a sessão ao primeiro erro de
// conexão e as telas reais não abrem; com esta, toda rota responde 200 com um
// corpo vazio e permissivo. O que a suíte confere não depende de dado real:
// que as telas de demonstração não aparecem, nem no lugar das reais.
import http from 'node:http'

const PORT = Number(process.env.STUB_API_PORT || 9999)

// Os nomes em português são de rotas que a tela lê direto (o aviso de
// pendências fiscais dos serviços, em Produtos, faz `itens.map`): sem eles,
// a tela quebra no navegador e o teste dela não confere nada
const EMPTY = {
  success: true,
  message: '',
  data: [],
  items: [],
  itens: [],
  results: [],
  total: 0,
  count: 0,
  comPendencia: 0,
  totalServicos: 0,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0, lastPage: 1 },
  meta: { page: 1, limit: 10, total: 0, totalPages: 0, lastPage: 1 },
}

const server = http.createServer((req, res) => {
  // O corpo da requisição é descartado
  req.resume()
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(EMPTY))
})

server.listen(PORT, () => {
  console.log(`[fronteira] API de mentira em http://localhost:${PORT}`)
})
