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

    const { mes, ano } = req.query;
    
    if (!mes || !ano) {
      return res.status(400).json({ erro: 'Mês e ano são obrigatórios' });
    }

    // Calcular mês anterior
    const mesAtual = parseInt(mes);
    const anoAtual = parseInt(ano);
    let mesAnterior = mesAtual - 1;
    let anoAnterior = anoAtual;
    
    if (mesAnterior === 0) {
      mesAnterior = 12;
      anoAnterior = anoAtual - 1;
    }

    const result = await sql`
      SELECT 
        tipo,
        COALESCE(SUM(valor), 0) as total,
        COUNT(*) as quantidade
      FROM transacoes
      WHERE EXTRACT(MONTH FROM data) = ${mesAnterior}
      AND EXTRACT(YEAR FROM data) = ${anoAnterior}
      GROUP BY tipo
    `;
    
    const estatisticas = {
      receitas: 0,
      despesas: 0,
      saldo: 0,
      quantidadeReceitas: 0,
      quantidadeDespesas: 0
    };
    
    result.rows.forEach(row => {
      if (row.tipo === 'receita') {
        estatisticas.receitas = parseFloat(row.total) || 0;
        estatisticas.quantidadeReceitas = parseInt(row.quantidade) || 0;
      } else if (row.tipo === 'despesa') {
        estatisticas.despesas = parseFloat(row.total) || 0;
        estatisticas.quantidadeDespesas = parseInt(row.quantidade) || 0;
      }
    });
    
    estatisticas.saldo = estatisticas.receitas - estatisticas.despesas;
    
    return res.status(200).json(estatisticas);
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}

