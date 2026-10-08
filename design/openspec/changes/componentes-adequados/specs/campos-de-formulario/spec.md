# Campos de formulário

## Purpose

Cada tipo de dado tem um campo, com rótulo, obrigatoriedade, placeholder,
ajuda e erro apresentados sempre da mesma forma.

## ADDED Requirements

### Requirement: Obrigatório e opcional

Todo formulário SHALL marcar os campos obrigatórios com asterisco (e
`aria-required`) ou os opcionais com "(opcional)", conforme a minoria; um
formulário SHALL NOT deixar a obrigatoriedade implícita.

#### Scenario: Cadastro de cliente

- **WHEN** o formulário tem nome e documento obrigatórios e oito campos
  opcionais
- **THEN** nome e documento mostram asterisco e os demais nada

### Requirement: Placeholder é exemplo

Placeholders SHALL mostrar apenas um exemplo de formato ("00.000.000/0000-00",
"nome@empresa.com.br") ou nada; SHALL NOT repetir o rótulo nem dizer
"Digite aqui".

#### Scenario: Campo de CNPJ

- **WHEN** o campo de CNPJ está vazio
- **THEN** o placeholder mostra o formato e some ao digitar

### Requirement: Preenchimento automático

Campos de e-mail, senha, telefone, CEP, nome e endereço SHALL informar o tipo
de preenchimento automático correto; `autoComplete="off"` SHALL ser usado
apenas em campos de busca e códigos.

#### Scenario: Login com gerenciador de senhas

- **WHEN** o usuário abre o login com um gerenciador de senhas
- **THEN** e-mail e senha são oferecidos para preenchimento

### Requirement: Erro no lugar certo

Erros de validação SHALL aparecer abaixo do campo, no tom de erro, com ícone,
mantendo o rótulo na cor normal; em formulários com abas, a aba com erro
SHALL mostrar um indicador; um aviso passageiro SHALL NOT ser o único lugar do
erro.

#### Scenario: Salvar com campo inválido em outra aba

- **WHEN** o usuário salva um formulário com erro numa aba não visível
- **THEN** a aba mostra o indicador de erro e o foco vai para o primeiro
  campo inválido; a tela não pula para uma aba sem erro

### Requirement: Data

Campos de data SHALL usar um único seletor com campo digitável mascarado e
calendário; intervalos SHALL usar um único seletor de intervalo com presets;
campos de data nativos SHALL NOT ser usados.

#### Scenario: Agendar entrega

- **WHEN** o usuário informa a data de entrega
- **THEN** pode digitar "dd/mm/aaaa" ou escolher no calendário, com o mesmo
  componente usado no financeiro e nos relatórios

### Requirement: Dinheiro e percentual

Valores monetários e percentuais SHALL usar campos dedicados com máscara
pt-BR (vírgula decimal, separador de milhar), teclado decimal em
dispositivos móveis e valor numérico para o formulário; campos de número
nativos SHALL NOT ser usados para dinheiro.

#### Scenario: Preço de venda

- **WHEN** o usuário digita "1234,5" no preço
- **THEN** o campo mostra "R$ 1.234,50" e o formulário recebe 1234.5

### Requirement: Escolha entre opções

Duas a quatro opções curtas e mutuamente exclusivas SHALL usar um controle
segmentado; opções com descrição SHALL usar cards de rádio do kit; listas com
cinco ou mais opções SHALL usar select; listas longas SHALL usar um combobox
pesquisável.

#### Scenario: Entrada ou saída

- **WHEN** um formulário pede "Entrada" ou "Saída"
- **THEN** mostra um controle segmentado com as duas opções, não um select

#### Scenario: Escolher material entre centenas

- **WHEN** o usuário vincula um item de nota a um material
- **THEN** usa um campo pesquisável que filtra ao digitar e permite criar um
  material

### Requirement: Switch só com efeito imediato

Um switch SHALL ser usado apenas quando a mudança é aplicada na hora (com
confirmação de salvo); dentro de um formulário gravado por "Salvar", a opção
SHALL ser um checkbox.

#### Scenario: Marcar como pago ao criar

- **WHEN** o formulário de nova movimentação oferece "Marcar como pago"
- **THEN** a opção é um checkbox, gravado com o resto do formulário

### Requirement: Dica em vez de título nativo

Explicações e nomes de controles SHALL usar o componente de dica do kit,
acessível por foco; o atributo `title` SHALL NOT ser usado.

#### Scenario: Botão desabilitado

- **WHEN** o botão "Concluir" está desabilitado porque falta uma etapa
- **THEN** pairar ou focar o botão mostra a dica com o motivo

### Requirement: Cor escolhida pelo usuário

Etiquetas com cor definida pelo usuário SHALL ser escolhidas de uma paleta
do sistema, e o texto sobre a cor SHALL ser calculado para manter contraste.

#### Scenario: Status de orçamento amarelo-claro

- **WHEN** o usuário escolhe uma cor clara para um status
- **THEN** o texto do badge aparece escuro, legível
