import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Categoria, Subcategoria } from '../types';
import Modal from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';

export default function GerenciamentoCategorias() {
  const { success, error } = useToast();
  const [tipoFiltro, setTipoFiltro] = useState<'receita' | 'despesa'>('despesa');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalSubcategoria, setModalSubcategoria] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [subcategoriaEditando, setSubcategoriaEditando] = useState<Subcategoria | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number | null>(null);

  useEffect(() => {
    carregarDados();
  }, [tipoFiltro]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [cats, subcats] = await Promise.all([
        api.obterCategorias(tipoFiltro),
        api.obterSubcategorias()
      ]);
      setCategorias(cats);
      setSubcategorias(subcats);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
      error('Erro ao carregar categorias e subcategorias');
    } finally {
      setCarregando(false);
    }
  };

  const handleAbrirModalCategoria = (categoria?: Categoria) => {
    setCategoriaEditando(categoria || null);
    setModalCategoria(true);
  };

  const handleFecharModalCategoria = () => {
    setModalCategoria(false);
    setCategoriaEditando(null);
  };

  const handleAbrirModalSubcategoria = (categoriaId: number, subcategoria?: Subcategoria) => {
    setCategoriaSelecionada(categoriaId);
    setSubcategoriaEditando(subcategoria || null);
    setModalSubcategoria(true);
  };

  const handleFecharModalSubcategoria = () => {
    setModalSubcategoria(false);
    setSubcategoriaEditando(null);
    setCategoriaSelecionada(null);
  };

  const handleSalvarCategoria = async (nome: string, tipo: 'receita' | 'despesa') => {
    try {
      if (categoriaEditando?.id) {
        await api.atualizarCategoria(categoriaEditando.id, { nome, tipo });
      } else {
        await api.criarCategoria({ nome, tipo });
      }
      await carregarDados();
      handleFecharModalCategoria();
      success(categoriaEditando ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
    } catch (erro: any) {
      console.error('Erro ao salvar categoria:', erro);
      error(erro.response?.data?.erro || 'Erro ao salvar categoria');
    }
  };

  const handleSalvarSubcategoria = async (nome: string, categoria_id: number) => {
    try {
      if (subcategoriaEditando?.id) {
        await api.atualizarSubcategoria(subcategoriaEditando.id, { categoria_id, nome });
      } else {
        await api.criarSubcategoria({ categoria_id, nome });
      }
      await carregarDados();
      handleFecharModalSubcategoria();
      success(subcategoriaEditando ? 'Subcategoria atualizada com sucesso!' : 'Subcategoria criada com sucesso!');
    } catch (erro: any) {
      console.error('Erro ao salvar subcategoria:', erro);
      error(erro.response?.data?.erro || 'Erro ao salvar subcategoria');
    }
  };

  const handleDeletarCategoria = async (id: number, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar a categoria "${nome}"?\n\nIsso não será possível se houver subcategorias ou transações associadas.`)) {
      return;
    }

    try {
      await api.deletarCategoria(id);
      await carregarDados();
      success('Categoria deletada com sucesso!');
    } catch (erro: any) {
      console.error('Erro ao deletar categoria:', erro);
      const mensagem = erro.response?.data?.erro || 'Erro ao deletar categoria';
      if (erro.response?.data?.quantidade) {
        error(`${mensagem} (${erro.response.data.quantidade} itens associados)`);
      } else {
        error(mensagem);
      }
    }
  };

  const handleDeletarSubcategoria = async (id: number, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar a subcategoria "${nome}"?\n\nIsso não será possível se houver transações associadas.`)) {
      return;
    }

    try {
      await api.deletarSubcategoria(id);
      await carregarDados();
      success('Subcategoria deletada com sucesso!');
    } catch (erro: any) {
      console.error('Erro ao deletar subcategoria:', erro);
      const mensagem = erro.response?.data?.erro || 'Erro ao deletar subcategoria';
      if (erro.response?.data?.quantidade) {
        error(`${mensagem} (${erro.response.data.quantidade} transações associadas)`);
      } else {
        error(mensagem);
      }
    }
  };

  const subcategoriasPorCategoria = (categoriaId: number) => {
    return subcategorias.filter(sub => sub.categoria_id === categoriaId);
  };

  if (carregando) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtro de Tipo */}
      <div className="filtros" style={{ marginBottom: '2rem' }}>
        <div className="filtro-item">
          <label>Filtrar por tipo:</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${tipoFiltro === 'receita' ? 'btn-receita' : 'btn-secundario'}`}
              onClick={() => setTipoFiltro('receita')}
            >
              💰 Receitas
            </button>
            <button
              className={`btn ${tipoFiltro === 'despesa' ? 'btn-despesa' : 'btn-secundario'}`}
              onClick={() => setTipoFiltro('despesa')}
            >
              💸 Despesas
            </button>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="btn btn-primario"
            onClick={() => handleAbrirModalCategoria()}
          >
            ➕ Nova Categoria
          </button>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="card">
        <h3 className="card-titulo">
          <span style={{ fontSize: '1.5rem' }}>📁</span>
          Categorias {tipoFiltro === 'receita' ? 'de Receita' : 'de Despesa'}
        </h3>

        {categorias.length === 0 ? (
          <div className="mensagem-vazia">
            <div className="mensagem-vazia-icone">📂</div>
            <div className="mensagem-vazia-texto">Nenhuma categoria encontrada</div>
            <div className="mensagem-vazia-subtexto">Crie sua primeira categoria</div>
          </div>
        ) : (
          <div>
            {categorias.map((categoria) => {
              const subcats = subcategoriasPorCategoria(categoria.id!);
              return (
                <div key={categoria.id} className="categoria-item-completo">
                  <div className="categoria-header">
                    <div className="categoria-info">
                      <span className="categoria-nome-grande">{categoria.nome}</span>
                      <span className={`badge badge-${categoria.tipo}`}>
                        {categoria.tipo}
                      </span>
                      {subcats.length > 0 && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--cor-texto-secundario)', marginLeft: '0.5rem' }}>
                          ({subcats.length} {subcats.length === 1 ? 'subcategoria' : 'subcategorias'})
                        </span>
                      )}
                    </div>
                    <div className="categoria-acoes">
                      <button
                        className="btn btn-pequeno btn-secundario"
                        onClick={() => handleAbrirModalSubcategoria(categoria.id!)}
                        title="Adicionar subcategoria"
                      >
                        ➕ Subcategoria
                      </button>
                      <button
                        className="btn btn-pequeno btn-secundario"
                        onClick={() => handleAbrirModalCategoria(categoria)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-pequeno btn-deletar"
                        onClick={() => handleDeletarCategoria(categoria.id!, categoria.nome)}
                        title="Deletar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Subcategorias */}
                  {subcats.length > 0 && (
                    <div className="subcategorias-lista">
                      {subcats.map((subcat) => (
                        <div key={subcat.id} className="subcategoria-item">
                          <span className="subcategoria-nome">{subcat.nome}</span>
                          <div className="subcategoria-acoes">
                            <button
                              className="btn btn-pequeno btn-secundario"
                              onClick={() => handleAbrirModalSubcategoria(categoria.id!, subcat)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-pequeno btn-deletar"
                              onClick={() => handleDeletarSubcategoria(subcat.id!, subcat.nome)}
                              title="Deletar"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Categoria */}
      {modalCategoria && (
        <Modal
          titulo={categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
          onFechar={handleFecharModalCategoria}
        >
          <FormularioCategoria
            categoria={categoriaEditando}
            tipoPadrao={tipoFiltro}
            onSalvar={handleSalvarCategoria}
            onCancelar={handleFecharModalCategoria}
          />
        </Modal>
      )}

      {/* Modal de Subcategoria */}
      {modalSubcategoria && categoriaSelecionada && (
        <Modal
          titulo={subcategoriaEditando ? 'Editar Subcategoria' : 'Nova Subcategoria'}
          onFechar={handleFecharModalSubcategoria}
        >
          <FormularioSubcategoria
            subcategoria={subcategoriaEditando}
            categoriaId={categoriaSelecionada}
            categorias={categorias}
            onSalvar={handleSalvarSubcategoria}
            onCancelar={handleFecharModalSubcategoria}
          />
        </Modal>
      )}
    </div>
  );
}

// Componente de Formulário de Categoria
interface FormularioCategoriaProps {
  categoria?: Categoria | null;
  tipoPadrao: 'receita' | 'despesa';
  onSalvar: (nome: string, tipo: 'receita' | 'despesa') => void;
  onCancelar: () => void;
}

function FormularioCategoria({ categoria, tipoPadrao, onSalvar, onCancelar }: FormularioCategoriaProps) {
  const [nome, setNome] = useState(categoria?.nome || '');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>(categoria?.tipo || tipoPadrao);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, insira um nome para a categoria');
      return;
    }
    onSalvar(nome.trim(), tipo);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grupo">
        <label>Tipo *</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            className={`btn ${tipo === 'receita' ? 'btn-receita' : 'btn-secundario'}`}
            onClick={() => setTipo('receita')}
            style={{ flex: 1 }}
          >
            💰 Receita
          </button>
          <button
            type="button"
            className={`btn ${tipo === 'despesa' ? 'btn-despesa' : 'btn-secundario'}`}
            onClick={() => setTipo('despesa')}
            style={{ flex: 1 }}
          >
            💸 Despesa
          </button>
        </div>
      </div>

      <div className="form-grupo">
        <label htmlFor="nome-categoria">Nome da Categoria *</label>
        <input
          id="nome-categoria"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Alimentação, Transporte..."
          required
          autoFocus
        />
      </div>

      <div className="form-acoes">
        <button type="button" className="btn btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className={`btn ${tipo === 'receita' ? 'btn-receita' : 'btn-despesa'}`}>
          {categoria ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}

// Componente de Formulário de Subcategoria
interface FormularioSubcategoriaProps {
  subcategoria?: Subcategoria | null;
  categoriaId: number;
  categorias: Categoria[];
  onSalvar: (nome: string, categoria_id: number) => void;
  onCancelar: () => void;
}

function FormularioSubcategoria({ subcategoria, categoriaId, categorias, onSalvar, onCancelar }: FormularioSubcategoriaProps) {
  const [nome, setNome] = useState(subcategoria?.nome || '');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(subcategoria?.categoria_id || categoriaId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, insira um nome para a subcategoria');
      return;
    }
    onSalvar(nome.trim(), categoriaSelecionada);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grupo">
        <label htmlFor="categoria-sub">Categoria *</label>
        <select
          id="categoria-sub"
          value={categoriaSelecionada}
          onChange={(e) => setCategoriaSelecionada(parseInt(e.target.value))}
          required
        >
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nome} ({cat.tipo})
            </option>
          ))}
        </select>
      </div>

      <div className="form-grupo">
        <label htmlFor="nome-subcategoria">Nome da Subcategoria *</label>
        <input
          id="nome-subcategoria"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Restaurante, Supermercado..."
          required
          autoFocus
        />
      </div>

      <div className="form-acoes">
        <button type="button" className="btn btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primario">
          {subcategoria ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}

