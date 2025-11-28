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
      const { tipo } = req.query;
      
      let result;
      if (tipo) {
        result = await sql`SELECT * FROM categorias WHERE tipo = ${tipo} ORDER BY nome ASC`;
      } else {
        result = await sql`SELECT * FROM categorias ORDER BY nome ASC`;
      }
      
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { nome, tipo } = req.body;
      
      if (!nome || !tipo) {
        return res.status(400).json({ erro: 'Nome e tipo são obrigatórios' });
      }
      
      if (tipo !== 'receita' && tipo !== 'despesa') {
        return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa"' });
      }
      
      const result = await sql`
        INSERT INTO categorias (nome, tipo) VALUES (${nome}, ${tipo})
        RETURNING id
      `;
      
      return res.status(201).json({ 
        id: result.rows[0].id,
        nome,
        tipo,
        mensagem: 'Categoria criada com sucesso' 
      });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}

