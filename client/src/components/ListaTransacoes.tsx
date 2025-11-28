import { useState, useMemo } from 'react';
import { Transacao } from '../types';
import { formatarMoeda, formatarData } from '../utils';
import { useDebounce } from '../hooks/useDebounce';

interface ListaTransacoesProps {
  transacoes: Transacao[];
  onEditar: (transacao: Transacao) => void;
  onDeletar: (id: number) => void;
}

type Ordenacao = 'data' | 'valor' | 'categoria' | 'tipo';
type DirecaoOrdenacao = 'asc' | 'desc';

export default function ListaTransacoes({ transacoes, onEditar, onDeletar }: ListaTransacoesProps) {
  const [busca, setBusca] = useState('');
  const buscaDebounced = useDebounce(busca, 300);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('data');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<DirecaoOrdenacao>('desc');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [agruparPorData, setAgruparPorData] = useState(false);

  // Obter categorias únicas
  const categoriasUnicas = useMemo(() => {
    const categorias = new Set<string>();
    transacoes.forEach(t => categorias.add(t.categoria.split(' > ')[0]));
    return Array.from(categorias).sort();
  }, [transacoes]);

  // Função para agrupar transações por data
  const agruparTransacoesPorData = (transacoes: Transacao[]) => {
    const grupos: Record<string, Transacao[]> = {};
    
    transacoes.forEach(transacao => {
      const data = new Date(transacao.data);
      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(ontem.getDate() - 1);
      
      let chave: string;
      
      if (data.toDateString() === hoje.toDateString()) {
        chave = 'Hoje';
      } else if (data.toDateString() === ontem.toDateString()) {
        chave = 'Ontem';
      } else {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        
        if (data >= inicioSemana && data <= fimSemana) {
          chave = 'Esta Semana';
        } else if (data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear()) {
          chave = 'Este Mês';
        } else {
          const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
          chave = `${meses[data.getMonth()]} ${data.getFullYear()}`;
        }
      }
      
      if (!grupos[chave]) {
        grupos[chave] = [];
      }
      grupos[chave].push(transacao);
    });
    
    return grupos;
  };

  // Filtrar e ordenar transações
  const transacoesFiltradas = useMemo(() => {
    let filtradas = [...transacoes];

    // Filtro de busca (usando debounce)
    if (buscaDebounced.trim()) {
      const buscaLower = buscaDebounced.toLowerCase();
      filtradas = filtradas.filter(t => 
        t.categoria.toLowerCase().includes(buscaLower) ||
        t.descricao?.toLowerCase().includes(buscaLower) ||
        formatarMoeda(t.valor).toLowerCase().includes(buscaLower)
      );
    }

    // Filtro de tipo
    if (filtroTipo !== 'todos') {
      filtradas = filtradas.filter(t => t.tipo === filtroTipo);
    }

    // Filtro de categoria
    if (filtroCategoria !== 'todas') {
      filtradas = filtradas.filter(t => t.categoria.startsWith(filtroCategoria));
    }

    // Ordenação
    filtradas.sort((a, b) => {
      let comparacao = 0;
      
      switch (ordenacao) {
        case 'data':
          comparacao = new Date(a.data).getTime() - new Date(b.data).getTime();
          break;
        case 'valor':
          comparacao = a.valor - b.valor;
          break;
        case 'categoria':
          comparacao = a.categoria.localeCompare(b.categoria);
          break;
        case 'tipo':
          comparacao = a.tipo.localeCompare(b.tipo);
          break;
      }

      return direcaoOrdenacao === 'asc' ? comparacao : -comparacao;
    });

    return filtradas;
  }, [transacoes, buscaDebounced, filtroTipo, filtroCategoria, ordenacao, direcaoOrdenacao]);

  // Agrupar transações por data se necessário
  const transacoesAgrupadas = useMemo(() => {
    if (!agruparPorData) {
      return null;
    }
    return agruparTransacoesPorData(transacoesFiltradas);
  }, [transacoesFiltradas, agruparPorData]);

  const handleDeletar = (transacao: Transacao) => {
    if (window.confirm(`Tem certeza que deseja deletar esta ${transacao.tipo}?`)) {
      onDeletar(transacao.id!);
    }
  };

  if (transacoes.length === 0) {
    return (
      <div className="card">
        <div className="mensagem-vazia">
          <div className="mensagem-vazia-icone">📋</div>
          <div className="mensagem-vazia-texto">Nenhuma transação encontrada</div>
          <div className="mensagem-vazia-subtexto">Comece adicionando sua primeira transação</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 className="card-titulo" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: '1.5rem' }}>📋</span>
          Transações {transacoesFiltradas.length !== transacoes.length && `(${transacoesFiltradas.length} de ${transacoes.length})`}
        </h3>
        <button
          className="btn btn-pequeno btn-secundario"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
        >
          {mostrarFiltros ? '🔽 Ocultar' : '🔍 Filtros'}
        </button>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="busca-filtros-container" style={{ marginBottom: '1.5rem' }}>
        <div className="busca-container">
          <input
            type="text"
            className="busca-input"
            placeholder="🔍 Buscar por descrição, categoria ou valor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar transações"
          />
        </div>

        {mostrarFiltros && (
          <div className="filtros-avancados">
            <div className="filtro-grupo">
              <label>Tipo:</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
                className="filtro-select"
                aria-label="Filtrar por tipo de transação"
              >
                <option value="todos">Todos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Categoria:</label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="filtro-select"
                aria-label="Filtrar por categoria"
              >
                <option value="todas">Todas</option>
                {categoriasUnicas.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filtro-grupo">
              <label>Ordenar por:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                className="filtro-select"
                aria-label="Ordenar transações por"
              >
                  <option value="data">Data</option>
                  <option value="valor">Valor</option>
                  <option value="categoria">Categoria</option>
                  <option value="tipo">Tipo</option>
                </select>
                <button
                  className="btn btn-pequeno btn-secundario"
                  onClick={() => setDirecaoOrdenacao(direcaoOrdenacao === 'asc' ? 'desc' : 'asc')}
                  title={direcaoOrdenacao === 'asc' ? 'Crescente' : 'Decrescente'}
                  aria-label={direcaoOrdenacao === 'asc' ? 'Ordenar em ordem crescente' : 'Ordenar em ordem decrescente'}
                >
                  {direcaoOrdenacao === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <div className="filtro-grupo">
                <label>
                <input
                  type="checkbox"
                  checked={agruparPorData}
                  onChange={(e) => setAgruparPorData(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                  aria-label="Agrupar transações por data"
                />
                Agrupar por data
              </label>
            </div>

            {(busca || filtroTipo !== 'todos' || filtroCategoria !== 'todas') && (
              <button
                className="btn btn-pequeno btn-secundario"
                onClick={() => {
                  setBusca('');
                  setFiltroTipo('todos');
                  setFiltroCategoria('todas');
                }}
              >
                🗑️ Limpar
              </button>
            )}
          </div>
        )}
      </div>

      {transacoesFiltradas.length === 0 ? (
        <div className="mensagem-vazia">
          <div className="mensagem-vazia-icone">🔍</div>
          <div className="mensagem-vazia-texto">Nenhuma transação encontrada</div>
          <div className="mensagem-vazia-subtexto">
            {busca || filtroTipo !== 'todos' || filtroCategoria !== 'todas' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Comece adicionando sua primeira transação'}
          </div>
        </div>
      ) : agruparPorData && transacoesAgrupadas ? (
        <div>
          {Object.entries(transacoesAgrupadas)
            .sort(([a], [b]) => {
              const ordem: Record<string, number> = { 'Hoje': 0, 'Ontem': 1, 'Esta Semana': 2, 'Este Mês': 3 };
              return (ordem[a] ?? 999) - (ordem[b] ?? 999);
            })
            .map(([grupo, transacoesGrupo]) => (
              <div key={grupo} style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  background: 'linear-gradient(90deg, var(--cor-primaria) 0%, var(--cor-secundaria) 100%)',
                  color: 'white',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem'
                }}>
                  📅 {grupo} ({transacoesGrupo.length} {transacoesGrupo.length === 1 ? 'transação' : 'transações'})
                </div>
                <div className="card" style={{ marginBottom: 0, padding: 0 }}>
                  {transacoesGrupo.map((transacao) => (
                    <div key={transacao.id} className="transacao-item">
                      <div className="transacao-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>
                            {transacao.tipo === 'receita' ? '💰' : '💸'}
                          </span>
                          <div>
                            <div className="transacao-categoria">{transacao.categoria}</div>
                            <div className="transacao-data">📅 {formatarData(transacao.data)}</div>
                          </div>
                          <span className={`badge badge-${transacao.tipo}`}>
                            {transacao.tipo}
                          </span>
                        </div>
                        {transacao.descricao && (
                          <div className="transacao-descricao" style={{ marginLeft: '2.5rem' }}>
                            {transacao.descricao}
                          </div>
                        )}
                      </div>
                      
                      <div className={`transacao-valor ${transacao.tipo}`}>
                        {transacao.tipo === 'receita' ? '+' : '-'} {formatarMoeda(transacao.valor)}
                      </div>
                      
                      <div className="transacao-acoes">
                        <button
                          className="btn btn-pequeno btn-secundario"
                          onClick={() => onEditar(transacao)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-pequeno btn-deletar"
                          onClick={() => handleDeletar(transacao)}
                          title="Deletar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div>
          {transacoesFiltradas.map((transacao) => (
            <div key={transacao.id} className="transacao-item">
              <div className="transacao-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {transacao.tipo === 'receita' ? '💰' : '💸'}
                  </span>
                  <div>
                    <div className="transacao-categoria">{transacao.categoria}</div>
                    <div className="transacao-data">📅 {formatarData(transacao.data)}</div>
                  </div>
                  <span className={`badge badge-${transacao.tipo}`}>
                    {transacao.tipo}
                  </span>
                </div>
                {transacao.descricao && (
                  <div className="transacao-descricao" style={{ marginLeft: '2.5rem' }}>
                    {transacao.descricao}
                  </div>
                )}
              </div>
              
              <div className={`transacao-valor ${transacao.tipo}`}>
                {transacao.tipo === 'receita' ? '+' : '-'} {formatarMoeda(transacao.valor)}
              </div>
              
              <div className="transacao-acoes">
                <button
                  className="btn btn-pequeno btn-secundario"
                  onClick={() => onEditar(transacao)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="btn btn-pequeno btn-deletar"
                  onClick={() => handleDeletar(transacao)}
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
}

