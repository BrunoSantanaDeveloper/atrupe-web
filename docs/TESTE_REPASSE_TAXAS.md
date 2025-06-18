# Teste: Controle de Repasse de Taxas Bancárias

## Cenários de Teste

### 1. Usuário LITE (Acesso Completo)
**Features:** `bank_tax_transfer_full`

#### **Comportamento Esperado:**
- ✅ Todos os campos "Taxa operadora" estão habilitados
- ✅ Todos os campos "Repasse da taxa" estão habilitados
- ✅ Usuário pode configurar valores/percentuais normalmente
- ✅ Formulário salva corretamente

#### **Passos do Teste:**
1. Faça login com usuário do plano LITE
2. Acesse: Configurações > Financeiro > Configurações de pagamento > Condições de pagamento
3. Clique em "Nova condição de pagamento"
4. Configure os campos:
   - Método de pagamento: qualquer
   - Nome: "Teste LITE"
   - Ative/desative "Aceita parcelamento"
   - Configure "Taxa operadora" e "Repasse da taxa"
5. Salve a condição
6. Edite a condição criada e verifique se os campos continuam editáveis

---

### 2. Usuário START/TRIAL (Acesso Limitado)
**Features:** `bank_tax_transfer_limited`

#### **Comportamento Esperado:**
- ❌ Todos os campos "Taxa operadora" estão DESABILITADOS
- ❌ Todos os campos "Repasse da taxa" estão DESABILITADOS
- ✅ Demais campos funcionam normalmente
- ✅ Formulário salva corretamente (com valores padrão para taxas)

#### **Passos do Teste:**
1. Faça login com usuário do plano START ou TRIAL
2. Acesse: Configurações > Financeiro > Configurações de pagamento > Condições de pagamento
3. Clique em "Nova condição de pagamento"
4. Verifique que os campos estão desabilitados:
   - "Taxa operadora" (disabled)
   - "Repasse da taxa" (disabled)
5. Configure os demais campos normalmente
6. Salve a condição
7. Edite a condição e confirme que os campos de taxa continuam desabilitados

---

### 3. Teste de Parcelamento (START/TRIAL)

#### **Comportamento Esperado:**
- Com parcelamento ativado: campos de taxa desabilitados para cada parcela
- Com parcelamento desativado: campos de taxa desabilitados para pagamento único
- Tipo de custo (% ou R$): campos desabilitados em ambos os casos

#### **Passos do Teste:**
1. Usuário START/TRIAL cria nova condição
2. Ative "Aceita parcelamento"
3. Configure parcelas mínima e máxima (ex: 1 a 3)
4. Verifique que para cada parcela os campos estão desabilitados:
   - Parcela 1: "Taxa operadora" e "Repasse da taxa" (disabled)
   - Parcela 2: "Taxa operadora" e "Repasse da taxa" (disabled)
   - Parcela 3: "Taxa operadora" e "Repasse da taxa" (disabled)
5. Desative "Aceita parcelamento"
6. Verifique que os campos únicos também estão desabilitados

---

### 4. Teste de Tipo de Custo (START/TRIAL)

#### **Passos do Teste:**
1. Usuário START/TRIAL cria nova condição
2. Alterne entre "% - Percentual" e "R$ - Fixo"
3. Verifique que em ambos os casos os campos estão desabilitados:
   - **Percentual**: campos com endAdornment "%" desabilitados
   - **Valor fixo**: campos FormBrlInput com "R$" desabilitados

---

## Validação de Implementação

### ✅ Hook `usePlanFeatures`
- Método `getBankTaxTransferType()` implementado
- Retorna 'full' para LITE, 'limited' para START/TRIAL

### ✅ Componente `NewPaymentCondition`
- Variável `isTaxFieldsDisabled` calculada corretamente
- Prop `disabled={isTaxFieldsDisabled}` aplicada em todos os campos:
  - FormBrlInput para "Taxa operadora"
  - FormBrlInput para "Repasse da taxa"
  - FormInput para "Taxa operadora"
  - FormInput para "Repasse da taxa"

### ✅ Funcionalidades Preservadas
- ✅ Demais campos funcionam normalmente
- ✅ Validação de formulário mantida
- ✅ Lógica de parcelamento inalterada
- ✅ Conversão entre tipos de custo preservada

---

## Cenários de Erro

### 1. Sem Features no Backend
**Comportamento:** `getBankTaxTransferType()` retorna 'none'
**Resultado:** Campos habilitados (fallback seguro)

### 2. Features Incorretas
**Comportamento:** Hook não encontra features esperadas
**Resultado:** Campos habilitados (fallback seguro)

---

## Notas de Implementação

1. **Controle Granular**: Apenas campos de taxa afetados, demais funcionalidades preservadas
2. **UX Consistente**: Campos desabilitados mas visíveis, mantendo layout
3. **Fallback Seguro**: Na ausência de features, funcionalidade liberada
4. **Performance**: Verificação única no componente, reutilizada em todos os campos 