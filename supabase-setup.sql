-- =============================================
-- SQL para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Subcategorias
CREATE TABLE IF NOT EXISTS subcategorias (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transacoes (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  subcategoria_id INTEGER,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias(tipo);
CREATE INDEX IF NOT EXISTS idx_subcategorias_categoria ON subcategorias(categoria_id);

-- Habilitar Row Level Security (RLS) - Opcional
-- Se quiser que qualquer um possa ler/escrever (para testes):
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (para desenvolvimento/testes)
CREATE POLICY "Permitir tudo para categorias" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para subcategorias" ON subcategorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo para transacoes" ON transacoes FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Categorias padrão (opcional - o app insere automaticamente)
-- =============================================

-- Categorias de Receita
INSERT INTO categorias (nome, tipo) VALUES 
  ('Salário', 'receita'),
  ('Freelance', 'receita'),
  ('Investimentos', 'receita'),
  ('Vendas', 'receita'),
  ('Presente', 'receita'),
  ('Reembolso', 'receita'),
  ('Outros', 'receita')
ON CONFLICT DO NOTHING;

-- Categorias de Despesa
INSERT INTO categorias (nome, tipo) VALUES 
  ('Alimentação', 'despesa'),
  ('Transporte', 'despesa'),
  ('Moradia', 'despesa'),
  ('Saúde', 'despesa'),
  ('Educação', 'despesa'),
  ('Lazer', 'despesa'),
  ('Compras', 'despesa'),
  ('Contas', 'despesa'),
  ('Impostos', 'despesa'),
  ('Outros', 'despesa')
ON CONFLICT DO NOTHING;

