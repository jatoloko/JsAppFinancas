export interface Transacao {
  id?: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  valor: number;
  descricao?: string;
  data: string;
  criado_em?: string;
}

export interface Estatisticas {
  receitas: number;
  despesas: number;
  saldo: number;
  quantidadeReceitas: number;
  quantidadeDespesas: number;
}

export interface EstatisticaCategoria {
  categoria: string;
  tipo: 'receita' | 'despesa';
  total: number;
  quantidade: number;
}

export interface Categoria {
  id?: number;
  nome: string;
  tipo: 'receita' | 'despesa';
  criado_em?: string;
}

export interface Subcategoria {
  id?: number;
  categoria_id: number;
  nome: string;
  criado_em?: string;
  categoria_nome?: string;
  categoria_tipo?: 'receita' | 'despesa';
}

// Mantidas como fallback para compatibilidade
export const CATEGORIAS_RECEITA = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Vendas',
  'Presente',
  'Reembolso',
  'Outros'
];

export const CATEGORIAS_DESPESA = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Compras',
  'Contas',
  'Impostos',
  'Outros'
];

