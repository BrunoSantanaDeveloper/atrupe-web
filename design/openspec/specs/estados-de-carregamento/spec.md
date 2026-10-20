# estados-de-carregamento Specification

## Purpose
Define o que o usuário vê enquanto o Atrupe espera: a troca de página, a
primeira carga de uma tela, a recarga de uma listagem e o envio de um
formulário. O objetivo é retorno imediato, sem piscar em esperas curtas e sem
saltos de layout quando os dados chegam.

## Requirements

### Requirement: Esqueleto visível nos dois temas
O esqueleto de carregamento MUST ser visível sobre o fundo da página e sobre
cartões, nos temas claro e escuro, e MUST aparecer com atraso (cerca de
150 ms), para que cargas rápidas não pisquem.

#### Scenario: Esqueleto fora de um cartão
- **WHEN** uma tela mostra esqueleto direto sobre o fundo cinza da página, no tema claro
- **THEN** o esqueleto se distingue do fundo

#### Scenario: Esqueleto no tema escuro
- **WHEN** uma tela carrega no tema escuro
- **THEN** o esqueleto aparece como bloco um pouco mais claro que a superfície, nunca como mancha preta

### Requirement: Retorno imediato da navegação
Ao clicar num link interno, o item correspondente da barra lateral (ou a aba do
Topbar) MUST ficar marcado no clique, e uma barra de progresso no topo da
janela MUST aparecer se a troca passar de cerca de 150 ms, sumindo quando a
página nova aparece.

#### Scenario: Troca de módulo demorada
- **WHEN** o usuário clica em "Financeiro" na barra lateral e a página leva 1 s para chegar
- **THEN** "Financeiro" fica marcado no clique, a barra de progresso aparece no topo e some quando a página nova aparece

#### Scenario: Troca rápida
- **WHEN** a página nova chega em menos de 150 ms
- **THEN** a barra de progresso não chega a aparecer

### Requirement: Botão em progresso
Um botão em progresso MUST manter a cor da sua variante e a sua largura, MUST
mostrar o indicador de progresso centralizado no lugar do conteúdo e MUST
bloquear novos cliques. Todo botão que dispara uma gravação e continua na tela
enquanto ela dura MUST indicar progresso. Diálogos que fecham no clique e
gravam em segundo plano dão o retorno pelo aviso (toast) do resultado.

#### Scenario: Confirmar exclusão
- **WHEN** o usuário confirma uma exclusão no diálogo de confirmação
- **THEN** o diálogo continua aberto com o botão de confirmar em progresso e fecha quando a exclusão termina

#### Scenario: Salvar
- **WHEN** o usuário clica em "Salvar" num botão primário
- **THEN** o botão continua com a cor primária e a mesma largura, mostra o indicador girando e não aceita outro clique até terminar

### Requirement: Recarga de listagem mantém os dados
Ao mudar filtro, busca, aba ou página de uma listagem, os dados anteriores MUST
continuar na tela, esmaecidos e com uma barra fina de progresso, até os novos
chegarem. A paginação MUST continuar no lugar.

#### Scenario: Ir para a página 2
- **WHEN** o usuário clica na página 2 de uma listagem
- **THEN** a página 1 continua visível e esmaecida, a paginação não encolhe, e a página 2 substitui a 1 quando chega

### Requirement: Primeira carga com o formato final
Na primeira carga de uma tela, o Topbar (título, abas, ações) MUST aparecer
imediatamente, e a área de dados MUST mostrar um único esqueleto com o formato
do conteúdo final: tabelas com o cabeçalho real e linhas de esqueleto,
paginação e contadores de abas com o espaço reservado.

#### Scenario: Abrir a listagem de clientes
- **WHEN** o usuário abre a listagem de clientes
- **THEN** vê o título, as abas e os botões na hora, e um esqueleto com filtros e linhas de tabela no lugar onde a tabela vai aparecer, sem trocar de forma quando os dados chegam

### Requirement: Nada de "nenhum resultado" antes dos dados
Mensagens de lista vazia MUST aparecer só depois que a busca terminou sem
resultados.

#### Scenario: Busca ainda carregando
- **WHEN** a lista de processos ainda está carregando
- **THEN** não aparece "Nenhum processo com esse nome."
