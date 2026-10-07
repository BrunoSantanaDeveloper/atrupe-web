# Evidência renderizada — auditoria de UI (antes)

Capturas de 57 rotas estáticas da área autenticada, 1440×900, conta de teste,
tema claro, pela ferramenta descrita em `../openspec/design/sistema-visual.md` §6.
Rotas de `/admin` (404 para a conta de teste) e rotas cujo carregamento não
estabilizou em 90 s (consultas em polling contínuo) ficaram de fora; a
leitura de código cobre essas.

## Agregado

| Métrica | Valor |
|---|---|
| Tamanhos de fonte dos textos visíveis | 14 px = 49,7 % · 12 px = 40,1 % · 18 px = 3,6 % · 16 px = 3,5 % · 20 px = 2,4 % · 24 px = 0,6 % · 10 px = 0,1 % |
| Rotas sem `h1` | 6 (/configuracoes, /configuracoes/producao, /configuracoes/vendas/venda-rapida, /dashboard, /estoque, /nota-fiscal/emitir) |
| Botões visíveis sem nome acessível (soma) | 140 |
| Elementos com `title` nativo (soma) | 28 |
| Altura das linhas de tabela (linhas medidas) | 57 px × 126 · 73 px × 43 · 65 px × 9 · 43 px × 9 · 49 px × 8 · 53 px × 7 · outras 13 |
| Botões com o mesmo texto repetidos ≥ 3× na mesma rota | origens de contato "Editar" ×11 e "Excluir" ×11; ordens de serviço "Via do cliente", "Ficha de produção", "Duplicar orçamento", "Histórico", "Cancelar venda" ×10 cada; motivos "Editar motivo" e "Excluir" ×4 |

## Por rota

| Rota | h1 | Tamanhos (px:ocorrências) | Botões | Sem nome | title | Linhas | Altura | Repetidos |
|---|---|---|---|---|---|---|---|---|
| /base-de-custos | Base de custos | 14:16 12:11 18:2 20:1 | 11 | 2 | 1 | 0 | — | — |
| /base-de-custos/despesas-administrativas | Base de custos | 14:16 12:11 18:2 20:1 | 11 | 2 | 1 | 8 | 57 | — |
| /base-de-custos/distribuicao | Base de custos | 14:17 12:11 18:2 20:1 16:1 | 11 | 2 | 1 | 8 | 57 | — |
| /base-de-custos/mao-de-obra | Base de custos | 14:65 12:17 18:2 20:1 16:1 | 28 | 2 | 1 | 8 | 73 | — |
| /base-de-custos/patrimonios | Base de custos | 14:21 12:15 18:2 20:1 16:1 | 11 | 2 | 1 | 8 | 57 | — |
| /base-de-custos/por-setor | Base de custos | 14:17 12:11 18:2 20:1 16:1 | 11 | 2 | 1 | 8 | 57 | — |
| /base-de-custos/resumo | Base de custos | 14:16 12:11 18:2 20:1 | 12 | 2 | 1 | 0 | — | — |
| /cadastros/clientes | Clientes | 12:14 14:14 20:1 18:1 | 14 | 3 | 0 | 0 | — | [sem texto]×3 |
| /cadastros/clientes/categorias | Grupos de clientes | 12:14 14:10 20:1 18:1 | 13 | 2 | 0 | 10 | 57 | — |
| /cadastros/fornecedores | Fornecedores | 14:46 12:27 20:1 18:1 16:1 | 24 | 11 | 1 | 7 | 73 | [sem texto]×11 |
| /cadastros/fornecedores/categorias | Grupos de fornecedores | 12:14 14:10 20:1 18:1 | 13 | 2 | 0 | 10 | 57 | — |
| /configuracoes | — | 12:14 14:9 20:1 | 12 | 2 | 0 | 0 | — | — |
| /configuracoes/empresa-e-sistema | Empresa e sistema | 14:21 12:14 16:6 20:1 18:1 | 14 | 2 | 0 | 0 | — | — |
| /configuracoes/empresa-e-sistema/assinatura | Assinatura | 12:14 14:9 20:1 18:1 | 11 | 2 | 0 | 0 | — | — |
| /configuracoes/empresa-e-sistema/colaboradores-e-usuarios | Colaboradores e usuários | 12:14 14:14 20:1 18:1 | 12 | 2 | 0 | 0 | — | — |
| /configuracoes/empresa-e-sistema/patrimonios | Patrimônios | 12:14 14:11 18:2 20:1 | 12 | 2 | 1 | 8 | 57 | — |
| /configuracoes/financeiro/configuracoes-de-pagamento/condicoes-de-pagamento | Condições de pagamento | 12:14 14:12 20:1 18:1 16:1 | 12 | 2 | 0 | 10 | 57 | — |
| /configuracoes/financeiro/contas-bancarias | Contas bancárias | 12:14 14:10 18:2 20:1 | 14 | 2 | 1 | 0 | — | — |
| /configuracoes/financeiro/folhas-de-pagamento | Folha de pagamento | 12:14 14:11 20:1 18:1 | 14 | 2 | 1 | 0 | — | — |
| /configuracoes/financeiro/plano-de-contas | Plano de contas | 12:14 14:12 20:1 18:1 | 12 | 2 | 0 | 0 | — | — |
| /configuracoes/nota-fiscal | Configurações Fiscais | 12:14 14:13 16:2 20:1 18:1 | 12 | 2 | 0 | 0 | — | — |
| /configuracoes/nota-fiscal/cfop | Natureza de operação e CFOP | 12:22 14:14 16:13 18:4 20:1 | 19 | 6 | 0 | 4 | 65 | [sem texto]×6 |
| /configuracoes/nota-fiscal/emissores | Emissores de nota fiscal | 12:14 14:9 20:1 18:1 16:1 | 12 | 2 | 0 | 0 | — | — |
| /configuracoes/producao | — | 12:14 14:9 20:1 | 11 | 2 | 0 | 0 | — | — |
| /configuracoes/produtos/grupo-de-produtos | Grupos de produtos | 12:14 14:12 20:1 18:1 | 12 | 2 | 0 | 0 | — | — |
| /configuracoes/produtos/materiais | Materiais | 14:15 12:14 18:2 20:1 10:1 | 13 | 2 | 1 | 8 | 57 | — |
| /configuracoes/produtos/processos | Processos | 12:14 14:12 18:2 20:1 | 13 | 2 | 1 | 6 | 57 | — |
| /configuracoes/vendas | Vendas | 14:21 12:14 16:6 20:1 18:1 | 12 | 2 | 0 | 0 | — | — |
| /configuracoes/vendas/motivos-de-rejeicao-e-cancelamento | Motivos de rejeição e cancelamento | 12:17 14:15 20:1 18:1 16:1 | 22 | 2 | 0 | 6 | 41/73 | [aria] Editar motivo×4; [aria] Excluir×4 |
| /configuracoes/vendas/origens-de-contato | Origens de contato | 14:21 12:16 20:1 18:1 | 35 | 2 | 0 | 12 | 27/73 | [aria] Editar×11; [aria] Excluir×11 |
| /configuracoes/vendas/perfil-de-vendedor | Perfil de vendedor | 12:14 14:10 20:1 18:1 | 13 | 2 | 0 | 10 | 57 | — |
| /configuracoes/vendas/series-de-venda | Série de vendas | 12:14 14:10 20:1 18:1 | 12 | 2 | 0 | 0 | — | — |
| /configuracoes/vendas/status-de-orcamento | Status de orçamento | 12:14 14:10 20:1 18:1 | 12 | 2 | 0 | 10 | 57 | — |
| /configuracoes/vendas/venda-rapida | — | 12:14 14:9 20:1 | 11 | 2 | 0 | 0 | — | — |
| /dashboard | — | 12:12 14:12 16:6 20:1 | 15 | 2 | 0 | 0 | — | — |
| /estoque | — | 14:10 12:9 20:1 18:1 16:1 | 11 | 2 | 0 | 0 | — | — |
| /financeiro/folha-de-pagamento | Folha de pagamento | 12:16 14:15 20:1 18:1 16:1 | 16 | 2 | 1 | 10 | 57 | — |
| /financeiro/frente-de-caixa | Frente de caixa | 14:40 12:27 18:2 20:1 | 24 | 2 | 1 | 4 | 73/99/119 | — |
| /nota-fiscal/emitir | — | 14:10 12:9 20:1 | 11 | 2 | 0 | 0 | — | — |
| /precificacao | Precificação | 14:14 12:9 18:2 20:1 | 11 | 2 | 1 | 0 | — | — |
| /precificacao/mao-de-obra | Precificação | 14:50 12:23 18:2 20:1 16:1 | 18 | 2 | 1 | 3 | 73/91 | — |
| /precificacao/maquinas | Precificação | 14:20 12:9 18:2 20:1 16:1 | 11 | 2 | 1 | 6 | 57 | — |
| /precificacao/materiais | Precificação | 14:20 12:9 18:2 20:1 16:1 | 11 | 2 | 1 | 6 | 57 | — |
| /precificacao/produtos | Precificação | 14:50 12:23 18:2 20:1 16:1 | 18 | 2 | 1 | 3 | 91/93 | — |
| /precificacao/resumo | Precificação | 14:55 12:38 24:9 18:2 16:2 20:1 | 12 | 2 | 1 | 0 | — | — |
| /producao/agenda-de-entrega | Agenda de entrega | 14:16 12:13 20:1 18:1 10:1 | 12 | 2 | 1 | 0 | — | — |
| /producao/gerenciador | Gerenciador de produção | 14:31 12:26 24:4 18:2 20:1 16:1 | 21 | 2 | 1 | 0 | — | — |
| /producao/produtividade | Produtividade | 14:47 12:23 18:2 16:2 20:1 | 12 | 2 | 1 | 7 | 53 | — |
| /producao/projetos | Projetos | 14:27 12:25 18:2 20:1 | 12 | 2 | 1 | 2 | 79 | — |
| /relatorios/comissoes | Comissões | 12:21 14:20 16:5 20:1 18:1 | 19 | 3 | 0 | 5 | 65 | [sem texto]×3 |
| /relatorios/dfc | Relatório DFC | 12:15 14:14 16:3 20:1 18:1 | 16 | 3 | 0 | 8 | 49 | [sem texto]×3 |
| /relatorios/financeiro | Financeiro | 14:23 12:19 18:5 16:4 20:1 | 21 | 3 | 0 | 0 | — | [sem texto]×3 |
| /relatorios/projecao-de-caixa | Projeção de caixa | 12:22 14:19 18:4 16:3 20:1 | 18 | 3 | 0 | 1 | 85 | [sem texto]×3 |
| /relatorios/resultado-por-setor | Resultados por setor | 12:15 14:13 18:2 16:2 20:1 | 15 | 3 | 0 | 0 | — | [sem texto]×3 |
| /relatorios/vendas | Relatório de vendas | 14:35 12:30 16:8 20:1 18:1 | 26 | 5 | 2 | 0 | — | [sem texto]×5 |
| /vendas/orcamentos | Orçamentos | 14:19 12:12 20:1 18:1 16:1 | 16 | 4 | 0 | 0 | — | [sem texto]×4 |
| /vendas/ordens-de-servico | Ordens de serviço | 14:63 12:38 16:4 20:1 18:1 | 68 | 4 | 1 | 19 | 43/73 | [aria] Via do cliente×10; [aria] Ficha de produção×10; [aria] Duplicar orçamento×10; [aria] Histórico×10; [aria] Cancelar venda×10; [sem texto]×4 |
