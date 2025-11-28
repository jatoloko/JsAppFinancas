# 🚀 Configuração do Supabase - App de Finanças

## 1. Criar Conta e Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `app-financas` (ou outro nome)
   - **Database Password:** Escolha uma senha forte
   - **Region:** Escolha a mais próxima (ex: South America)
4. Clique em **"Create new project"**
5. Aguarde a criação (pode levar alguns minutos)

## 2. Criar as Tabelas

1. No dashboard do Supabase, vá em **"SQL Editor"** (menu lateral)
2. Clique em **"New query"**
3. Cole o conteúdo do arquivo `supabase-setup.sql`
4. Clique em **"Run"** (ou Ctrl+Enter)
5. Verifique se aparece "Success" ✅

## 3. Obter as Credenciais

1. Vá em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"API"** no menu lateral
3. Copie:
   - **Project URL** → será `SUPABASE_URL`
   - **anon/public key** → será `SUPABASE_ANON_KEY`

## 4. Configurar no Vercel

1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Vá em **"Settings"** → **"Environment Variables"**
3. Adicione as variáveis:

| Nome | Valor |
|------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` (a chave anon) |

4. Clique em **"Save"**

## 5. Redeploy

1. Vá em **"Deployments"**
2. Clique nos 3 pontinhos (...) do último deploy
3. Selecione **"Redeploy"**

## 🎉 Pronto!

Após o redeploy, seu app estará funcionando com Supabase!

---

## Verificar se Funcionou

1. Acesse seu app no Vercel
2. O dashboard deve carregar sem erros
3. Tente adicionar uma transação de teste

---

## Troubleshooting

### Erro "SUPABASE_URL não configurada"
- Verifique se as variáveis de ambiente estão corretas no Vercel
- Faça redeploy após adicionar as variáveis

### Erro "relation does not exist"
- Execute o SQL de setup no Supabase SQL Editor
- Verifique se as tabelas foram criadas em **"Table Editor"**

### Erro de permissão
- Verifique se as políticas RLS foram criadas
- Ou desabilite RLS temporariamente para testes

---

## Comandos SQL Úteis

```sql
-- Ver todas as tabelas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Ver categorias
SELECT * FROM categorias;

-- Ver transações
SELECT * FROM transacoes ORDER BY data DESC;

-- Limpar todas as transações (cuidado!)
DELETE FROM transacoes;
```

