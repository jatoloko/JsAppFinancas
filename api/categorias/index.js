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
      const { tipo } = req.query;
      
      let query = supabase
        .from('categorias')
        .select('*')
        .order('nome', { ascending: true });
      
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { nome, tipo } = req.body;
      
      if (!nome || !tipo) {
        return res.status(400).json({ erro: 'Nome e tipo são obrigatórios' });
      }
      
      if (tipo !== 'receita' && tipo !== 'despesa') {
        return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa"' });
      }
      
      const { data: result, error } = await supabase
        .from('categorias')
        .insert([{ nome, tipo }])
        .select()
        .single();
      
      if (error) throw error;
      
      return res.status(201).json({ 
        id: result.id,
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
