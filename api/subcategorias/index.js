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
      const { categoria_id } = req.query;
      
      let query = supabase
        .from('subcategorias')
        .select(`
          *,
          categorias (
            nome,
            tipo
          )
        `)
        .order('nome', { ascending: true });
      
      if (categoria_id) {
        query = query.eq('categoria_id', categoria_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Formatar resultado para manter compatibilidade
      const resultado = (data || []).map(item => ({
        id: item.id,
        categoria_id: item.categoria_id,
        nome: item.nome,
        criado_em: item.criado_em,
        categoria_nome: item.categorias?.nome,
        categoria_tipo: item.categorias?.tipo
      }));
      
      return res.status(200).json(resultado);
    }

    if (req.method === 'POST') {
      const { categoria_id, nome } = req.body;
      
      if (!categoria_id || !nome) {
        return res.status(400).json({ erro: 'Categoria ID e nome são obrigatórios' });
      }
      
      const { data: result, error } = await supabase
        .from('subcategorias')
        .insert([{ categoria_id, nome }])
        .select()
        .single();
      
      if (error) throw error;
      
      return res.status(201).json({ 
        id: result.id,
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
