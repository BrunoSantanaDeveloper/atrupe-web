# Requisitos de segurança para o backend e a infraestrutura do Atrupe

Versão para o desenvolvimento (07/10/2026), a partir das regras de segurança decididas em 23/09/2026. Vale para **todo endpoint novo** e para os existentes conforme forem tocados. O objetivo é que copiar a base e o método de cálculo de uma empresa seja difícil, e que, se alguém tentar, fique rastro.

## 1. O cálculo fica no servidor

- Toda conta que forma **custo, preço ou consumo** roda no backend: custo do patrimônio, rateios, custo-hora, markup e preço sugerido, consumo da composição, custo da etapa, ponto de equilíbrio e conversões de unidade.
- O front recebe **o resultado**, não a fórmula nem os coeficientes gerais.
- **Exceção:** simulação interativa pode calcular no front, desde que o servidor devolva só os coeficientes já resolvidos **daquele item** e **revalide tudo ao salvar**.
- Hoje várias telas novas calculam no front porque os endpoints não existem. Ao ligar cada endpoint, o cálculo migra para o servidor. A lista está em `contrato-api.md`, neste guia.

## 2. Listagens com limite

- **Máximo por página aplicado no servidor** (sugestão: 100), ignorando pedido maior. Nada de `perPage=999999`.
- **Limite de requisições por conta e por minuto.**
- **Bloqueio progressivo** quando o padrão for de varredura: muitas páginas em sequência, em telas diferentes, em pouco tempo.
- **Critério de aceite:** não deve ser possível obter todos os materiais, composições, processos ou patrimônios de uma empresa em menos requisições do que uma pessoa faria usando a tela.

## 3. Exportação com permissão e marca

- Exportar (planilha, PDF, impressão) exige **permissão própria**, separada da de visualizar.
- Todo arquivo exportado sai com **empresa, usuário e data e hora**. Nas planilhas isso já está feito no front; falta nos **PDFs e nas telas de impressão** (ficha de produção, relatórios, proposta). O ideal é o servidor gerar o PDF já marcado.

## 4. Acesso em massa auditado

- O sistema **registra** usuário, data, tela e volume quando uma conta:
  - exporta acima do normal para o histórico dela;
  - percorre listagens em volume incomum;
  - abre em sequência as telas de método (composição, base de custos, precificação, fórmulas).
- E **alerta o administrador da empresa**. A finalidade é detectar cópia em massa, não vigiar a rotina.

## 5. Telas de método com permissão própria

- Composição e fórmulas, base de custos, precificação e parâmetros de markup, configuração de patrimônio e configurações produtivas têm **permissão específica**, que **não vem liberada** nos perfis operacionais.
- O **endpoint** valida essa permissão, não só a tela. Esconder o botão não protege: quem chama a API direto precisa receber 403.
- O resultado previsto do orçamento (custo, margem e resultado por item) é tela com permissão própria, desligada para vendedor.

## 6. Ambientes de teste sem dado real

- Contas de demonstração, homologação e treinamento usam **dados fictícios**. Nunca a operação real de um cliente (custos, margens, fornecedores, composições).

## 7. O agente de IA

O assistente de IA **não bloqueia cópia sozinho**: tudo o que entra nele pode sair dele. Por isso ele segue regras próprias:

- **Conhecimento só do manual de ajuda do produto**, que não contém o método. O assistente nunca recebe as regras internas, fórmulas gerais, custos de outras empresas nem esta documentação.
- **Toda ferramenta do assistente passa pela mesma permissão da tela.** Quem não vê valores não vê valores pelo assistente; quem não vê a composição não a obtém perguntando.
- **Limite de uso por conta**, como nas listagens, para o assistente não virar um caminho de varredura.
- **Registro das conversas** junto da auditoria do item 4, com o mesmo alerta para o administrador.
- **Os dados dos clientes não treinam modelo** e o que é enviado ao provedor é o mínimo necessário (LGPD).
- **Onde a IA ajuda de verdade na proteção:** na auditoria do item 4. Um modelo lendo o registro de acessos detecta padrões de varredura e exportação fora do normal melhor do que uma regra fixa, e escreve o alerta para o administrador em linguagem simples. É um recurso a construir depois do assistente de ajuda.

## 8. O que não conta como proteção

Não vale como segurança: ofuscar o JavaScript, esconder campos no HTML, bloquear clique direito ou seleção, esconder endpoint sem autenticação real. Atrasa minutos e dá falsa sensação de proteção.

## 9. Camada jurídica e de acesso (com a Atrupe)

- NDA e cláusula contratual com colaboradores e prestadores, cobrindo código, documentação e dados.
- Repositórios privados, na organização da Atrupe, com acessos individuais e revogáveis.
- Termos de uso proibindo extração sistemática de dados e engenharia reversa.

## Prioridade sugerida

1. **Permissão validada no endpoint** (item 5) e **limite de listagem** (item 2): são os que mais reduzem o risco hoje.
2. **Cálculo no servidor** (item 1), à medida que cada endpoint novo for construído.
3. **Marca nos PDFs** e **permissão de exportar** (item 3).
4. **Auditoria e alerta** (item 4), e depois a análise por IA.
