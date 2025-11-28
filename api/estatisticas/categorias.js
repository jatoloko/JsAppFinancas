import { sql, inicializarBancoDeDados } from '../lib/db.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    await inicializarBancoDeDados();

    const { mes, ano, tipo } = req.query;
    
    let result;
    
    if (mes && ano && tipo) {
      const mesFormatado = mes.toString().padStart(2, '0');
      result = await sql`
        SELECT 
          categoria,
          tipo,
          COALESCE(SUM(valor), 0) as total,
          COUNT(*) as quantidade
        FROM transacoes
        WHERE EXTRACT(MONTH FROM data) = ${parseInt(mesFormatado)}
        AND EXTRACT(YEAR FROM data) = ${parseInt(ano)}
        AND tipo = ${tipo}
        GROUP BY categoria, tipo
        ORDER BY total DESC
      `;
    } else if (mes && ano) {
      const mesFormatado = mes.toString().padStart(2, '0');
      result = await sql`
        SELECT 
          categoria,
          tipo,
          COALESCE(SUM(valor), 0) as total,
          COUNT(*) as quantidade
        FROM transacoes
        WHERE EXTRACT(MONTH FROM data) = ${parseInt(mesFormatado)}
        AND EXTRACT(YEAR FROM data) = ${parseInt(ano)}
        GROUP BY categoria, tipo
        ORDER BY total DESC
      `;
    } else if (tipo) {
      result = await sql`
        SELECT 
          categoria,
          tipo,
          COALESCE(SUM(valor), 0) as total,
          COUNT(*) as quantidade
        FROM transacoes
        WHERE tipo = ${tipo}
        GROUP BY categoria, tipo
        ORDER BY total DESC
      `;
    } else {
      result = await sql`
        SELECT 
          categoria,
          tipo,
          COALESCE(SUM(valor), 0) as total,
          COUNT(*) as quantidade
        FROM transacoes
        GROUP BY categoria, tipo
        ORDER BY total DESC
      `;
    }
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}

