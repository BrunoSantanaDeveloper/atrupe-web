# Guia do backend do Atrupe

Escrito em 08/10/2026 para quem desenvolve o backend e publica o sistema (Bruno, TriboDev). Reúne, num lugar só, o que o backend precisa saber para construir a API das telas novas: como o trabalho chega, em que ordem construir, as regras fixas, a segurança e os planos. Os documentos desta pasta se completam:

| Arquivo | O que é |
|---|---|
| `README.md` | Este guia: fluxo, ordem, regras fixas e como entregar. |
| `contrato-api.md` | O contrato da API, endpoint por endpoint (191 blocos): rota, corpo, resposta, permissão, o que o servidor valida e calcula, e qual dado de exemplo do front ele substitui. |
| `seguranca.md` | Os requisitos de segurança contra cópia da base e do método, traduzidos em requisito técnico. |
| `planos.md` | A matriz de planos: quais chaves de recurso formam START, LITE, PRO, ELITE e FULL. |
| `pendencias.md` | A lista de pendências do backend acumulada pelas rotinas de construção do front, com o que cada tela precisa. |

Os IDs entre parênteses nos documentos (SEG-1, BC-8, ORC-7, GP-28…) são referências à documentação interna de regras da Atrupe. O que o backend precisa de cada regra está escrito nos próprios documentos; não é preciso ter acesso às regras para construir.

## 1. Como o trabalho chega

1. **Desenvolvimento do front** acontece em `Atrupe-Sistemas/atrupe-front`, em branches de trabalho, pelo Maicol e pela Materialize.
2. **O Maicol aprova** pelo resultado das telas.
3. **Você integra:** traz o branch aprovado para o repositório de produção, junta em `dev` e publica em **homologação**.
4. **Testes** na homologação.
5. **Produção:** com os testes aprovados, de `dev` para `main`.

Você continua sendo quem liga os pontos e publica. O Maicol não revisa pull request nem publica.

**Os pull requests abertos hoje** formam uma cadeia, do mais antigo ao mais novo; cada um tem a descrição do que entra e o roteiro de teste:

| PR | De → para | O que traz |
|---|---|---|
| #1 | `revisao-layout-2026-10-03` → `orcamento-fluxo-2026-10-01` | revisão de layout |
| #5 | `integracao-2026-10-07` → `revisao-layout-2026-10-03` | processos, orçamento e gerenciador de produção juntos |
| #6 | `rateio-manual-2026-10-07` → `integracao-2026-10-07` | rateio manual entre os equipamentos do setor |
| #7 | `despesas-e-aproveitamento-2026-10-08` → `rateio-manual-2026-10-07` | rateio das despesas por item e aproveitamento de folha no orçamento |

Os PRs #2, #3 e #4 já estão contidos no #5.

**Dados de exemplo.** As telas novas leem dados em memória do servidor do front, nos arquivos `src/actions/*.ts` marcados como `PROVISÓRIO`. Reiniciar o servidor zera tudo. O trabalho do backend é construir a API que substitui esses arquivos; a tabela "mock → endpoint" no fim do `contrato-api.md` diz qual action cada rota substitui. Clientes, orçamentos, produtos, setores e o financeiro continuam na API de sempre.

**Para rodar o front** em outra máquina: o `README.md` da raiz tem a seção "Rodando em outro computador" e o `.env.example` lista todas as variáveis, sem segredo.

## 2. Por onde começar

Nesta ordem, porque cada passo destrava o seguinte:

1. **Planos e contas de teste** (`planos.md`): cadastrar os cinco planos, montar a lista de chaves no login e criar **uma conta de teste por plano** no ambiente de desenvolvimento, com dados fictícios. Sem isso o Maicol não consegue aprovar cada versão.
2. **A base de segurança** (`seguranca.md`, itens 5 e 2): permissão conferida no endpoint, não só na tela, e limite de 100 por página aplicado no servidor. São as duas medidas que mais reduzem o risco hoje e valem para toda rota nova.
3. **Os pontos a combinar** (`contrato-api.md`, seção 7, "Decisões de modelagem a revisar"): escolhas que o contrato fez porque nem a regra nem a tela respondiam. Precisam do "de acordo" antes de virar código. Os principais: as três rotas mexidas por mais de um módulo (`/sector`, `approve` do orçamento e `add-product`/`update-product`), a permissão própria da composição e as chaves novas do gerenciador.
4. **Os módulos, na ordem do produto:** processos e produtos → orçamento → gerenciador de produção → base de custos e precificação → locação. O módulo de venda rápida, caixa e estoque anda em paralelo quando houver folga. Dentro de cada módulo, o contrato diz o que destrava mais telas.

## 3. Regras fixas de toda rota

Resumo das convenções do contrato (seção "Convenções" do `contrato-api.md`), que valem para endpoint novo e para os existentes conforme forem tocados:

- **Empresa da sessão.** A empresa nunca vem do corpo; toda consulta filtra por ela.
- **Permissão no servidor.** Cada bloco diz a chave exigida (`secao:item:acao`) e a chave de plano (`company.plan.features`). Quem não tem recebe 403, mesmo chamando a API direto.
- **Custo e preço só com permissão.** Sem `values:values:view`, o servidor omite os campos de custo e de preço. O custo de recurso nunca vai para a tela do orçamento.
- **Cálculo no servidor.** Custo, preço, consumo, rateio e tempo são calculados na API, que devolve o número pronto. O front não recebe a fórmula geral.
- **Listagens:** `page`, `limit` e `search`; resposta `{ data, page, lastPage, total }`; `limit` máximo 100 aplicado no servidor.
- **Unidades:** dinheiro em centavos; medidas em milímetros; datas em ISO; cada percentual diz a escala.
- **Erro:** no formato que já existe, com `userMessage.message` para a tela. Campo não declarado no DTO responde 400.
- **Rotas:** minúsculas, singular, kebab-case, por módulo; ação vira subrota com verbo; `POST` cria, `PATCH` edita parte, `PUT` substitui configuração, `DELETE` remove.
- **Auditoria:** exportar exige permissão própria e sai identificado; o acesso às telas de método fica registrado.
- **Nada de regra do Brasil escrita no código.** Moeda, máscara de documento e imposto são lidos de configuração, para o país virar configuração depois.

## 4. Segurança

`seguranca.md` tem os nove itens. A prioridade sugerida: permissão no endpoint e limite de listagem primeiro; cálculo no servidor à medida que cada rota nasce; depois a marca nos PDFs e a permissão de exportar; por fim a auditoria com alerta ao administrador. O item 7 trata do agente de IA, que entra depois do assistente de ajuda e segue as mesmas permissões das telas.

## 5. Como entregar cada rota

1. Construa a rota como o bloco do contrato descreve. Onde o bloco diz "muda", é uma rota que já existe ganhando campos.
2. Publique no ambiente de desenvolvimento e avise qual rota ficou pronta.
3. O front troca o dado de exemplo pela rota (a tabela "mock → endpoint" diz o arquivo). As telas não mudam de desenho.
4. O Maicol testa pelo roteiro da rotina correspondente, na conta do plano certo.
5. Se a rota precisar divergir do contrato, anote a diferença na resposta ao front antes de publicar, para a tela acompanhar.

## 6. O que não fazer

- Calcular custo, preço ou consumo no front, ou mandar a tabela de fórmulas para ele.
- Devolver a base inteira numa requisição, ou aceitar `limit` acima de 100.
- Confiar que a tela escondeu o botão: a rota precisa conferir a permissão.
- Usar dado real de cliente em demonstração, homologação ou treinamento.
- Embutir regra brasileira (NF-e, CNPJ, boleto) em rota que não é do módulo fiscal.
- Apagar dados ao descer de plano: descer esconde telas, não apaga.
