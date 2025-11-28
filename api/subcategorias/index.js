import { sql, inicializarBancoDeDados } from '../lib/db.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await inicializarBancoDeDados();

    if (req.method === 'GET') {
      const { categoria_id } = req.query;
      
      let result;
      if (categoria_id) {
        result = await sql`
          SELECT s.*, c.nome as categoria_nome, c.tipo as categoria_tipo 
          FROM subcategorias s 
          JOIN categorias c ON s.categoria_id = c.id
          WHERE s.categoria_id = ${categoria_id}
          ORDER BY s.nome ASC
        `;
      } else {
        result = await sql`
          SELECT s.*, c.nome as categoria_nome, c.tipo as categoria_tipo 
          FROM subcategorias s 
          JOIN categorias c ON s.categoria_id = c.id
          ORDER BY s.nome ASC
        `;
      }
      
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { categoria_id, nome } = req.body;
      
      if (!categoria_id || !nome) {
        return res.status(400).json({ erro: 'Categoria ID e nome são obrigatórios' });
      }
      
      const result = await sql`
        INSERT INTO subcategorias (categoria_id, nome) VALUES (${categoria_id}, ${nome})
        RETURNING id
      `;
      
      return res.status(201).json({ 
        id: result.rows[0].id,
        categoria_id,
        nome,
        mensagem: 'Subcategoria criada com sucesso' 
      });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}

