import { sql } from '@vercel/postgres';

async function setupDatabase() {
  console.log('🔧 Iniciando setup do banco de dados...');

  try {
    // Criar tabela de transações
    await sql`
      CREATE TABLE IF NOT EXISTS transacoes (
        id SERIAL PRIMARY KEY,
        tipo TEXT NOT NULL,
        categoria TEXT NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        descricao TEXT,
        data DATE NOT NULL,
        subcategoria_id INTEGER,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabela transacoes criada');

    // Criar tabela de categorias
    await sql`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabela categorias criada');

    // Criar tabela de subcategorias
    await sql`
      CREATE TABLE IF NOT EXISTS subcategorias (
        id SERIAL PRIMARY KEY,
        categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tabela subcategorias criada');

    // Verificar se já existem categorias
    const { rows } = await sql`SELECT COUNT(*) as count FROM categorias`;
    
    if (parseInt(rows[0].count) === 0) {
      console.log('📝 Inserindo categorias padrão...');
      
      const categoriasReceita = [
        'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presente', 'Reembolso', 'Outros'
      ];
      
      const categoriasDespesa = [
        'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Contas', 'Impostos', 'Outros'
      ];

      for (const nome of categoriasReceita) {
        await sql`INSERT INTO categorias (nome, tipo) VALUES (${nome}, 'receita')`;
      }

      for (const nome of categoriasDespesa) {
        await sql`INSERT INTO categorias (nome, tipo) VALUES (${nome}, 'despesa')`;
      }
      
      console.log('✅ Categorias padrão inseridas');
    } else {
      console.log('ℹ️ Categorias já existem no banco');
    }

    console.log('🎉 Setup do banco de dados concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no setup:', error);
    process.exit(1);
  }
}

setupDatabase();

