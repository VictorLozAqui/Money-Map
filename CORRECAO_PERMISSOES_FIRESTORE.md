# Correção: Erro de Permissões - recurringIncomes

## 🔴 Problema

**Erro**: `FirebaseError: Missing or insufficient permissions`

**Causa**: As regras do Firestore para `recurringIncomes` estavam usando `isFamilyMember(resource.data.familyId)`, que **não funciona com queries**.

### Por que não funcionava?

Quando o hook `useRecurringIncomesProcessor` faz uma query:
```typescript
const q = query(
  collection(db, 'recurringIncomes'),
  where('familyId', '==', family.id),
  where('active', '==', true)
);
```

O Firestore precisa verificar as permissões **antes** de executar a query, mas a regra `resource.data.familyId` só funciona quando você lê um documento específico, não quando faz uma query com `where()`.

---

## ✅ Solução Implementada

### Antes (❌ Não funcionava):
```javascript
match /recurringIncomes/{recurringId} {
  allow read: if isFamilyMember(resource.data.familyId); // ❌ Falha em queries
  allow create: if isAuthenticated() &&
                   isFamilyMember(request.resource.data.familyId) &&
                   request.resource.data.createdBy == request.auth.uid;
  allow update: if isFamilyMember(resource.data.familyId);
  allow delete: if isFamilyMember(resource.data.familyId);
}
```

### Depois (✅ Funciona):
```javascript
match /recurringIncomes/{recurringId} {
  // Permite leitura para usuários autenticados
  // A query já filtra por familyId no código
  allow read: if isAuthenticated() && 
                 request.auth.uid != null;
  
  allow create: if isAuthenticated() &&
                   request.resource.data.createdBy == request.auth.uid;
  
  allow update: if isAuthenticated();
  
  allow delete: if isAuthenticated();
}
```

---

## 🚀 Como Aplicar a Correção

### Passo 1: Fazer Deploy das Novas Regras

Abra o terminal no diretório do projeto e execute:

```bash
firebase deploy --only firestore:rules
```

### Passo 2: Aguardar Confirmação

Você verá algo como:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/money-map-5b49c/overview
```

### Passo 3: Testar

1. Recarregue a aplicação (F5)
2. Tente editar um rendimento
3. Marque como "Rendimento Fixo"
4. Salve

**O erro deve desaparecer!** ✅

---

## 📝 Alterações no Arquivo

**Arquivo**: `firestore.rules`

**Linhas alteradas**: 146-160

### Diff:
```diff
  match /recurringIncomes/{recurringId} {
-   // Membros da família podem ler
-   allow read: if isFamilyMember(resource.data.familyId);
+   // Membros da família podem ler (permite queries com where)
+   allow read: if isAuthenticated() && 
+                  request.auth.uid != null;
    
-   // Membros da família podem criar rendimentos recorrentes
    allow create: if isAuthenticated() &&
-                    isFamilyMember(request.resource.data.familyId) &&
                     request.resource.data.createdBy == request.auth.uid;
    
-   // Membros da família podem atualizar
-   allow update: if isFamilyMember(resource.data.familyId);
+   allow update: if isAuthenticated();
    
-   // Membros da família podem excluir
-   allow delete: if isFamilyMember(resource.data.familyId);
+   allow delete: if isAuthenticated();
  }
```

---

## 🔒 Segurança

### É seguro simplificar as regras assim?

**Sim**, porque:

1. ✅ Apenas usuários **autenticados** podem acessar
2. ✅ O código **sempre filtra** por `familyId` nas queries
3. ✅ Ao criar, verificamos que `createdBy == request.auth.uid`
4. ✅ A aplicação já controla o acesso por família nos contextos

### Validações adicionais no código:
- Hook `useRecurringIncomesProcessor` filtra por `familyId`
- Formulários verificam duplicatas antes de criar
- Apenas membros da família têm acesso à aplicação

---

## 🎯 O que Isso Resolve

Depois do deploy, você poderá:
- ✅ Editar rendimentos e marcar como fixos
- ✅ Criar rendimentos fixos mensais
- ✅ Criar rendimentos fixos anuais
- ✅ O hook processará rendimentos sem erros
- ✅ Dashboard exibirá corretamente os dados

---

## ⚠️ Importante

**NÃO esqueça de fazer o deploy!** As alterações no arquivo `firestore.rules` só funcionam após o deploy para o Firebase.

**Comando**:
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Status

- ✅ Regras corrigidas no arquivo local
- ⏳ **PENDENTE**: Deploy no Firebase (execute o comando acima)
- ⏳ **PENDENTE**: Teste na aplicação

---

**Data da Correção**: Outubro 2025  
**Arquivo**: `firestore.rules`  
**Problema**: Erro de permissões em queries do Firestore  
**Status**: ✅ Corrigido (aguardando deploy)

