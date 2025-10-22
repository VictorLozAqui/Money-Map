# 🔒 Guia de Segurança - Money Map

## Variáveis de Ambiente

As credenciais do Firebase são armazenadas em variáveis de ambiente para maior segurança.

### Estrutura

**Arquivo: `.env`** (na raiz do projeto)
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_DATABASE_URL=sua_database_url
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

### Por que usar variáveis de ambiente?

✅ **Segurança**: Credenciais não ficam hardcoded no código  
✅ **Git**: Arquivo `.env` está no `.gitignore` e não é commitado  
✅ **Flexibilidade**: Fácil trocar entre ambientes (dev, staging, prod)  
✅ **Boas práticas**: Padrão da indústria para gerenciar credenciais  

## Arquivos Importantes

### ✅ Protegidos pelo `.gitignore`

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

Estes arquivos **NUNCA** serão commitados no Git.

### 📄 Arquivo de Template

**`.env.example`** - Este arquivo é commitado e serve como referência:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
...
```

## Como Funciona

### 1. Vite lê as variáveis
Vite automaticamente carrega variáveis que começam com `VITE_` do arquivo `.env`.

### 2. TypeScript tem os tipos
No arquivo `src/vite-env.d.ts`, definimos os tipos:
```typescript
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  // ...
}
```

### 3. Firebase usa as variáveis
No arquivo `src/services/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

## Regras de Segurança do Firestore

As regras do Firestore garantem que:

✅ Apenas usuários autenticados podem acessar dados  
✅ Usuários só veem dados da própria família  
✅ Validações são feitas no servidor  
✅ Não é possível deletar usuários ou famílias  



## Boas Práticas Implementadas

### ✅ No Frontend

1. **Variáveis de Ambiente**
   - Credenciais em `.env`
   - Não commitadas no Git
   - Tipadas com TypeScript

2. **Autenticação**
   - Rotas protegidas com `PrivateRoute`
   - Guarda de família com `FamilyGuard`
   - Logout seguro

3. **Validação**
   - Validação client-side (UX)
   - Validação server-side (segurança)

### ✅ No Backend (Firebase)

1. **Authentication**
   - Email/senha criptografados
   - Tokens JWT
   - Sessões seguras

2. **Firestore Rules**
   - Validação de acesso
   - Verificação de membros
   - Proteção de dados

3. **Índices**
   - Performance otimizada
   - Queries seguras

## Deployment em Produção

### Variáveis de Ambiente em Produção

Dependendo da plataforma:

#### Vercel
```bash
vercel env add VITE_FIREBASE_API_KEY
```

#### Netlify
1. Site Settings → Environment Variables
2. Adicionar cada variável manualmente

#### Firebase Hosting
```bash
firebase functions:config:set firebase.api_key="sua_key"
```

#### Render
1. Dashboard → Environment
2. Adicionar variáveis



## O que NUNCA fazer

❌ **Commitar** credenciais no Git  
❌ **Compartilhar** o arquivo `.env` publicamente  
❌ **Desativar** as regras de segurança  
❌ **Usar** `allow read, write: if true;` em produção  
❌ **Expor** API keys em código client-side não criptografado  
❌ **Ignorar** alertas de segurança do Firebase  

## O que SEMPRE fazer

✅ **Usar** variáveis de ambiente  
✅ **Manter** `.env` no `.gitignore`  
✅ **Ativar** autenticação de dois fatores na conta Google  
✅ **Revisar** regras de segurança regularmente  
✅ **Monitorar** uso e anomalias no Firebase Console  
✅ **Atualizar** dependências regularmente  
✅ **Fazer** backup dos dados importantes  

## Verificação de Segurança



## Recuperação de Incidente

Se você acidentalmente commitou credenciais:

1. **IMEDIATO**: Rotacionar todas as credenciais no Firebase Console
2. Remover do histórico do Git:
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```
3. Force push (cuidado!):
```bash
git push origin --force --all
```
4. Notificar a equipe
5. Verificar logs de acesso no Firebase

## Monitoramento

### Firebase Console

Monitore regularmente:
- **Authentication**: Novos logins suspeitos
- **Firestore**: Leituras/escritas anormais
- **Usage**: Picos de uso inesperados

### Alertas

Configure alertas para:
- Tentativas de login falhas
- Uso acima do esperado
- Erros de regras de segurança

## Recursos

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OWASP Security Guidelines](https://owasp.org/)

## Suporte

Se encontrar problemas de segurança:
1. Não exponha publicamente
2. Rotacione credenciais imediatamente
3. Revise logs de acesso
4. Atualize regras se necessário

---

**Lembre-se**: Segurança é um processo contínuo, não um destino! 🔒

