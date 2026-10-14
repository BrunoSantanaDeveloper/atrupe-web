## Purpose

Define como o Atrupe se apresenta no tema escuro: o que muda, o que precisa
continuar legível e distinguível, e o que fica igual nos dois temas.

## ADDED Requirements

### Requirement: Todas as telas no tema escuro
No tema escuro, todas as telas e componentes MUST usar fundos escuros e textos
claros. Nenhuma área de conteúdo (página, cartão, tabela, modal, menu,
formulário, aviso) pode aparecer com fundo branco ou claro do tema claro.

#### Scenario: Tela de listagem
- **WHEN** o usuário abre uma listagem (por exemplo, orçamentos) no tema escuro
- **THEN** a página, a tabela, os filtros e o cabeçalho aparecem com fundos escuros e textos claros

#### Scenario: Camadas sobrepostas
- **WHEN** um modal, menu suspenso, calendário ou aviso abre no tema escuro
- **THEN** ele aparece com fundo escuro, borda visível e separado do conteúdo atrás

### Requirement: Legibilidade
No tema escuro, o texto principal e o secundário MUST ter contraste de pelo
menos 4,5:1 com o fundo em que aparecem, e textos de apoio (legendas, dicas,
textos de campos vazios) pelo menos 3:1.

#### Scenario: Texto principal sobre superfície
- **WHEN** um título ou valor aparece sobre um cartão no tema escuro
- **THEN** o contraste entre o texto e o cartão é de pelo menos 4,5:1

#### Scenario: Texto de campo vazio
- **WHEN** um campo de formulário vazio mostra seu texto de exemplo no tema escuro
- **THEN** o contraste com o fundo do campo é de pelo menos 3:1

### Requirement: Hierarquia preservada
A ordem visual do tema claro MUST se manter no escuro: o que é mais destacado
no claro continua mais destacado no escuro (texto principal > secundário >
apoio > desabilitado), e superfícies diferentes continuam distinguíveis entre
si (página, cartão, área de destaque ao passar o mouse, linha selecionada).

#### Scenario: Linha da tabela ao passar o mouse
- **WHEN** o usuário passa o mouse sobre uma linha de tabela no tema escuro
- **THEN** a linha muda de fundo de forma perceptível em relação às outras

#### Scenario: Bordas e divisórias
- **WHEN** um campo, cartão ou divisória aparece no tema escuro
- **THEN** sua borda é visível contra o fundo

### Requirement: Menos luz, mesma ordem de elevação
O tema escuro MUST ser pensado como o mesmo ambiente com menos luz, e não como
uma troca de cores: o que está acima recebe mais luz e é mais claro que o que
está abaixo, como no tema claro (cartão branco sobre página cinza). No escuro,
a página é o fundo mais escuro; cartões, barra lateral e campos são mais claros
que a página; menus, modais e avisos são mais claros que os cartões.

#### Scenario: Cartão sobre a página
- **WHEN** um cartão ou a barra lateral aparece sobre a página no tema escuro
- **THEN** ele é visivelmente mais claro que a página

#### Scenario: Menu sobre o cartão
- **WHEN** um menu suspenso, modal ou aviso abre no tema escuro
- **THEN** ele é mais claro que o cartão ou a página sob ele

### Requirement: Cores de marca e de estado
As cores de marca (verde Atrupe) e de estado (sucesso, alerta, erro,
informação) MUST continuar reconhecíveis no tema escuro. Botões e marcações de
cor sólida mantêm a cor do tema claro com texto branco, exceto a cor primária;
etiquetas e avisos com fundo claro colorido passam a ter fundo escuro da mesma
cor com texto claro da mesma cor.

#### Scenario: Botão de cor de estado
- **WHEN** um botão de erro ou de sucesso aparece no tema escuro
- **THEN** ele mantém a cor do tema claro com texto branco

### Requirement: Primária iluminada no tema escuro
A cor primária (verde Atrupe dos botões principais e marcações sólidas de
marca) MUST seguir o mesmo modelo de luz: o botão principal é um elemento acima
da superfície, por isso no escuro é mais claro que o cartão, com uma variação
própria do mesmo verde (menos saturada) e tinta escura por cima. O texto e os
ícones sobre a primária MUST ter contraste de pelo menos 4,5:1 e a primária
MUST se destacar do cartão em pelo menos 3:1, nos estados normal, ao passar o
mouse e pressionado. Passar o mouse acrescenta luz: o botão clareia.

#### Scenario: Botão principal
- **WHEN** um botão principal aparece no tema escuro
- **THEN** ele é mais claro que o cartão, com texto e ícones escuros legíveis e sem contorno de outra cor

#### Scenario: Passar o mouse no botão principal
- **WHEN** o usuário passa o mouse sobre um botão principal no tema escuro
- **THEN** o botão fica mais claro, mantendo o texto escuro legível

#### Scenario: Etiqueta de marca sólida
- **WHEN** uma etiqueta ou marcação com fundo sólido da marca aparece no tema escuro
- **THEN** ela usa a primária iluminada com texto escuro

#### Scenario: Etiqueta de status
- **WHEN** uma etiqueta de status "Aprovado" (verde claro com texto verde no tema claro) aparece no tema escuro
- **THEN** ela aparece com fundo verde escuro e texto verde claro, ainda reconhecível como verde

#### Scenario: Mensagem de erro de campo
- **WHEN** um campo inválido mostra sua mensagem de erro no tema escuro
- **THEN** a mensagem e a borda do campo aparecem em vermelho legível

### Requirement: Foco visível
Anéis e bordas de foco MUST continuar visíveis no tema escuro.

#### Scenario: Navegação pelo teclado
- **WHEN** o usuário navega com Tab por um formulário no tema escuro
- **THEN** o campo focado mostra borda ou anel de foco perceptível

### Requirement: Componentes de biblioteca seguem a escolha
Componentes de terceiros que têm tema escuro próprio MUST seguir a escolha do
usuário, e não a do sistema operacional por conta própria: avisos (toasts),
gráficos, barras de rolagem e controles nativos do navegador (campos de data,
seletores nativos, autopreenchimento).

#### Scenario: Aviso com tema Claro e sistema escuro
- **WHEN** o tema escolhido é **Claro**, o sistema operacional está no escuro e um aviso aparece
- **THEN** o aviso aparece no tema claro

#### Scenario: Gráfico no tema escuro
- **WHEN** um gráfico do painel aparece no tema escuro
- **THEN** eixos, grades, legendas e dicas aparecem legíveis sobre fundo escuro

#### Scenario: Campo de data nativo
- **WHEN** um campo de data nativo do navegador aparece no tema escuro
- **THEN** o campo e o calendário nativo usam o visual escuro do navegador

### Requirement: Tema claro inalterado
A introdução do tema escuro MUST NOT mudar a aparência do tema claro.

#### Scenario: Comparar o claro antes e depois
- **WHEN** uma tela é aberta no tema claro antes e depois desta mudança
- **THEN** as cores, bordas e sombras são as mesmas

### Requirement: Documentos fora do tema
Documentos gerados para imprimir ou enviar (PDF de orçamento, ordem de serviço
e relatórios) MUST sair sempre com o visual claro, qualquer que seja o tema.

#### Scenario: Gerar PDF no tema escuro
- **WHEN** o usuário gera o PDF de um orçamento com o tema escuro ativo
- **THEN** o PDF sai com fundo branco e texto escuro, igual ao do tema claro
