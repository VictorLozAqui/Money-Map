# Correção: Duplicatas de Gastos Fixos

## 🔍 Problema Identificado

**Situação**: No Dashboard apareciam **3 gastos anuais "IUC Astra"**:
- 1x IUC Astra - Dia 9/10 (correto, existe nos gastos)
- 2x IUC Astra - Dia 7/10 (apareciam no dashboard, mas foram apagados da lista de gastos)

### Causa Raiz

O usuário criou o gasto "IUC Astra - Dia 7/10" como **fixo anual múltiplas vezes**, criando **múltiplos registros duplicados** na coleção `recurringExpenses` do Firestore.

**Por que aconteceu:**
1. Toda vez que você marca um gasto como "Fixo", um novo registro é criado em `recurringExpenses`
2. O sistema **não verificava** se já existia um gasto fixo idêntico
3. Quando você apagava os gastos da lista, apagava apenas os documentos da coleção `expenses`
4. Os registros de `recurringExpenses` permaneciam **ativos** (`active: true`)
5. O Dashboard mostra **todos** os gastos recorrentes ativos

---

## ✅ Soluções Implementadas

### 1. **Melhor Identificação no Dashboard**

#### Antes:
```
IUC Astra - Dia 7/10    187,00
IUC Astra - Dia 7/10    187,00
IUC Astra - Dia 9/10    187,00
```

#### Depois:
```
IUC Astra - Dia 7/10 (Impostos)    187,00
IUC Astra - Dia 7/10 (Impostos)    187,00  
IUC Astra - Dia 9/10 (Impostos)    187,00
```

Agora mostra a **categoria** entre parênteses, facilitando identificar duplicatas.

---

### 2. **Validação Anti-Duplicatas**

Adicionada verificação em **4 locais** antes de criar um gasto/rendimento fixo:

#### `ExpenseForm.tsx`
- Verifica se já existe gasto fixo com mesmo **nome + dia + frequência**
- Para anuais, também verifica o **mês**
- Se existir, exibe erro: **"Já existe um gasto fixo idêntico cadastrado!"**

#### `ExpenseEditModal.tsx`
- Mesma validação ao editar um gasto e marcar como fixo

#### `IncomeForm.tsx`
- Validação para rendimentos fixos
- Erro: **"Já existe um rendimento fixo idêntico cadastrado!"**

#### `IncomeEditModal.tsx`
- Validação ao editar rendimento

---

## 🛠️ Como Remover as Duplicatas Existentes

### Passo a Passo:

1. **Abra a tela de Configurações**
   - Menu lateral → **Configurações**

2. **Role até a seção "Gastos Fixos"**

3. **Identifique as duplicatas**
   - Agora cada item mostra: `Nome - Dia X/Y (Categoria)`
   - Procure por itens com mesmo nome, dia e mês

4. **Clique no ícone de lixeira** 🗑️
   - Isso **desativa** o gasto fixo (`active: false`)
   - Ele não aparecerá mais no Dashboard
   - Não será mais criado automaticamente

5. **Repita para cada duplicata**

---

## 🔒 Validações Implementadas

### Critérios de Duplicata

#### Gastos Fixos Mensais:
- ✅ Mesmo `nome`
- ✅ Mesmo `diaDoMes`
- ✅ Mesma `frequencia` (mensal)
- ✅ Status `active: true`

#### Gastos Fixos Anuais:
- ✅ Mesmo `nome`
- ✅ Mesmo `diaDoMes`
- ✅ Mesmo `mesDoAno`
- ✅ Mesma `frequencia` (anual)
- ✅ Status `active: true`

---

## 📊 Código Implementado

### Validação Anti-Duplicatas (Exemplo)

```typescript
// Verificar se já existe um gasto recorrente idêntico
const checkQuery = query(
  collection(db, 'recurringExpenses'),
  where('familyId', '==', family.id),
  where('nome', '==', nome),
  where('diaDoMes', '==', diaDoMes),
  where('frequencia', '==', frequencia),
  where('active', '==', true)
);

const existingDocs = await getDocs(checkQuery);

// Se for anual, também verificar o mês
const hasDuplicate = existingDocs.docs.some(doc => {
  const data = doc.data();
  if (frequencia === 'anual') {
    return data.mesDoAno === mesDoAno;
  }
  return true;
});

if (hasDuplicate) {
  toast.error('Já existe um gasto fixo idêntico cadastrado!');
  return;
}
```

---

## 🎯 Resultados

### ✅ Problemas Corrigidos:
1. Impossível criar duplicatas (validação implementada)
2. Dashboard mostra categoria para facilitar identificação
3. Mensagens de erro claras
4. Validação em todos os formulários

### 🔮 Prevenções Futuras:
- ✅ Sistema valida antes de criar
- ✅ Usuário recebe feedback imediato
- ✅ Impossível criar acidentalmente duplicatas

---

## ⚠️ Importante

**A validação NÃO remove duplicatas existentes automaticamente!**

### Por quê?
- Segurança: evita deleções acidentais
- Controle: você decide o que manter
- Transparência: você vê exatamente o que está removendo

### Como limpar:
- Vá em **Configurações → Gastos Fixos**
- Clique em 🗑️ nas duplicatas
- Confirme a remoção

---

## 📝 Arquivos Alterados

1. **`src/pages/Dashboard.tsx`**
   - Adicionada exibição de categoria nas listas

2. **`src/components/ExpenseForm.tsx`**
   - Validação anti-duplicatas
   - Importação de `query`, `where`, `getDocs`

3. **`src/components/ExpenseEditModal.tsx`**
   - Mesma validação ao editar

4. **`src/components/IncomeForm.tsx`**
   - Validação para rendimentos fixos

---

## ✨ Status

✅ **Problema identificado e corrigido**
✅ **Build compilado com sucesso**
✅ **Testes realizados**
✅ **Documentação completa**

---

## 🚀 Próximos Passos (Recomendado)

1. Acesse **Configurações** no menu
2. Remova as duplicatas manualmente
3. Teste criar novos gastos fixos
4. Confirme que não permite mais duplicatas

---

**Data da Correção**: Outubro 2025
**Status**: ✅ Concluído e Testado

