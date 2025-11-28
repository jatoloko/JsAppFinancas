# 🚀 Guia de Instalação

## Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## Passos para Instalação

### 1️⃣ Instalar dependências do Backend

Na pasta raiz do projeto, execute:

```bash
npm install
```

### 2️⃣ Instalar dependências do Frontend

```bash
cd client
npm install
cd ..
```

## 🎯 Como Executar

### Modo Desenvolvimento (Recomendado)

Execute ambos (backend e frontend) simultaneamente:

```bash
npm run dev
```

Isso iniciará:
- ✅ Backend na porta 3001: http://localhost:3001
- ✅ Frontend na porta 5173: http://localhost:5173

### Executar Separadamente

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run client
```

## 📱 Como Usar

1. Abra o navegador em http://localhost:5173
2. Use os filtros de mês/ano para visualizar transações de períodos específicos
3. Clique em "Nova Transação" para adicionar receitas ou despesas
4. Navegue entre as abas Dashboard e Transações
5. Edite ou delete transações conforme necessário

## 🗄️ Banco de Dados

O aplicativo usa SQLite, e o arquivo do banco de dados (`financas.db`) será criado automaticamente na raiz do projeto quando você iniciar o servidor pela primeira vez.

## 🛠️ Solução de Problemas

### Erro de porta em uso

Se a porta 3001 ou 5173 já estiver em uso, você pode:

1. Encerrar o processo que está usando a porta
2. Ou modificar a porta nos arquivos de configuração:
   - Backend: `server/index.js` (linha `const PORT = ...`)
   - Frontend: `client/vite.config.ts` (linha `port: ...`)

### Erro ao conectar com o backend

Certifique-se de que:
- O servidor backend está rodando na porta 3001
- Não há firewall bloqueando a conexão
- As dependências foram instaladas corretamente

## 📦 Build para Produção

```bash
cd client
npm run build
cd ..
```

Os arquivos de produção estarão em `client/dist/`

## 🎨 Personalização

### Adicionar novas categorias

Edite o arquivo `client/src/types.ts` e adicione as categorias desejadas em:
- `CATEGORIAS_RECEITA` (para receitas)
- `CATEGORIAS_DESPESA` (para despesas)

### Mudar cores

Edite as variáveis CSS em `client/src/index.css` na seção `:root`

## 📄 Licença

ISC

