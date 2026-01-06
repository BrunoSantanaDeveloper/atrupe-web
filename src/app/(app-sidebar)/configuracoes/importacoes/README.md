# Sistema de Importação via Planilha

O sistema permite importar dados em lote através de arquivos CSV. Todos os imports seguem o mesmo fluxo: upload do arquivo → validação automática → processamento.

---

## Clientes

**Campos obrigatórios:** nome, tipo (PESSOA ou EMPRESA), CPF ou CNPJ, email

**Campos opcionais:** telefone, celular, razão social, grupo (categoria), data de nascimento, filial (SIM/NAO), endereço completo, dados do responsável (nome, email, telefone, celular)

**Comportamento:** Se informar um grupo que não existe, o sistema cria automaticamente.

---

## Fornecedores

**Campos obrigatórios:** nome, tipo (PESSOA ou EMPRESA), CPF ou CNPJ, email

**Campos opcionais:** telefone, celular, razão social, categoria, filial (SIM/NAO), endereço completo, dados do responsável

**Comportamento:** Se informar uma categoria que não existe, o sistema cria automaticamente.

---

## Produtos

**Campos obrigatórios:** código, nome, setor, categoria

**Campos opcionais:** descrição, permite editar valor (SIM/NAO), permite editar descrição (SIM/NAO)

**Validações:** O setor precisa existir no sistema. A categoria é criada automaticamente se não existir.

---

## Orçamentos

**Campos obrigatórios:** número da venda, série, data, CPF/CNPJ do cliente, email do vendedor, código do produto, quantidade, valores

**Campos opcionais:** data de validade, responsável (nome ou email), condição de pagamento, parcelas (até 3), entrada, tipo de entrega, transportador

**Comportamento:**

- Uma venda pode ter vários produtos (linhas com mesmo número)
- Parcelas e dados de entrega devem ser informados apenas na primeira linha
- Se o responsável estiver preenchido, deve existir como contato do cliente

---

## Ordens de Serviço

**Campos obrigatórios:** número, série, status (IN_PRODUCTION, FINISHED, CANCELED), data, cliente, vendedor, produto

**Campos opcionais:** responsável, data entrega, condição de pagamento, parcelas, entrada, frete (custo e valor cobrado), transportador, comissão

**Comportamento:**

- Cria automaticamente o orçamento vinculado (status APPROVED)
- Cria as receitas a receber do cliente
- Cria despesas de frete e comissão (se informados)
- Se já existir uma receita com mesmos dados, não cria duplicada

---

## Receitas e Despesas (Financeiro)

**Campos obrigatórios:** tipo (RECEITA ou DESPESA), descrição, data de referência, valor total, número da parcela, vencimento, valor da parcela

**Campos opcionais:** referência, cliente (para receitas), fornecedor (para despesas), funcionário (para despesas de salário), natureza, subcategoria, condição de pagamento, status (PENDING, PAID, OVERDUE), data e valor do pagamento, conta bancária

**Comportamento:**

- Uma mesma receita/despesa pode ter várias parcelas (linhas com mesma descrição e data de referência)
- Se já existir um lançamento com mesmos dados (cliente/fornecedor, valor, categoria, vencimento), não cria duplicado
- Se informar status PAID, deve informar também a data e valor do pagamento

---

## Tratamento de Erros

Ao enviar o arquivo, o sistema valida cada linha antes de processar. Se houver erros:

- O sistema mostra uma tabela com a linha, campo e motivo do erro
- Para alguns erros (cliente, produto, série não encontrados), há um link para abrir o cadastro correspondente
- Corrija os dados na planilha e envie novamente

**Erros mais comuns:**

- Cliente/Fornecedor com CPF/CNPJ não cadastrado
- Série de venda não configurada
- Produto com código inexistente
- Email de vendedor não encontrado
