import { useEffect, useState } from 'react';
import { api } from '../api';
import { Estatisticas, EstatisticaCategoria } from '../types';
import { formatarMoeda, calcularPorcentagem } from '../utils';
import { SkeletonCard } from './Skeleton';
import GraficoPizza from './GraficoPizza';
import GraficoBarras from './GraficoBarras';

interface DashboardProps {
  mes: number;
  ano: number;
}

export default function Dashboard({ mes, ano }: DashboardProps) {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [estatisticasAnterior, setEstatisticasAnterior] = useState<Estatisticas | null>(null);
  const [categorias, setCategorias] = useState<EstatisticaCategoria[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [mes, ano]);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [stats, statsAnterior, cats] = await Promise.all([
        api.obterEstatisticas(mes, ano),
        api.obterEstatisticasMesAnterior(mes, ano).catch(() => ({ receitas: 0, despesas: 0, saldo: 0, quantidadeReceitas: 0, quantidadeDespesas: 0 })),
        api.obterEstatisticasCategorias(mes, ano)
      ]);
      setEstatisticas(stats);
      setEstatisticasAnterior(statsAnterior);
      setCategorias(cats);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const calcularTendencia = (atual: number, anterior: number): { valor: number; porcentagem: number; tipo: 'up' | 'down' | 'equal' } => {
    if (anterior === 0) {
      return { valor: atual, porcentagem: atual > 0 ? 100 : 0, tipo: atual > 0 ? 'up' : 'equal' };
    }
    const diferenca = atual - anterior;
    const porcentagem = Math.abs((diferenca / anterior) * 100);
    return {
      valor: diferenca,
      porcentagem,
      tipo: diferenca > 0 ? 'up' : diferenca < 0 ? 'down' : 'equal'
    };
  };

  if (carregando) {
    return (
      <div>
        <div className="grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid-2" style={{ marginTop: '1.5rem' }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!estatisticas) {
    return (
      <div className="mensagem-vazia">
        <p>Erro ao carregar estatísticas</p>
      </div>
    );
  }

  const despesasPorCategoria = categorias.filter(c => c.tipo === 'despesa');
  const receitasPorCategoria = categorias.filter(c => c.tipo === 'receita');
  const totalDespesas = estatisticas.despesas;
  const totalReceitas = estatisticas.receitas;

  // Preparar dados para gráficos
  const coresDespesas = [
    '#FF6B6B', '#FF8787', '#FFA3A3', '#FFBFBF', '#FFDBDB',
    '#EE5A52', '#DC4444', '#CA2E36', '#B81828', '#A6021A'
  ];
  const coresReceitas = [
    '#00D9A5', '#26E0B8', '#4CE7CB', '#72EEDE', '#98F5F1',
    '#00C494', '#00AF83', '#009A72', '#008561', '#007050'
  ];

  const dadosGraficoDespesas = despesasPorCategoria
    .slice(0, 10)
    .map((cat, index) => ({
      nome: cat.categoria,
      valor: cat.total,
      cor: coresDespesas[index % coresDespesas.length]
    }));

  const dadosGraficoReceitas = receitasPorCategoria
    .slice(0, 10)
    .map((cat, index) => ({
      nome: cat.categoria,
      valor: cat.total,
      cor: coresReceitas[index % coresReceitas.length]
    }));

  const dadosGraficoComparativo = [
    { nome: 'Receitas', valor: estatisticas.receitas, cor: '#00D9A5' },
    { nome: 'Despesas', valor: estatisticas.despesas, cor: '#FF6B6B' }
  ];

  // Calcular tendências
  const tendenciaReceitas = estatisticasAnterior 
    ? calcularTendencia(estatisticas.receitas, estatisticasAnterior.receitas)
    : null;
  const tendenciaDespesas = estatisticasAnterior
    ? calcularTendencia(estatisticas.despesas, estatisticasAnterior.despesas)
    : null;
  const tendenciaSaldo = estatisticasAnterior
    ? calcularTendencia(estatisticas.saldo, estatisticasAnterior.saldo)
    : null;

  return (
    <div>
      {/*Cards de Estatísticas */}
      <div className="grid">
        <div className={`card estatistica-card saldo ${estatisticas.saldo < 0 ? 'negativo' : ''}`}>
          <div className="estatistica-icone">
            💰
          </div>
          <div className="estatistica-label">Saldo Atual</div>
          <div className="estatistica-valor">
            {formatarMoeda(estatisticas.saldo)}
          </div>
          <div className="estatistica-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span>{estatisticas.saldo >= 0 ? '✓ Saldo positivo' : '⚠ Saldo negativo'}</span>
            {tendenciaSaldo && tendenciaSaldo.tipo !== 'equal' && (
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: tendenciaSaldo.tipo === 'up' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)'
              }}>
                {tendenciaSaldo.tipo === 'up' ? '↑' : '↓'} {tendenciaSaldo.porcentagem.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className="card estatistica-card receita">
          <div className="estatistica-icone">
            📈
          </div>
          <div className="estatistica-label">Receitas</div>
          <div className="estatistica-valor">
            {formatarMoeda(estatisticas.receitas)}
          </div>
          <div className="estatistica-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span>{estatisticas.quantidadeReceitas} {estatisticas.quantidadeReceitas === 1 ? 'transação' : 'transações'}</span>
            {tendenciaReceitas && tendenciaReceitas.tipo !== 'equal' && (
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: tendenciaReceitas.tipo === 'up' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)'
              }}>
                {tendenciaReceitas.tipo === 'up' ? '↑' : '↓'} {tendenciaReceitas.porcentagem.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className="card estatistica-card despesa">
          <div className="estatistica-icone">
            📉
          </div>
          <div className="estatistica-label">Despesas</div>
          <div className="estatistica-valor">
            {formatarMoeda(estatisticas.despesas)}
          </div>
          <div className="estatistica-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span>{estatisticas.quantidadeDespesas} {estatisticas.quantidadeDespesas === 1 ? 'transação' : 'transações'}</span>
            {tendenciaDespesas && tendenciaDespesas.tipo !== 'equal' && (
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: tendenciaDespesas.tipo === 'down' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)'
              }}>
                {tendenciaDespesas.tipo === 'up' ? '↑' : '↓'} {tendenciaDespesas.porcentagem.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico Comparativo */}
      {estatisticas.receitas > 0 || estatisticas.despesas > 0 ? (
        <div className="card">
          <h3 className="card-titulo">
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            Comparativo Receitas vs Despesas
          </h3>
          <GraficoBarras dados={dadosGraficoComparativo} altura={250} />
        </div>
      ) : null}

      {/* Categorias */}
      <div className="grid-2">
        {/* Despesas por Categoria */}
        <div className="card">
          <h3 className="card-titulo">
            <span style={{ fontSize: '1.5rem' }}>💸</span>
            Despesas por Categoria
          </h3>
          {despesasPorCategoria.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <GraficoPizza dados={dadosGraficoDespesas} tamanho={180} />
            </div>
          )}
          {despesasPorCategoria.length > 0 ? (
            <div>
              {despesasPorCategoria.map((cat) => (
                <div key={cat.categoria} className="categoria-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="categoria-nome">{cat.categoria}</span>
                      <span className="categoria-valor" style={{ color: 'var(--cor-despesa)' }}>
                        {formatarMoeda(cat.total)}
                      </span>
                    </div>
                    <div className="categoria-barra">
                      <div
                        className="categoria-progresso despesa"
                        style={{ width: `${calcularPorcentagem(cat.total, totalDespesas)}%` }}
                      ></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cor-texto-secundario)', marginTop: '0.25rem' }}>
                      {calcularPorcentagem(cat.total, totalDespesas).toFixed(1)}% do total • {cat.quantidade} {cat.quantidade === 1 ? 'transação' : 'transações'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mensagem-vazia">
              <div className="mensagem-vazia-icone">💸</div>
              <div className="mensagem-vazia-texto">Nenhuma despesa</div>
              <div className="mensagem-vazia-subtexto">Adicione suas primeiras despesas</div>
            </div>
          )}
        </div>

        {/* Receitas por Categoria */}
        <div className="card">
          <h3 className="card-titulo">
            <span style={{ fontSize: '1.5rem' }}>💵</span>
            Receitas por Categoria
          </h3>
          {receitasPorCategoria.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <GraficoPizza dados={dadosGraficoReceitas} tamanho={180} />
            </div>
          )}
          {receitasPorCategoria.length > 0 ? (
            <div>
              {receitasPorCategoria.map((cat) => (
                <div key={cat.categoria} className="categoria-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="categoria-nome">{cat.categoria}</span>
                      <span className="categoria-valor" style={{ color: 'var(--cor-receita)' }}>
                        {formatarMoeda(cat.total)}
                      </span>
                    </div>
                    <div className="categoria-barra">
                      <div
                        className="categoria-progresso receita"
                        style={{ width: `${calcularPorcentagem(cat.total, totalReceitas)}%` }}
                      ></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cor-texto-secundario)', marginTop: '0.25rem' }}>
                      {calcularPorcentagem(cat.total, totalReceitas).toFixed(1)}% do total • {cat.quantidade} {cat.quantidade === 1 ? 'transação' : 'transações'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mensagem-vazia">
              <div className="mensagem-vazia-icone">💰</div>
              <div className="mensagem-vazia-texto">Nenhuma receita</div>
              <div className="mensagem-vazia-subtexto">Adicione suas primeiras receitas</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

