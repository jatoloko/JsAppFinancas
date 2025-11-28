# 🚀 Deploy no Vercel - App de Finanças

## Pré-requisitos

1. Uma conta no [Vercel](https://vercel.com)
2. Uma conta no GitHub (opcional, mas recomendado)

## Passo a Passo

### 1. Criar Repositório no GitHub

```bash
git init
git add .
git commit -m "Preparando para deploy no Vercel"
git remote add origin https://github.com/SEU_USUARIO/app-financas.git
git push -u origin main
```

### 2. Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Importe seu repositório do GitHub
4. O Vercel detectará automaticamente as configurações

### 3. Configurar Banco de Dados Postgres

1. No dashboard do seu projeto no Vercel, vá em **"Storage"**
2. Clique em **"Create Database"**
3. Selecione **"Postgres"** (Neon)
4. Escolha um nome para o banco (ex: `financas-db`)
5. Clique em **"Create"**

O Vercel automaticamente adicionará as variáveis de ambiente necessárias:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 4. Inicializar o Banco de Dados

Após criar o banco, execute o setup inicial:

1. No Vercel, vá em **"Settings"** > **"Functions"**
2. Acesse a URL: `https://SEU-PROJETO.vercel.app/api/transacoes`
3. Isso irá criar automaticamente as tabelas e categorias padrão

OU execute localmente (com as variáveis de ambiente configuradas):

```bash
cd api
npm install
node setup-db.js
```

### 5. Deploy

O Vercel fará deploy automático a cada push no repositório.

Para deploy manual:

```bash
npm install -g vercel
vercel
```

## Variáveis de Ambiente (Automáticas)

As seguintes variáveis são configuradas automaticamente pelo Vercel Postgres:

| Variável | Descrição |
|----------|-----------|
| `POSTGRES_URL` | URL de conexão do banco |
| `POSTGRES_HOST` | Host do banco de dados |
| `POSTGRES_USER` | Usuário do banco |
| `POSTGRES_PASSWORD` | Senha do banco |
| `POSTGRES_DATABASE` | Nome do banco |

## Estrutura do Projeto para Vercel

```
app-financas/
├── api/                    # Serverless Functions
│   ├── lib/
│   │   └── db.js          # Configuração do banco
│   ├── transacoes/
│   │   ├── index.js       # GET/POST /api/transacoes
│   │   └── [id].js        # GET/PUT/DELETE /api/transacoes/:id
│   ├── estatisticas/
│   │   ├── index.js       # GET /api/estatisticas
│   │   ├── categorias.js  # GET /api/estatisticas/categorias
│   │   └── mes-anterior.js # GET /api/estatisticas/mes-anterior
│   ├── categorias/
│   │   ├── index.js       # GET/POST /api/categorias
│   │   └── [id].js        # GET/PUT/DELETE /api/categorias/:id
│   ├── subcategorias/
│   │   ├── index.js       # GET/POST /api/subcategorias
│   │   └── [id].js        # GET/PUT/DELETE /api/subcategorias/:id
│   ├── setup-db.js        # Script de setup do banco
│   └── package.json
├── client/                 # Frontend React
│   ├── src/
│   ├── dist/              # Build de produção
│   └── ...
├── vercel.json            # Configuração do Vercel
└── ...
```

## Comandos Úteis

```bash
# Instalar CLI do Vercel
npm install -g vercel

# Login no Vercel
vercel login

# Deploy de preview
vercel

# Deploy de produção
vercel --prod

# Ver logs
vercel logs

# Listar projetos
vercel ls
```

## Troubleshooting

### Erro de conexão com banco
- Verifique se o Postgres foi criado corretamente no Vercel Storage
- Confirme que as variáveis de ambiente estão configuradas

### Build falhando
- Verifique se as dependências estão corretas
- Rode `npm run build` localmente para identificar erros

### API não responde
- Verifique os logs no dashboard do Vercel
- Confirme que as rotas estão corretas em `/api/`

## Suporte

Para mais informações, consulte:
- [Documentação do Vercel](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

