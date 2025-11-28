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
    // Garantir que o banco está inicializado
    await inicializarBancoDeDados();

    if (req.method === 'GET') {
      const { mes, ano } = req.query;
      
      let result;
      if (mes && ano) {
        const mesFormatado = mes.toString().padStart(2, '0');
        result = await sql`
          SELECT * FROM transacoes 
          WHERE EXTRACT(MONTH FROM data) = ${parseInt(mesFormatado)}
          AND EXTRACT(YEAR FROM data) = ${parseInt(ano)}
          ORDER BY data DESC, criado_em DESC
        `;
      } else {
        result = await sql`SELECT * FROM transacoes ORDER BY data DESC, criado_em DESC`;
      }
      
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { tipo, categoria, valor, descricao, data } = req.body;
      
      if (!tipo || !categoria || !valor || !data) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
      }
      
      if (tipo !== 'receita' && tipo !== 'despesa') {
        return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa"' });
      }
      
      const result = await sql`
        INSERT INTO transacoes (tipo, categoria, valor, descricao, data)
        VALUES (${tipo}, ${categoria}, ${valor}, ${descricao || null}, ${data})
        RETURNING id
      `;
      
      return res.status(201).json({ 
        id: result.rows[0].id,
        mensagem: 'Transação criada com sucesso' 
      });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}

