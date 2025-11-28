# 📁 Estrutura do Projeto

```
Projeto App de Finanças/
│
├── 📄 package.json              # Dependências e scripts do backend
├── 📄 README.md                 # Documentação principal
├── 📄 INSTALACAO.md            # Guia de instalação
├── 📄 .gitignore               # Arquivos ignorados pelo Git
│
├── 📁 server/
│   └── 📄 index.js             # Servidor Express + API REST + SQLite
│
└── 📁 client/                   # Frontend React
    ├── 📄 package.json          # Dependências do frontend
    ├── 📄 vite.config.ts        # Configuração do Vite
    ├── 📄 tsconfig.json         # Configuração do TypeScript
    ├── 📄 index.html            # HTML principal
    │
    ├── 📁 public/
    │   └── 📄 icon.svg          # Ícone do app
    │
    └── 📁 src/
        ├── 📄 main.tsx          # Entry point do React
        ├── 📄 App.tsx           # Componente principal
        ├── 📄 index.css         # Estilos globais
        ├── 📄 types.ts          # Tipos TypeScript
        ├── 📄 api.ts            # Cliente API (axios)
        ├── 📄 utils.ts          # Funções utilitárias
        │
        └── 📁 components/
            ├── 📄 Dashboard.tsx          # Dashboard com estatísticas
            ├── 📄 ListaTransacoes.tsx    # Lista de transações
            ├── 📄 FormularioTransacao.tsx # Formulário add/edit
            └── 📄 Modal.tsx              # Componente modal
```

## 🎯 Funcionalidades Implementadas

### Backend (Node.js + Express + SQLite)

✅ **API REST completa**
- `GET /api/transacoes` - Listar transações (com filtro por mês/ano)
- `GET /api/transacoes/:id` - Obter transação específica
- `POST /api/transacoes` - Criar nova transação
- `PUT /api/transacoes/:id` - Atualizar transação
- `DELETE /api/transacoes/:id` - Deletar transação
- `GET /api/estatisticas` - Obter estatísticas gerais
- `GET /api/estatisticas/categorias` - Obter estatísticas por categoria

✅ **Banco de Dados SQLite**
- Criação automática da tabela
- Armazenamento persistente
- Consultas otimizadas

### Frontend (React + TypeScript + Vite)

✅ **Dashboard Interativo**
- Cards com saldo, receitas e despesas
- Gráficos de categorias (receitas e despesas)
- Porcentagens por categoria
- Barras de progresso visuais

✅ **Gerenciamento de Transações**
- Lista completa de transações
- Adicionar novas transações
- Editar transações existentes
- Deletar transações
- Confirmação antes de deletar

✅ **Filtros e Navegação**
- Filtro por mês e ano
- Navegação por abas (Dashboard / Transações)
- Atualização automática dos dados

✅ **Interface Moderna**
- Design responsivo (mobile-friendly)
- Animações suaves
- Cores diferenciadas para receitas/despesas
- Modal para formulários
- Loading states
- Estados vazios informativos

✅ **Categorias Pré-definidas**

**Receitas:**
- Salário
- Freelance
- Investimentos
- Vendas
- Presente
- Reembolso
- Outros

**Despesas:**
- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Contas
- Impostos
- Outros

## 🎨 Design

- **Paleta de Cores**: Roxo/Azul moderno
- **Ícones**: Emojis para melhor UX
- **Formatação**: Real brasileiro (R$)
- **Datas**: Formato brasileiro (dd/mm/yyyy)
- **Responsivo**: Funciona em desktop e mobile

## 🔧 Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- SQLite3
- CORS
- Body-parser

### Frontend
- React 18
- TypeScript
- Vite
- Axios
- CSS moderno (Flexbox/Grid)

## 💾 Modelo de Dados

### Tabela: transacoes

| Campo       | Tipo     | Descrição                    |
|-------------|----------|------------------------------|
| id          | INTEGER  | Chave primária (auto)        |
| tipo        | TEXT     | "receita" ou "despesa"       |
| categoria   | TEXT     | Categoria da transação       |
| valor       | REAL     | Valor em reais               |
| descricao   | TEXT     | Descrição opcional           |
| data        | TEXT     | Data no formato ISO          |
| criado_em   | DATETIME | Data de criação (auto)       |

## 🚀 Próximas Melhorias Possíveis

- [ ] Exportar relatórios em PDF/Excel
- [ ] Gráficos mais avançados (Chart.js)
- [ ] Múltiplas contas bancárias
- [ ] Metas financeiras
- [ ] Notificações de gastos
- [ ] Autenticação de usuários
- [ ] Backup automático
- [ ] Dark mode
- [ ] PWA (Progressive Web App)
- [ ] Recorrência de transações

