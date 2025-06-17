# 🧪 Teste - Controle de Limite de Usuários

## 📋 Implementação Realizada

### ✅ **Modificações Feitas:**

1. **Hook `usePlanFeatures` atualizado** (`src/hooks/usePlanFeatures.ts`)
   - ✅ Adicionado método `getUserLimit()`
   - ✅ Retorna 5 para plano LITE, 3 para START/TRIAL

2. **Componente `TableData` modificado** (`src/app/(app-sidebar)/configuracoes/empresa-e-sistema/colaboradores-e-usuarios/components/TableData.tsx`)
   - ✅ Importado `usePlanFeatures` e `useAlertDialog`
   - ✅ Criada função `handleCreateUser()` para verificar limite
   - ✅ Modificado onClick do botão para usar a nova função

### 🔧 **Lógica Implementada:**

```typescript
// Contar usuários ativos atuais
const activeUsersCount = employeeArray.reduce((count, group) => {
  return count + group.employees.filter((emp) => emp.user?.isActive).length
}, 0)

// Verificar limite antes de criar usuário
const handleCreateUser = (item: EmployeeType) => {
  const userLimit = getUserLimit() // 3 ou 5 baseado no plano
  
  // Se editando usuário existente → permite
  if (item?.user?.isActive) {
    // Abre diálogo de edição
  }
  
  // Se atingiu limite → mostra alerta
  if (activeUsersCount >= userLimit) {
    // Mostra modal de upgrade usando useAlertDialog
  }
  
  // Se não atingiu limite → permite criar
  // Abre diálogo de criação
}
```

## 🧪 **Cenários de Teste**

### **Cenário 1: Empresa com Plano TRIAL (3 usuários)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "TRIAL",
    "features": ["user_limit_3", ...]
  }
}
```

#### **Testes:**
1. **0 usuários ativos** → ✅ Deve permitir criar usuário
2. **2 usuários ativos** → ✅ Deve permitir criar usuário  
3. **3 usuários ativos** → ❌ Deve mostrar alerta de limite
4. **Editar usuário existente** → ✅ Sempre deve permitir

#### **Mensagem Esperada (Limite Atingido):**
```
Título: "Limite de usuários atingido"
Descrição: "Seu plano permite apenas 3 usuários. Para criar mais usuários, faça upgrade do seu plano."
Botões: "Fazer Upgrade" | "Entendi"
```

### **Cenário 2: Empresa com Plano LITE (5 usuários)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "LITE",
    "features": ["user_limit_5", ...]
  }
}
```

#### **Testes:**
1. **0-4 usuários ativos** → ✅ Deve permitir criar usuário
2. **5 usuários ativos** → ❌ Deve mostrar alerta de limite
3. **Editar usuário existente** → ✅ Sempre deve permitir

## 🔍 **Como Testar**

### **1. Login na Aplicação**
- Fazer login com empresa que tem plano TRIAL
- Verificar se `session.company.plan.features` contém `"user_limit_3"`

### **2. Navegar para Usuários**
- Ir para `/configuracoes/empresa-e-sistema/colaboradores-e-usuarios`
- Verificar lista de funcionários carregada

### **3. Verificar Contador**
- Contar quantos funcionários têm `user.isActive = true`
- O sistema deve contar automaticamente

### **4. Testar Criação de Usuário**
- **Se < 3 usuários ativos**: Clicar em "Novo usuário" → Deve abrir modal
- **Se = 3 usuários ativos**: Clicar em "Novo usuário" → Deve mostrar alerta

### **5. Testar Edição de Usuário**
- Clicar em "Editar usuário" (usuário existente) → Sempre deve funcionar

## 🐛 **Debug e Verificação**

### **Console do Navegador:**
```javascript
// Verificar features disponíveis
console.log('Features:', session?.company?.plan?.features)

// Verificar limite do plano
const { getUserLimit } = usePlanFeatures()
console.log('User limit:', getUserLimit())

// Verificar usuários ativos
console.log('Active users count:', activeUsersCount)
```

### **Network Tab:**
- Verificar se query `['employee-list']` está retornando dados corretos
- Verificar estrutura dos dados: `group.employees[].user.isActive`

## ✅ **Critérios de Sucesso**

### **✅ Funcionamento Correto:**
1. ✅ Hook `getUserLimit()` retorna valor correto (3 ou 5)
2. ✅ Contador de usuários ativos funciona corretamente
3. ✅ Alerta é mostrado quando limite é atingido
4. ✅ Modal de criação abre quando dentro do limite
5. ✅ Edição de usuário sempre funciona
6. ✅ Mensagem de upgrade é clara e útil

### **❌ Problemas Possíveis:**
- Hook não importado corretamente
- Features não carregadas na sessão
- Contador de usuários ativos incorreto
- Modal de alerta não abrindo
- onClick não funcionando

## 🚀 **Próximos Passos**

Após validar este teste:
1. **Implementar outros controles** (módulos financeiros, etc.)
2. **Adicionar página de upgrade** (link do botão "Fazer Upgrade")
3. **Implementar logs** de tentativas de acesso bloqueado
4. **Criar testes automatizados** para este fluxo

---

**🧪 Status:** Implementação concluída, pronta para teste! 