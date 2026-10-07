# Sistema de botões

## Purpose

Um conjunto fechado de botões cuja aparência diz a importância e o risco da
ação.

## ADDED Requirements

### Requirement: Quatro níveis e dois tons

O botão SHALL ter exatamente os níveis `primary` (fundo sólido da marca),
`secondary` (superfície com borda fina), `tertiary` (sem borda) e `link`
(texto), cada um disponível no tom padrão e no tom destrutivo (vermelho);
nenhuma outra variante de cor SHALL existir.

#### Scenario: Secundária ao lado da primária

- **WHEN** um rodapé de diálogo mostra "Cancelar" e "Salvar"
- **THEN** "Salvar" é sólida na cor da marca e "Cancelar" é terciária ou
  secundária em cinza, visivelmente mais leve

#### Scenario: Ação destrutiva

- **WHEN** o usuário vê o botão "Excluir cliente"
- **THEN** o botão usa o tom destrutivo no nível correspondente, e nenhuma
  ação não destrutiva usa vermelho

#### Scenario: Botão de tom de aviso ou sucesso

- **WHEN** um botão indica um tom (ex.: "Aprovar")
- **THEN** o botão é primário ou secundário na cor da marca ou cinza; o tom é
  comunicado pelo rótulo ou por um ícone, não pela cor do botão

### Requirement: Tamanhos e ícone por tamanho

O botão SHALL ter os tamanhos `sm` (32 px), `md` (36 px, padrão), `lg` (40 px)
e `xl` (44 px, só autenticação e checkout), todos com texto de 14 px; o ícone
SHALL ter 16 px no `sm` e 20 px nos demais; a versão só-ícone SHALL ser
quadrada no mesmo tamanho.

#### Scenario: Barra de ferramentas densa

- **WHEN** uma tabela mostra ações de linha em botões só-ícone pequenos
- **THEN** cada botão mede 32×32 px com ícone de 16 px

### Requirement: Estados

Um botão carregando SHALL manter a largura, mostrar um spinner centralizado,
marcar `aria-busy` e ficar desabilitado; um botão desabilitado SHALL manter a
forma do seu nível e permanecer legível; o foco SHALL usar o anel único do
sistema; o pressionado SHALL ser mais escuro que o hover.

#### Scenario: Salvar em andamento

- **WHEN** o usuário clica em "Salvar" e a requisição está em curso
- **THEN** o botão não muda de largura, mostra o spinner sobre o texto
  oculto, não aceita novo clique e informa `aria-busy`

#### Scenario: Link desabilitado

- **WHEN** um botão de nível `link` está desabilitado
- **THEN** só a cor do texto muda; não aparece fundo nem borda

### Requirement: Ícone sozinho tem nome

Todo botão só-ícone SHALL ter `aria-label` e uma dica (tooltip) com o mesmo
texto; `title` nativo SHALL NOT ser usado em botões.

#### Scenario: Botão de recolher a barra lateral

- **WHEN** o usuário foca o botão de recolher a barra lateral
- **THEN** o leitor de tela lê "Recolher menu" e uma dica aparece

#### Scenario: Auditoria por rota

- **WHEN** a captura automática conta botões visíveis sem nome acessível
- **THEN** o resultado é zero em todas as rotas
