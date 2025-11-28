import { useState, useEffect } from 'react';
import { api } from './services/api';
import { Transacao } from './types';
import { obterMesAnoAtual } from './utils';
import Dashboard from './pages/Dashboard';
import ListaTransacoes from './components/ListaTransacoes';
import FormularioTransacao from './components/FormularioTransacao';
import GerenciamentoCategorias from './pages/GerenciamentoCategorias';
import Modal from './components/ui/Modal';
import ToastContainer from './components/ui/ToastContainer';
import { useToast } from './hooks/useToast';

type Aba = 'dashboard' | 'transacoes' | 'categorias';

function App() {
  const { toasts, removeToast, success, error } = useToast();
  const [abaAtiva, setAbaAtiva] = useState<Aba>('dashboard');
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [transacaoEditando, setTransacaoEditando] = useState<Transacao | undefined>();
  
  const { mes, ano } = obterMesAnoAtual();
  const [mesSelecionado, setMesSelecionado] = useState(mes);
  const [anoSelecionado, setAnoSelecionado] = useState(ano);

  useEffect(() => {
    carregarTransacoes();
  }, [mesSelecionado, anoSelecionado]);

  const carregarTransacoes = async () => {
    try {
      setCarregando(true);
      const dados = await api.obterTransacoes(mesSelecionado, anoSelecionado);
      setTransacoes(dados);
    } catch (erro) {
      console.error('Erro ao carregar transações:', erro);
      error('Erro ao carregar transações. Verifique se o servidor está rodando.');
    } finally {
      setCarregando(false);
    }
  };

  const handleAbrirModal = (transacao?: Transacao) => {
    setTransacaoEditando(transacao);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setTransacaoEditando(undefined);
  };

  const handleSalvarTransacao = async (transacao: Transacao) => {
    try {
      if (transacao.id) {
        // Atualizar
        await api.atualizarTransacao(transacao.id, transacao);
        success('Transação atualizada com sucesso!');
      } else {
        // Criar
        await api.criarTransacao(transacao);
        success('Transação criada com sucesso!');
      }
      
      await carregarTransacoes();
      handleFecharModal();
      
      // Se a transação é de um mês/ano diferente, atualiza o filtro
      const [anoTransacao, mesTransacao] = transacao.data.split('-');
      const mesNum = parseInt(mesTransacao);
      const anoNum = parseInt(anoTransacao);
      
      if (mesNum !== mesSelecionado || anoNum !== anoSelecionado) {
        setMesSelecionado(mesNum);
        setAnoSelecionado(anoNum);
      }
    } catch (erro) {
      console.error('Erro ao salvar transação:', erro);
      error('Erro ao salvar transação');
    }
  };

  const handleDeletarTransacao = async (id: number) => {
    try {
      await api.deletarTransacao(id);
      await carregarTransacoes();
      success('Transação deletada com sucesso!');
    } catch (erro) {
      console.error('Erro ao deletar transação:', erro);
      error('Erro ao deletar transação');
    }
  };

  const meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
  ];

  const anos = Array.from({ length: 10 }, (_, i) => ano - 5 + i);

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <h1>💰 Controle Financeiro</h1>
          <p>Gerencie suas finanças pessoais de forma simples e eficiente</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Filtros - apenas para dashboard e transações */}
          {abaAtiva !== 'categorias' && (
            <div className="filtros">
              <div className="filtro-item">
                <label>Mês:</label>
                <select
                  value={mesSelecionado}
                  onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
                >
                  {meses.map((m) => (
                    <option key={m.valor} value={m.valor}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filtro-item">
                <label>Ano:</label>
                <select
                  value={anoSelecionado}
                  onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
                >
                  {anos.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginLeft: 'auto' }}>
                <button
                  className="btn btn-primario"
                  onClick={() => handleAbrirModal()}
                >
                  ➕ Nova Transação
                </button>
              </div>
            </div>
          )}

          {/* Abas */}
          <div className="abas-container">
            <div className="abas">
              <button
                className={`aba ${abaAtiva === 'dashboard' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('dashboard')}
              >
                📊 Dashboard
              </button>
              <button
                className={`aba ${abaAtiva === 'transacoes' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('transacoes')}
              >
                📋 Transações
              </button>
              <button
                className={`aba ${abaAtiva === 'categorias' ? 'ativa' : ''}`}
                onClick={() => setAbaAtiva('categorias')}
              >
                🏷️ Categorias
              </button>
            </div>
          </div>

          {/* Conteúdo da Aba */}
          {abaAtiva === 'categorias' ? (
            <GerenciamentoCategorias />
          ) : carregando ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Carregando...</p>
            </div>
          ) : (
            <>
              {abaAtiva === 'dashboard' && (
                <Dashboard mes={mesSelecionado} ano={anoSelecionado} />
              )}

              {abaAtiva === 'transacoes' && (
                <ListaTransacoes
                  transacoes={transacoes}
                  onEditar={handleAbrirModal}
                  onDeletar={handleDeletarTransacao}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal de Transação */}
      {modalAberto && (
        <Modal
          titulo={transacaoEditando ? 'Editar Transação' : 'Nova Transação'}
          onFechar={handleFecharModal}
        >
          <FormularioTransacao
            transacao={transacaoEditando}
            onSalvar={handleSalvarTransacao}
            onCancelar={handleFecharModal}
          />
        </Modal>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;

