# 💰 App de Controle Financeiro

Aplicativo completo para gerenciar suas finanças pessoais com interface moderna e intuitiva.

## 🎯 Funcionalidades Principais

- 📊 **Dashboard Interativo** - Visualize suas estatísticas com gráficos e indicadores de tendência
- 💸 **Gestão de Transações** - Adicione, edite e exclua receitas e despesas
- 🏷️ **Categorias e Subcategorias** - Organize suas transações de forma hierárquica
- 🔍 **Busca e Filtros** - Encontre transações rapidamente com busca inteligente
- 📅 **Agrupamento por Data** - Visualize transações agrupadas (Hoje, Ontem, Esta Semana, etc.)
- 📈 **Indicadores de Tendência** - Compare o mês atual com o anterior

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite
- **Estilização**: CSS Moderno

## 📦 Instalação

### 1. Instalar dependências do backend:
```bash
npm install
```

### 2. Instalar dependências do frontend:
```bash
cd client
npm install
cd ..
```

## ▶️ Executar

### Opção 1: Tudo de uma vez (Recomendado)
```bash
npm run dev
```

### Opção 2: Separadamente

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## 🌐 Acessar

Abra seu navegador em: **http://localhost:5173**

## 📁 Estrutura do Projeto

```
Projeto App de Finanças/
├── server/          # Backend (Node.js + Express + SQLite)
├── client/          # Frontend (React + TypeScript + Vite)
│   ├── src/         # Código fonte
│   └── dist/        # Build de produção (gerado após npm run build)
├── package.json     # Dependências do backend
└── README.md        # Documentação
```

## 💾 Banco de Dados

O banco de dados SQLite (`financas.db`) é criado automaticamente na primeira execução.

## ⚠️ Requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🎨 Características Visuais

- Design moderno baseado em cards (estilo Mobills)
- Animações suaves
- Interface responsiva
- Feedback visual em tempo real
- Toast notifications

## 📝 Notas

- O build de produção está na pasta `client/dist/`
- Para produção, você pode servir os arquivos estáticos de `client/dist/`
- O backend precisa estar rodando para o frontend funcionar completamente

---

**Desenvolvido com ❤️**

