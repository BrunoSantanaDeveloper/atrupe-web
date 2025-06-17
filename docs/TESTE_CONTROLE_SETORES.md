# 🧪 Teste - Controle de Setores

## 📋 Implementação Realizada

### ✅ **Modificações Feitas:**

1. **Hook `usePlanFeatures` atualizado** (`src/hooks/usePlanFeatures.ts`)
   - ✅ Adicionado método `canManageSectors()`
   - ✅ Retorna `true` para LITE, `false` para START/TRIAL

2. **Lista de Configurações modificada** (`src/app/(app-sidebar)/configuracoes/empresa-e-sistema/page.tsx`)
   - ✅ Convertido para client component
   - ✅ Item "Setores" condicionalmente renderizado
   - ✅ Usa spread operator para incluir/excluir baseado na feature

3. **Página de Setores protegida** (`src/app/(app-sidebar)/configuracoes/empresa-e-sistema/setores/page.tsx`)
   - ✅ `FeatureGate` com feature `sectors_management`
   - ✅ Fallback elegante com design premium
   - ✅ Botão para upgrade

### 🔧 **Lógica Implementada:**

#### **Lista de Configurações:**
```typescript
const { canManageSectors } = usePlanFeatures()

const settings = [
  {
    items: [
      // Outros itens sempre visíveis...
      
      // Setores - apenas se permitido pelo plano
      ...(canManageSectors()
        ? [
            {
              title: 'Setores',
              icon: IconSettingsCog,
              description: 'Defina os setores da sua empresa...',
              link: 'empresa-e-sistema/setores',
            },
          ]
        : []),
      
      // Outros itens sempre visíveis...
    ],
  },
]
```

#### **Página de Setores:**
```typescript
<FeatureGate
  features={['sectors_management']}
  fallback={<PremiumPageFallback />}
>
  <Main /> // Página normal
</FeatureGate>
```

## 🧪 **Cenários de Teste**

### **Cenário 1: Empresa com Plano LITE (Acesso Total)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "LITE",
    "features": ["sectors_management", ...]
  }
}
```

#### **Comportamento Esperado:**
1. **Lista de Configurações** → ✅ Item "Setores" deve aparecer
2. **Clicar em "Setores"** → ✅ Deve abrir página normalmente
3. **URL direta `/setores`** → ✅ Deve funcionar normalmente

### **Cenário 2: Empresa com Plano START/TRIAL (Acesso Bloqueado)**

#### **Estado Inicial:**
```json
"company": {
  "plan": {
    "name": "TRIAL",
    "features": ["user_limit_3", ...] // SEM sectors_management
  }
}
```

#### **Comportamento Esperado:**
1. **Lista de Configurações** → ❌ Item "Setores" NÃO deve aparecer
2. **URL direta `/setores`** → ❌ Deve mostrar tela de upgrade
3. **Tela de upgrade** → ✅ Deve ter botão "Fazer Upgrade"

#### **Tela de Upgrade Esperada:**
```
🔒 Funcionalidade Premium

A gestão de setores está disponível apenas no plano Lite.
Faça upgrade para organizar sua empresa por setores.

[Fazer Upgrade]
```

## 🔍 **Como Testar**

### **Teste 1: Plano LITE**
1. **Login** com empresa que tem plano LITE
2. **Navegar** para `/configuracoes/empresa-e-sistema`
3. **Verificar** se item "Setores" aparece na lista
4. **Clicar** no item "Setores" → Deve abrir página
5. **Acessar** URL direta `/configuracoes/empresa-e-sistema/setores` → Deve funcionar

### **Teste 2: Plano TRIAL**
1. **Login** com empresa que tem plano TRIAL
2. **Navegar** para `/configuracoes/empresa-e-sistema`
3. **Verificar** se item "Setores" NÃO aparece na lista
4. **Acessar** URL direta `/configuracoes/empresa-e-sistema/setores` → Deve mostrar tela de upgrade
5. **Clicar** em "Fazer Upgrade" → Deve redirecionar para `/assinatura/contratar`

### **Teste 3: Mudança de Plano (Opcional)**
1. **Simular** mudança de TRIAL para LITE
2. **Recarregar** sessão
3. **Verificar** se item "Setores" agora aparece

## 🐛 **Debug e Verificação**

### **Console do Navegador:**
```javascript
// Verificar features disponíveis
console.log('Features:', session?.company?.plan?.features)

// Verificar se pode gerenciar setores
const { canManageSectors } = usePlanFeatures()
console.log('Can manage sectors:', canManageSectors())

// Verificar se feature específica existe
const { hasFeature } = usePlanFeatures()
console.log('Has sectors_management:', hasFeature('sectors_management'))
```

### **Developer Tools:**
- **Elements**: Verificar se item "Setores" está renderizado no DOM
- **Network**: Verificar se requisições estão sendo feitas corretamente
- **Application/Storage**: Verificar dados da sessão

## ✅ **Critérios de Sucesso**

### **✅ Funcionamento Correto:**
1. ✅ `canManageSectors()` retorna valor correto baseado no plano
2. ✅ Item "Setores" é ocultado para planos START/TRIAL
3. ✅ Item "Setores" é exibido para plano LITE
4. ✅ Página `/setores` é bloqueada para planos START/TRIAL
5. ✅ Página `/setores` funciona normalmente para plano LITE
6. ✅ Tela de upgrade é elegante e funcional
7. ✅ Botão "Fazer Upgrade" redireciona corretamente

### **❌ Problemas Possíveis:**
- Hook `canManageSectors()` não retorna valor correto
- Item não é ocultado/exibido corretamente
- Página não está sendo bloqueada
- FeatureGate não está funcionando
- Tela de upgrade não aparece
- Botão de upgrade não funciona

## 🔄 **Comportamento Esperado por Plano**

| Plano | Configurações | Página Direta | Feature |
|-------|--------------|---------------|---------|
| **LITE** | ✅ Item visível | ✅ Acesso liberado | ✅ `sectors_management` |
| **START** | ❌ Item oculto | ❌ Tela de upgrade | ❌ Sem feature |
| **TRIAL** | ❌ Item oculto | ❌ Tela de upgrade | ❌ Sem feature |

## 🚀 **Próximos Passos**

Após validar este teste:
1. **Implementar outros controles** (venda rápida, módulos financeiros, etc.)
2. **Criar testes automatizados** para este fluxo
3. **Implementar analytics** para medir tentativas de acesso bloqueado
4. **Criar mais telas de upgrade** personalizadas por funcionalidade

---

**🧪 Status:** Implementação concluída, pronta para teste!

### 📝 **Resumo da Implementação:**
- ✅ **2 locais modificados**: Lista de configurações + Página de setores
- ✅ **1 método adicionado**: `canManageSectors()` no hook
- ✅ **UX elegante**: Tela de upgrade bem desenhada
- ✅ **Segurança**: Tanto lista quanto página protegidas 