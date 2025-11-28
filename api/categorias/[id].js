import { supabase, inicializarBancoDeDados } from '../lib/db.js';

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
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ erro: 'Categoria não encontrada' });
        }
        throw error;
      }
      
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const { nome, tipo } = req.body;
      
      if (!nome || !tipo) {
        return res.status(400).json({ erro: 'Nome e tipo são obrigatórios' });
      }
      
      if (tipo !== 'receita' && tipo !== 'despesa') {
        return res.status(400).json({ erro: 'Tipo deve ser "receita" ou "despesa"' });
      }
      
      const { data: result, error } = await supabase
        .from('categorias')
        .update({ nome, tipo })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!result || result.length === 0) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      
      return res.status(200).json({ mensagem: 'Categoria atualizada com sucesso' });
    }

    if (req.method === 'DELETE') {
      // Verificar se há subcategorias
      const { data: subcats } = await supabase
        .from('subcategorias')
        .select('id')
        .eq('categoria_id', id);
      
      if (subcats && subcats.length > 0) {
        return res.status(400).json({ 
          erro: 'Não é possível deletar categoria com subcategorias associadas',
          quantidade: subcats.length
        });
      }
      
      // Buscar nome da categoria para verificar transações
      const { data: categoria } = await supabase
        .from('categorias')
        .select('nome')
        .eq('id', id)
        .single();
      
      if (!categoria) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      
      // Verificar transações
      const { data: transacoes } = await supabase
        .from('transacoes')
        .select('id')
        .or(`categoria.eq.${categoria.nome},categoria.like.${categoria.nome} > %`);
      
      if (transacoes && transacoes.length > 0) {
        return res.status(400).json({ 
          erro: 'Não é possível deletar categoria com transações associadas',
          quantidade: transacoes.length
        });
      }
      
      const { data: result, error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!result || result.length === 0) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      
      return res.status(200).json({ mensagem: 'Categoria deletada com sucesso' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}
