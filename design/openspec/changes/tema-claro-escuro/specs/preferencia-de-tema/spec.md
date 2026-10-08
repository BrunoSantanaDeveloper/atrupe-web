## Purpose

Permite que cada pessoa escolha como o Atrupe aparece — tema claro, tema escuro
ou o mesmo tema do sistema operacional/navegador — e garante que essa escolha
seja respeitada em todas as páginas, sem piscar ao carregar.

## ADDED Requirements

### Requirement: Três opções de tema
O sistema SHALL oferecer exatamente três opções de tema: **Claro**, **Escuro** e
**Sistema**. Em **Sistema**, o tema aplicado MUST ser o que o sistema
operacional/navegador informa como preferido (`prefers-color-scheme`).

#### Scenario: Escolher Escuro
- **WHEN** o usuário escolhe **Escuro** no seletor de tema
- **THEN** todas as telas passam a usar o tema escuro imediatamente, sem recarregar a página

#### Scenario: Escolher Claro com o sistema no escuro
- **WHEN** o sistema operacional está no modo escuro e o usuário escolhe **Claro**
- **THEN** o Atrupe usa o tema claro, ignorando o sistema operacional

#### Scenario: Escolher Sistema
- **WHEN** o usuário escolhe **Sistema** e o sistema operacional está no modo escuro
- **THEN** o Atrupe usa o tema escuro

### Requirement: Acompanhar o sistema em tempo real
Com a opção **Sistema** ativa, o tema aplicado MUST mudar quando o sistema
operacional/navegador muda de preferência, sem recarregar a página.

#### Scenario: Sistema troca para escuro durante o uso
- **WHEN** a opção **Sistema** está ativa e o sistema operacional muda de claro para escuro com o Atrupe aberto
- **THEN** o Atrupe passa para o tema escuro sem recarregar

#### Scenario: Escolha fixa não acompanha o sistema
- **WHEN** a opção **Claro** está ativa e o sistema operacional muda para escuro
- **THEN** o Atrupe continua no tema claro

### Requirement: Padrão é Sistema
Quem nunca escolheu um tema MUST ver o tema do sistema operacional/navegador.

#### Scenario: Primeiro acesso
- **WHEN** um navegador sem escolha salva abre o Atrupe com o sistema operacional no modo escuro
- **THEN** o Atrupe aparece no tema escuro e o seletor mostra **Sistema** marcado

### Requirement: Escolha salva no navegador
A escolha MUST ficar salva no navegador e valer para todas as páginas e abas do
mesmo navegador, inclusive login, cadastro e páginas sem barra lateral, e
continuar valendo depois de sair e entrar de novo. A escolha não é enviada ao
servidor; outro navegador ou computador começa em **Sistema**.

#### Scenario: Recarregar a página
- **WHEN** o usuário escolhe **Escuro** e recarrega a página
- **THEN** a página volta no tema escuro e o seletor mostra **Escuro** marcado

#### Scenario: Sair e entrar
- **WHEN** o usuário com **Escuro** escolhido sai do sistema
- **THEN** a página de login aparece no tema escuro

#### Scenario: Outra aba
- **WHEN** o usuário troca o tema numa aba com outra aba do Atrupe aberta no mesmo navegador
- **THEN** a outra aba passa a usar o mesmo tema

### Requirement: Carregar sem piscar
A página MUST ser desenhada já no tema escolhido desde o primeiro quadro: nenhum
quadro no tema errado antes do tema certo aparecer.

#### Scenario: Recarregar no escuro
- **WHEN** o tema escolhido é **Escuro** e a página é recarregada
- **THEN** nenhum fundo branco aparece antes do conteúdo escuro

### Requirement: Onde se escolhe o tema
O seletor de tema MUST estar no menu do usuário da barra lateral (computador) e
no menu lateral do celular, mostrando as três opções com a atual marcada.

#### Scenario: Computador
- **WHEN** o usuário abre o menu do usuário na barra lateral
- **THEN** vê a entrada **Tema** com **Claro**, **Escuro** e **Sistema**, e a opção ativa marcada

#### Scenario: Celular
- **WHEN** o usuário abre o menu lateral no celular
- **THEN** vê o seletor de tema com as três opções e a ativa marcada
