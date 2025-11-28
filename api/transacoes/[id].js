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
      const result = await sql`SELECT * FROM transacoes WHERE id = ${id}`;
      
      if (result.rows.length === 0) {
        return res.status(404).json({ erro: 'Transação não encontrada' });
      }
      
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
      const { tipo, categoria, valor, descricao, data } = req.body;
      
      if (!tipo || !categoria || !valor || !data) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
      }
      
      const result = await sql`
        UPDATE transacoes 
        SET tipo = ${tipo}, categoria = ${categoria}, valor = ${valor}, 
            descricao = ${descricao || null}, data = ${data}
        WHERE id = ${id}
      `;
      
      if (result.rowCount === 0) {
        return res.status(404).json({ erro: 'Transação não encontrada' });
      }
      
      return res.status(200).json({ mensagem: 'Transação atualizada com sucesso' });
    }

    if (req.method === 'DELETE') {
      const result = await sql`DELETE FROM transacoes WHERE id = ${id}`;
      
      if (result.rowCount === 0) {
        return res.status(404).json({ erro: 'Transação não encontrada' });
      }
      
      return res.status(200).json({ mensagem: 'Transação deletada com sucesso' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}

