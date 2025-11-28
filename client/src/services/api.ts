import axios from 'axios';
import { Transacao, Estatisticas, EstatisticaCategoria, Categoria, Subcategoria } from '../types';

// Em produção (Vercel) usa /api, em desenvolvimento usa o servidor local
const API_URL = '/api';

export const api = {
  // Transações
  obterTransacoes: async (mes?: number, ano?: number): Promise<Transacao[]> => {
    const params = mes && ano ? { mes: mes.toString(), ano: ano.toString() } : {};
    const response = await axios.get(`${API_URL}/transacoes`, { params });
    return response.data;
  },

  obterTransacao: async (id: number): Promise<Transacao> => {
    const response = await axios.get(`${API_URL}/transacoes/${id}`);
    return response.data;
  },

  criarTransacao: async (transacao: Transacao): Promise<{ id: number }> => {
    const response = await axios.post(`${API_URL}/transacoes`, transacao);
    return response.data;
  },

  atualizarTransacao: async (id: number, transacao: Transacao): Promise<void> => {
    await axios.put(`${API_URL}/transacoes/${id}`, transacao);
  },

  deletarTransacao: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/transacoes/${id}`);
  },

  // Estatísticas
  obterEstatisticas: async (mes?: number, ano?: number): Promise<Estatisticas> => {
    const params = mes && ano ? { mes: mes.toString(), ano: ano.toString() } : {};
    const response = await axios.get(`${API_URL}/estatisticas`, { params });
    return response.data;
  },

  obterEstatisticasCategorias: async (
    mes?: number,
    ano?: number,
    tipo?: 'receita' | 'despesa'
  ): Promise<EstatisticaCategoria[]> => {
    const params: any = {};
    if (mes && ano) {
      params.mes = mes.toString();
      params.ano = ano.toString();
    }
    if (tipo) {
      params.tipo = tipo;
    }
    const response = await axios.get(`${API_URL}/estatisticas/categorias`, { params });
    return response.data;
  },

  obterEstatisticasMesAnterior: async (mes: number, ano: number): Promise<Estatisticas> => {
    const params = { mes: mes.toString(), ano: ano.toString() };
    const response = await axios.get(`${API_URL}/estatisticas/mes-anterior`, { params });
    return response.data;
  },

  // Categorias
  obterCategorias: async (tipo?: 'receita' | 'despesa'): Promise<Categoria[]> => {
    const params = tipo ? { tipo } : {};
    const response = await axios.get(`${API_URL}/categorias`, { params });
    return response.data;
  },

  obterCategoria: async (id: number): Promise<Categoria> => {
    const response = await axios.get(`${API_URL}/categorias/${id}`);
    return response.data;
  },

  criarCategoria: async (categoria: Categoria): Promise<{ id: number }> => {
    const response = await axios.post(`${API_URL}/categorias`, categoria);
    return response.data;
  },

  atualizarCategoria: async (id: number, categoria: Categoria): Promise<void> => {
    await axios.put(`${API_URL}/categorias/${id}`, categoria);
  },

  deletarCategoria: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/categorias/${id}`);
  },

  // Subcategorias
  obterSubcategorias: async (categoria_id?: number): Promise<Subcategoria[]> => {
    const params = categoria_id ? { categoria_id: categoria_id.toString() } : {};
    const response = await axios.get(`${API_URL}/subcategorias`, { params });
    return response.data;
  },

  obterSubcategoria: async (id: number): Promise<Subcategoria> => {
    const response = await axios.get(`${API_URL}/subcategorias/${id}`);
    return response.data;
  },

  criarSubcategoria: async (subcategoria: Subcategoria): Promise<{ id: number }> => {
    const response = await axios.post(`${API_URL}/subcategorias`, subcategoria);
    return response.data;
  },

  atualizarSubcategoria: async (id: number, subcategoria: Subcategoria): Promise<void> => {
    await axios.put(`${API_URL}/subcategorias/${id}`, subcategoria);
  },

  deletarSubcategoria: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/subcategorias/${id}`);
  }
};

