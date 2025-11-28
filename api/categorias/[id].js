import { sql, inicializarBancoDeDados } from '../lib/db.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    await inicializarBancoDeDados();

    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM categorias WHERE id = ${id}`;
      
      if (result.rows.length === 0) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const { nome, tipo } = req.body;
      
      if (!nome || !tipo) {
        return res.status(400).json({ erro: 'Nome e tipo são obrigatórios' });
      }
      
      if (tipo !== 'receita' && tipo !== 'despesa') {
        return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa"' });
      }
      
      const result = await sql`
        UPDATE categorias SET nome = ${nome}, tipo = ${tipo}
        WHERE id = ${id}
      `;
      
      if (result.rowCount === 0) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      
      return res.status(200).json({ mensagem: 'Categoria atualizada com sucesso' });
    }

    if (req.method === 'DELETE') {
      // Verificar se há subcategorias
      const subcatResult = await sql`SELECT COUNT(*) as count FROM subcategorias WHERE categoria_id = ${id}`;
      
      if (parseInt(subcatResult.rows[0].count) > 0) {
        return res.status(400).json({ 
          erro: 'Não é possível deletar categoria com subcategorias associadas',
          quantidade: subcatResult.rows[0].count
        });
      }
      
      // Buscar nome da categoria para verificar transações
      const catResult = await sql`SELECT nome FROM categorias WHERE id = ${id}`;
      
      if (catResult.rows.length === 0) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      
      const categoriaNome = catResult.rows[0].nome;
      
      // Verificar transações
      const transResult = await sql`
        SELECT COUNT(*) as count FROM transacoes 
        WHERE categoria = ${categoriaNome} OR categoria LIKE ${categoriaNome + ' > %'}
      `;
      
      if (parseInt(transResult.rows[0].count) > 0) {
        return res.status(400).json({ 
          erro: 'Não é possível deletar categoria com transações associadas',
          quantidade: transResult.rows[0].count
        });
      }
      
      const result = await sql`DELETE FROM categorias WHERE id = ${id}`;
      
      if (result.rowCount === 0) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      
      return res.status(200).json({ mensagem: 'Categoria deletada com sucesso' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}

