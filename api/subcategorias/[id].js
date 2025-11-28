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
      const result = await sql`
        SELECT s.*, c.nome as categoria_nome, c.tipo as categoria_tipo 
        FROM subcategorias s 
        JOIN categorias c ON s.categoria_id = c.id 
        WHERE s.id = ${id}
      `;
      
      if (result.rows.length === 0) {
        return res.status(404).json({ erro: 'Subcategoria não encontrada' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const { categoria_id, nome } = req.body;
      
      if (!categoria_id || !nome) {
        return res.status(400).json({ erro: 'Categoria ID e nome são obrigatórios' });
      }
      
      const result = await sql`
        UPDATE subcategorias SET categoria_id = ${categoria_id}, nome = ${nome}
        WHERE id = ${id}
      `;
      
      if (result.rowCount === 0) {
        return res.status(404).json({ erro: 'Subcategoria não encontrada' });
      }
      
      return res.status(200).json({ mensagem: 'Subcategoria atualizada com sucesso' });
    }

    if (req.method === 'DELETE') {
      // Buscar nome da subcategoria e categoria para verificar transações
      const subcatResult = await sql`
        SELECT s.nome as subcategoria_nome, c.nome as categoria_nome 
        FROM subcategorias s 
        JOIN categorias c ON s.categoria_id = c.id 
        WHERE s.id = ${id}
      `;
      
      if (subcatResult.rows.length === 0) {
        return res.status(404).json({ erro: 'Subcategoria não encontrada' });
      }
      
      const row = subcatResult.rows[0];
      const categoriaCompleta = `${row.categoria_nome} > ${row.subcategoria_nome}`;
      
      // Verificar transações
      const transResult = await sql`
        SELECT COUNT(*) as count FROM transacoes WHERE categoria = ${categoriaCompleta}
      `;
      
      if (parseInt(transResult.rows[0].count) > 0) {
        return res.status(400).json({ 
          erro: 'Não é possível deletar subcategoria com transações associadas',
          quantidade: transResult.rows[0].count
        });
      }
      
      const result = await sql`DELETE FROM subcategorias WHERE id = ${id}`;
      
      if (result.rowCount === 0) {
        return res.status(404).json({ erro: 'Subcategoria não encontrada' });
      }
      
      return res.status(200).json({ mensagem: 'Subcategoria deletada com sucesso' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}

