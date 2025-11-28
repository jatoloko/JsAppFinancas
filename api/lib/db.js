import { createClient } from '@supabase/supabase-js';

// Criar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Variáveis SUPABASE_URL e SUPABASE_ANON_KEY não configuradas');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Inicializar tabelas do banco de dados (executar apenas uma vez via Supabase Dashboard)
export async function inicializarBancoDeDados() {
  // Com Supabase, as tabelas devem ser criadas pelo Dashboard ou SQL Editor
  // Esta função apenas verifica se as categorias padrão existem
  try {
    const { data: categorias, error } = await supabase
      .from('categorias')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      // Tabela não existe - usuário precisa criar via Supabase Dashboard
      console.log('⚠️ Tabelas não encontradas. Execute o SQL de setup no Supabase.');
      return { success: false, message: 'Tabelas não criadas' };
    }
    
    if (!categorias || categorias.length === 0) {
      await inserirCategoriasPadrao();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao verificar banco:', error);
    return { success: false, error };
  }
}

async function inserirCategoriasPadrao() {
  const categoriasReceita = [
    'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presente', 'Reembolso', 'Outros'
  ];
  
  const categoriasDespesa = [
    'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Contas', 'Impostos', 'Outros'
  ];

  const todasCategorias = [
    ...categoriasReceita.map(nome => ({ nome, tipo: 'receita' })),
    ...categoriasDespesa.map(nome => ({ nome, tipo: 'despesa' }))
  ];

  const { error } = await supabase.from('categorias').insert(todasCategorias);
  
  if (error) {
    console.error('Erro ao inserir categorias padrão:', error);
  } else {
    console.log('✅ Categorias padrão inseridas');
  }
}
