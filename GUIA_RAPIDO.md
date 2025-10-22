# Guia Rápido - Money Map

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Firebase

#### 2.1 Criar Projeto Firebase
1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Siga o assistente de criação

#### 2.2 Ativar Authentication
1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Ative o provedor "Email/senha"

#### 2.3 Criar Firestore Database
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione "Iniciar no modo de produção"
4. Escolha uma localização

#### 2.4 Obter Credenciais
1. Vá em "Configurações do projeto" (ícone de engrenagem)
2. Role até "Seus aplicativos"
3. Clique no ícone da Web `</>`
4. Registre o app
5. Copie as credenciais do `firebaseConfig`

#### 2.5 Configurar Credenciais no Projeto
Edite o arquivo `src/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "cole_sua_api_key_aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 3. Configurar Regras do Firestore

#### 3.1 No Console Firebase
1. Vá em "Firestore Database"
2. Clique na aba "Regras"
3. Copie o conteúdo do arquivo `firestore.rules` deste projeto
4. Cole no editor de regras
5. Clique em "Publicar"

#### 3.2 Criar Índices
Os índices serão criados automaticamente quando você tentar fazer a primeira consulta. Ou você pode criá-los manualmente:

1. Vá em "Firestore Database" > "Índices"
2. Clique em "Adicionar índice"

**Índice para Incomes:**
- Coleção: `incomes`
- Campos a indexar:
  - `familyId`: Crescente
  - `data`: Decrescente
- Status da consulta: Ativado

**Índice para Expenses:**
- Coleção: `expenses`
- Campos a indexar:
  - `familyId`: Crescente
  - `data`: Decrescente
- Status da consulta: Ativado

### 4. Executar o Projeto
```bash
npm run dev
```

Acesse: http://localhost:5173

## 📱 Como Usar

### Primeiro Acesso

1. **Criar Conta**
   - Clique em "Não tem uma conta? Cadastre-se"
   - Digite seu nome, email e senha
   - Clique em "Criar Conta"

2. **Criar Núcleo Familiar**
   - Após o login, você será redirecionado para criar uma família
   - Digite o nome da sua família (ex: "Família Silva")
   - Clique em "Criar Família"
   - Um código será gerado automaticamente

3. **Convidar Membros**
   - Vá na página "Família"
   - Copie o código da família
   - Compartilhe com outros membros
   - Eles devem criar uma conta e usar o código em "Entrar em Família"

### Adicionar Rendimentos

1. Vá na página "Rendimentos"
2. Clique em "Adicionar Rendimento"
3. Preencha:
   - Nome (ex: "Salário João")
   - Valor
   - Data
4. Clique em "Salvar"

### Adicionar Gastos

1. Vá na página "Gastos"
2. Clique em "Adicionar Gasto"
3. Preencha:
   - Nome (ex: "Supermercado")
   - Valor
   - Categoria (Alimentação, Transporte, etc.)
   - Data
4. Clique em "Salvar"

### Visualizar Dashboard

1. Vá na página "Dashboard"
2. Veja as métricas:
   - Total de Rendimentos
   - Total de Gastos
   - Saldo
3. Visualize os gráficos:
   - Gastos por Categoria (Pizza)
   - Evolução Financeira (Linha)

### Alterar Senha

1. Vá na página "Perfil"
2. Preencha:
   - Senha Atual
   - Nova Senha
   - Confirmar Nova Senha
3. Clique em "Alterar Senha"

## 🎨 Categorias de Gastos Disponíveis

- Alimentação
- Transporte
- Saúde
- Educação
- Lazer
- Moradia
- Vestuário
- Serviços
- Outros

## ⚠️ Solução de Problemas

### Erro: "Usuário não autenticado"
- Faça logout e login novamente

### Erro: "Família não encontrada"
- Verifique se o código está correto
- Peça um novo código para o membro da família

### Erro ao adicionar rendimento/gasto
- Verifique se você está em uma família
- Verifique se os campos estão preenchidos corretamente

### Gráficos não aparecem
- Adicione pelo menos um rendimento e um gasto
- Aguarde alguns segundos para os dados carregarem

## 📞 Estrutura de Dados

### Usuário
```json
{
  "uid": "identificador_unico",
  "email": "usuario@email.com",
  "nome": "Nome do Usuário",
  "familyId": "id_da_familia"
}
```

### Família
```json
{
  "id": "family_uid_timestamp",
  "nome": "Família Silva",
  "createdBy": "uid_do_criador",
  "createdAt": "2025-01-01T00:00:00Z",
  "members": ["uid1", "uid2"]
}
```

### Rendimento
```json
{
  "id": "id_auto_gerado",
  "familyId": "id_da_familia",
  "nome": "Salário",
  "valor": 5000.00,
  "data": "2025-01-01T00:00:00Z",
  "addedBy": "uid_do_usuario",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### Gasto
```json
{
  "id": "id_auto_gerado",
  "familyId": "id_da_familia",
  "nome": "Supermercado",
  "valor": 350.00,
  "tipo": "Alimentação",
  "data": "2025-01-01T00:00:00Z",
  "addedBy": "uid_do_usuario",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

## 🔒 Segurança

- Todas as rotas são protegidas por autenticação
- Apenas membros da família podem ver os dados financeiros
- As senhas são criptografadas pelo Firebase
- As regras do Firestore garantem acesso apenas aos dados da própria família

## 🛠️ Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS
- **Backend:** Firebase (Authentication + Firestore)
- **Gráficos:** Recharts
- **Formulários:** React Hook Form + Zod
- **Roteamento:** React Router DOM v6
- **Notificações:** React Hot Toast
- **Ícones:** Lucide React
- **Datas:** date-fns

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

Para testar a build localmente:
```bash
npm run preview
```

