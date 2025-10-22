# Money Map

Aplicação web para controle financeiro colaborativo entre membros de uma família.

## Tecnologias Utilizadas

- React 18 com TypeScript
- Vite
- Tailwind CSS
- Firebase (Authentication + Firestore)
- Recharts (Gráficos)
- React Router DOM
- React Hook Form + Zod
- date-fns

## Funcionalidades

- ✅ Autenticação com email e senha
- ✅ Alterar senha do usuário
- ✅ Criar núcleo familiar
- ✅ Convidar membros via código familiar
- ✅ Gerenciar rendimentos (adicionar, listar, excluir)
- ✅ Gerenciar gastos com categorias (adicionar, listar, excluir)
- ✅ Dashboard com métricas e gráficos
- ✅ Gráfico de pizza: gastos por categoria
- ✅ Gráfico de linhas: evolução financeira
- ✅ Visualizar membros da família
- ✅ Design responsivo


## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── charts/         # Componentes de gráficos
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── ...
├── contexts/           # Contextos React (Auth, Family)
├── hooks/             # Custom hooks
├── pages/             # Páginas da aplicação
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Incomes.tsx
│   ├── Expenses.tsx
│   ├── Family.tsx
│   ├── Profile.tsx
│   └── FamilySetup.tsx
├── services/          # Serviços (Firebase)
├── types/             # Tipos TypeScript
├── App.tsx            # Componente principal
└── main.tsx           # Entry point
```

## Fluxo de Uso

1. **Novo Usuário:**
   - Registrar conta com email e senha
   - Criar novo núcleo familiar ou entrar em um existente usando código
   - Adicionar rendimentos e gastos
   - Visualizar dashboard com métricas e gráficos

2. **Convidar Membros:**
   - Ir em "Família"
   - Copiar o código da família
   - Compartilhar com outros membros
   - Novos membros devem criar conta e usar o código em "Entrar em Família"

3. **Gerenciar Finanças:**
   - Adicionar rendimentos com nome e valor
   - Adicionar gastos com nome, valor e categoria
   - Visualizar gráficos e relatórios no dashboard
   - Todos os membros da família podem adicionar e visualizar dados



## 🔒 Segurança

Este projeto segue as boas práticas de segurança:

- ✅ Credenciais em variáveis de ambiente (`.env`)
- ✅ Arquivo `.env` não é commitado (protegido pelo `.gitignore`)
- ✅ Regras de segurança do Firestore
- ✅ Autenticação obrigatória
- ✅ Acesso apenas aos dados da própria família
- ✅ Validações client-side e server-side

Para mais detalhes, consulte o arquivo `SEGURANCA.md`.


## Licença

MIT

