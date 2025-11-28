# 📦 Como Usar o App de Finanças

## 🚀 Instalação Rápida

### 1. Instalar Dependências do Backend

Abra um terminal na pasta raiz do projeto e execute:

```bash
npm install
```

### 2. Instalar Dependências do Frontend

```bash
cd client
npm install
cd ..
```

## ▶️ Executar o Aplicativo

### Opção 1: Executar Tudo de Uma Vez (Recomendado)

Na pasta raiz do projeto, execute:

```bash
npm run dev
```

Isso iniciará:
- ✅ Backend na porta 3001
- ✅ Frontend na porta 5173

### Opção 2: Executar Separadamente

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## 🌐 Acessar o Aplicativo

Abra seu navegador em: **http://localhost:5173**

## 📋 Funcionalidades

- ✅ Dashboard com estatísticas e gráficos
- ✅ Cadastro de receitas e despesas
- ✅ Gerenciamento de categorias e subcategorias
- ✅ Busca e filtros avançados
- ✅ Agrupamento de transações por data
- ✅ Indicadores de tendência mensal

## 💾 Banco de Dados

O banco de dados SQLite (`financas.db`) será criado automaticamente na primeira execução.

## ⚠️ Requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## 🆘 Problemas?

Se a porta 3001 ou 5173 estiver em uso, você pode:
1. Encerrar o processo que está usando a porta
2. Ou modificar as portas nos arquivos de configuração

---

**Desenvolvido com ❤️ usando React + TypeScript + Node.js + SQLite**

