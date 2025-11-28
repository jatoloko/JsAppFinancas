import { supabase, inicializarBancoDeDados } from '../lib/db.js';

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
      const { mes, ano } = req.query;
      
      let query = supabase
        .from('transacoes')
        .select('*')
        .order('data', { ascending: false })
        .order('criado_em', { ascending: false });
      
      if (mes && ano) {
        // Filtrar por mês e ano
        const mesFormatado = mes.toString().padStart(2, '0');
        const inicioMes = `${ano}-${mesFormatado}-01`;
        const fimMes = `${ano}-${mesFormatado}-31`;
        
        query = query.gte('data', inicioMes).lte('data', fimMes);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { tipo, categoria, valor, descricao, data } = req.body;
      
      if (!tipo || !categoria || !valor || !data) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
      }
      
      if (tipo !== 'receita' && tipo !== 'despesa') {
        return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa"' });
      }
      
      const { data: result, error } = await supabase
        .from('transacoes')
        .insert([{ tipo, categoria, valor, descricao, data }])
        .select('id')
        .single();
      
      if (error) throw error;
      
      return res.status(201).json({ 
        id: result.id,
        mensagem: 'Transação criada com sucesso' 
      });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}
