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
        .from('subcategorias')
        .select(`
          *,
          categorias (
            nome,
            tipo
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ erro: 'Subcategoria não encontrada' });
        }
        throw error;
      }
      
      const resultado = {
        id: data.id,
        categoria_id: data.categoria_id,
        nome: data.nome,
        criado_em: data.criado_em,
        categoria_nome: data.categorias?.nome,
        categoria_tipo: data.categorias?.tipo
      };
      
      return res.status(200).json(resultado);
    }

    if (req.method === 'PUT') {
      const { categoria_id, nome } = req.body;
      
      if (!categoria_id || !nome) {
        return res.status(400).json({ erro: 'Categoria ID e nome são obrigatórios' });
      }
      
      const { data: result, error } = await supabase
        .from('subcategorias')
        .update({ categoria_id, nome })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!result || result.length === 0) {
        return res.status(404).json({ erro: 'Subcategoria não encontrada' });
      }
      
      return res.status(200).json({ mensagem: 'Subcategoria atualizada com sucesso' });
    }

    if (req.method === 'DELETE') {
      // Buscar nome da subcategoria e categoria para verificar transações
      const { data: subcategoria } = await supabase
        .from('subcategorias')
        .select(`
          nome,
          categorias (
            nome
          )
        `)
        .eq('id', id)
        .single();
      
      if (!subcategoria) {
        return res.status(404).json({ erro: 'Subcategoria não encontrada' });
      }
      
      const categoriaCompleta = `${subcategoria.categorias?.nome} > ${subcategoria.nome}`;
      
      // Verificar transações
      const { data: transacoes } = await supabase
        .from('transacoes')
        .select('id')
        .eq('categoria', categoriaCompleta);
      
      if (transacoes && transacoes.length > 0) {
        return res.status(400).json({ 
          erro: 'Não é possível deletar subcategoria com transações associadas',
          quantidade: transacoes.length
        });
      }
      
      const { data: result, error } = await supabase
        .from('subcategorias')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      if (!result || result.length === 0) {
        return res.status(404).json({ erro: 'Subcategoria não encontrada' });
      }
      
      return res.status(200).json({ mensagem: 'Subcategoria deletada com sucesso' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ erro: error.message });
  }
}
