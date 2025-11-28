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

    const { mes, ano, tipo } = req.query;
    
    let query = supabase.from('transacoes').select('categoria, tipo, valor');
    
    if (mes && ano) {
      const mesFormatado = mes.toString().padStart(2, '0');
      const inicioMes = `${ano}-${mesFormatado}-01`;
      const fimMes = `${ano}-${mesFormatado}-31`;
      
      query = query.gte('data', inicioMes).lte('data', fimMes);
    }
    
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    
    const { data: transacoes, error } = await query;
    
    if (error) throw error;
    
    // Agrupar por categoria
    const agrupado = {};
    (transacoes || []).forEach(t => {
      const key = `${t.categoria}-${t.tipo}`;
      if (!agrupado[key]) {
        agrupado[key] = {
          categoria: t.categoria,
          tipo: t.tipo,
          total: 0,
          quantidade: 0
        };
      }
      agrupado[key].total += parseFloat(t.valor) || 0;
      agrupado[key].quantidade++;
    });
    
    // Converter para array e ordenar por total
    const resultado = Object.values(agrupado).sort((a, b) => b.total - a.total);
    
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}
