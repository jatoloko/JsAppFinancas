import { supabase, inicializarBancoDeDados } from '../lib/db.js';

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
    
    let query = supabase.from('transacoes').select('tipo, valor');
    
    if (mes && ano) {
      const mesFormatado = mes.toString().padStart(2, '0');
      const inicioMes = `${ano}-${mesFormatado}-01`;
      const fimMes = `${ano}-${mesFormatado}-31`;
      
      query = query.gte('data', inicioMes).lte('data', fimMes);
    }
    
    const { data: transacoes, error } = await query;
    
    if (error) throw error;
    
    const estatisticas = {
      receitas: 0,
      despesas: 0,
      saldo: 0,
      quantidadeReceitas: 0,
      quantidadeDespesas: 0
    };
    
    (transacoes || []).forEach(t => {
      if (t.tipo === 'receita') {
        estatisticas.receitas += parseFloat(t.valor) || 0;
        estatisticas.quantidadeReceitas++;
      } else if (t.tipo === 'despesa') {
        estatisticas.despesas += parseFloat(t.valor) || 0;
        estatisticas.quantidadeDespesas++;
      }
    });
    
    estatisticas.saldo = estatisticas.receitas - estatisticas.despesas;
    
    return res.status(200).json(estatisticas);
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}
