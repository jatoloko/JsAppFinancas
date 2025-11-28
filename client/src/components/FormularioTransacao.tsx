import { useState, useEffect } from 'react';
import { Transacao, Categoria, Subcategoria } from '../types';
import { api } from '../api';
import { converterDataParaBrasileiro, converterDataParaISO, aplicarMascaraData } from '../utils';

interface ErrosValidacao {
  categoria?: string;
  valor?: string;
  data?: string;
}

interface FormularioTransacaoProps {
  transacao?: Transacao;
  onSalvar: (transacao: Transacao) => void;
  onCancelar: () => void;
}

export default function FormularioTransacao({ transacao, onSalvar, onCancelar }: FormularioTransacaoProps) {
  // Função para obter data atual no formato YYYY-MM-DD
  const obterDataAtual = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const [tipo, setTipo] = useState<'receita' | 'despesa'>(transacao?.tipo || 'despesa');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [subcategoriaId, setSubcategoriaId] = useState<number | ''>('');
  const [valor, setValor] = useState(transacao?.valor.toString() || '');
  const [descricao, setDescricao] = useState(transacao?.descricao || '');
  const [dataISO, setDataISO] = useState(transacao?.data || obterDataAtual());
  const [dataBR, setDataBR] = useState(transacao?.data ? converterDataParaBrasileiro(transacao.data) : converterDataParaBrasileiro(obterDataAtual()));
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erros, setErros] = useState<ErrosValidacao>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Carregar categorias ao mudar o tipo
  useEffect(() => {
    carregarCategorias();
  }, [tipo]);

  // Carregar subcategorias quando categoria é selecionada
  useEffect(() => {
    if (categoriaId) {
      carregarSubcategorias(categoriaId);
    } else {
      setSubcategorias([]);
      setSubcategoriaId('');
    }
  }, [categoriaId]);

  // Atualizar data quando transação for carregada
  useEffect(() => {
    if (transacao?.data) {
      setDataISO(transacao.data);
      setDataBR(converterDataParaBrasileiro(transacao.data));
    }
  }, [transacao?.data]);

  // Parsear categoria da transação existente
  useEffect(() => {
    if (transacao?.categoria) {
      const partes = transacao.categoria.split(' > ');
      if (partes.length === 2) {
        // Tem subcategoria: "Categoria > Subcategoria"
        const nomeCategoria = partes[0];
        const nomeSubcategoria = partes[1];
        
        // Buscar IDs correspondentes
        api.obterCategorias(tipo).then(cats => {
          const cat = cats.find(c => c.nome === nomeCategoria);
          if (cat) {
            setCategoriaId(cat.id!);
            api.obterSubcategorias(cat.id!).then(subcats => {
              const subcat = subcats.find(s => s.nome === nomeSubcategoria);
              if (subcat) {
                setSubcategoriaId(subcat.id!);
              }
            });
          }
        });
      } else {
        // Apenas categoria: "Categoria"
        const nomeCategoria = partes[0];
        api.obterCategorias(tipo).then(cats => {
          const cat = cats.find(c => c.nome === nomeCategoria);
          if (cat) {
            setCategoriaId(cat.id!);
          }
        });
      }
    }
  }, [transacao, tipo]);

  const carregarCategorias = async () => {
    try {
      setCarregando(true);
      const cats = await api.obterCategorias(tipo);
      setCategorias(cats);
    } catch (erro) {
      console.error('Erro ao carregar categorias:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const carregarSubcategorias = async (catId: number) => {
    try {
      const subcats = await api.obterSubcategorias(catId);
      setSubcategorias(subcats);
    } catch (erro) {
      console.error('Erro ao carregar subcategorias:', erro);
    }
  };

  const validarCampo = (campo: string, valor: any): string | undefined => {
    switch (campo) {
      case 'categoria':
        if (!categoriaId) {
          return 'Selecione uma categoria';
        }
        return undefined;
      case 'valor':
        if (!valor || valor.trim() === '') {
          return 'O valor é obrigatório';
        }
        const valorNumerico = parseFloat(valor);
        if (isNaN(valorNumerico)) {
          return 'Valor inválido';
        }
        if (valorNumerico <= 0) {
          return 'O valor deve ser maior que zero';
        }
        return undefined;
      case 'data':
        if (!dataBR || dataBR.trim() === '') {
          return 'A data é obrigatória';
        }
        if (dataBR.length !== 10 || !dataBR.includes('/')) {
          return 'Data inválida. Use o formato DD/MM/AAAA';
        }
        const dataConvertida = converterDataParaISO(dataBR);
        if (dataConvertida) {
          const [ano, mes, dia] = dataConvertida.split('-');
          const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
          if (dataObj.getFullYear() != parseInt(ano) || 
              dataObj.getMonth() != parseInt(mes) - 1 || 
              dataObj.getDate() != parseInt(dia)) {
            return 'Data inválida';
          }
        }
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (campo: string) => {
    setTouched({ ...touched, [campo]: true });
    const erro = validarCampo(campo, campo === 'valor' ? valor : campo === 'data' ? dataBR : categoriaId);
    setErros({ ...erros, [campo]: erro });
  };

  const handleChange = (campo: string, valor: any) => {
    if (touched[campo]) {
      const erro = validarCampo(campo, valor);
      setErros({ ...erros, [campo]: erro });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos os campos como touched
    const todosTouched = { categoria: true, valor: true, data: true };
    setTouched(todosTouched);

    // Validar todos os campos
    const novosErros: ErrosValidacao = {};
    novosErros.categoria = validarCampo('categoria', categoriaId);
    novosErros.valor = validarCampo('valor', valor);
    novosErros.data = validarCampo('data', dataBR);

    setErros(novosErros);

    // Se houver erros, não submeter
    if (novosErros.categoria || novosErros.valor || novosErros.data) {
      return;
    }

    // Montar string de categoria: "Categoria" ou "Categoria > Subcategoria"
    const categoriaSelecionada = categorias.find(c => c.id === categoriaId);
    let categoriaString = categoriaSelecionada?.nome || '';
    
    if (subcategoriaId) {
      const subcategoriaSelecionada = subcategorias.find(s => s.id === subcategoriaId);
      if (subcategoriaSelecionada) {
        categoriaString = `${categoriaString} > ${subcategoriaSelecionada.nome}`;
      }
    }

    // Converter data brasileira para ISO antes de salvar
    const dataFinal = dataBR.includes('/') ? converterDataParaISO(dataBR) : dataISO;
    
    // Converter valor para número
    const valorNumerico = parseFloat(valor.replace(',', '.')) || 0;

    const novaTransacao: Transacao = {
      id: transacao?.id,
      tipo,
      categoria: categoriaString,
      valor: valorNumerico,
      descricao: descricao.trim(),
      data: dataFinal
    };

    onSalvar(novaTransacao);
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
        <label htmlFor="categoria">Categoria *</label>
        {carregando ? (
          <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--cor-texto-secundario)' }}>
            Carregando categorias...
          </div>
        ) : (
          <>
            <select
              id="categoria"
              value={categoriaId === '' ? '' : String(categoriaId)}
              onChange={(e) => {
                const novoValor = e.target.value ? parseInt(e.target.value) : '';
                setCategoriaId(novoValor);
                handleChange('categoria', novoValor);
              }}
              onBlur={() => handleBlur('categoria')}
              className={touched.categoria && erros.categoria ? 'input-erro' : touched.categoria && !erros.categoria ? 'input-valido' : ''}
              required
              aria-label="Categoria da transação"
              aria-invalid={touched.categoria && erros.categoria ? 'true' : 'false'}
              aria-describedby={touched.categoria && erros.categoria ? 'erro-categoria' : undefined}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
            {touched.categoria && erros.categoria && (
              <span id="erro-categoria" className="erro-mensagem" role="alert">{erros.categoria}</span>
            )}
          </>
        )}
      </div>

      {categoriaId && (
        <div className="form-grupo">
          <label htmlFor="subcategoria">Subcategoria (opcional)</label>
          <select
            id="subcategoria"
            value={subcategoriaId === '' ? '' : String(subcategoriaId)}
            onChange={(e) => setSubcategoriaId(e.target.value ? parseInt(e.target.value) : '')}
            aria-label="Subcategoria da transação (opcional)"
          >
            <option value="">Nenhuma subcategoria</option>
            {subcategorias.map((subcat) => (
              <option key={subcat.id} value={subcat.id}>
                {subcat.nome}
              </option>
            ))}
          </select>
          {subcategorias.length === 0 && (
            <div style={{ fontSize: '0.85rem', color: 'var(--cor-texto-secundario)', marginTop: '0.5rem' }}>
              Esta categoria não possui subcategorias. Você pode criar uma na aba de Categorias.
            </div>
          )}
        </div>
      )}

      <div className="form-grupo">
        <label htmlFor="valor">Valor (R$) *</label>
        <input
          id="valor"
          type="number"
          step="0.01"
          min="0.01"
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            handleChange('valor', e.target.value);
          }}
          onBlur={() => handleBlur('valor')}
          placeholder="0,00"
          className={touched.valor && erros.valor ? 'input-erro' : touched.valor && !erros.valor ? 'input-valido' : ''}
          required
          aria-label="Valor da transação em reais"
          aria-invalid={touched.valor && erros.valor ? 'true' : 'false'}
          aria-describedby={touched.valor && erros.valor ? 'erro-valor' : undefined}
        />
        {touched.valor && erros.valor && (
          <span id="erro-valor" className="erro-mensagem" role="alert">{erros.valor}</span>
        )}
      </div>

      <div className="form-grupo">
        <label htmlFor="data">Data *</label>
        <input
          id="data"
          type="text"
          value={dataBR}
          onChange={(e) => {
            const valorFormatado = aplicarMascaraData(e.target.value);
            setDataBR(valorFormatado);
            handleChange('data', valorFormatado);
            // Se tiver 10 caracteres (DD/MM/YYYY completo), converter para ISO
            if (valorFormatado.length === 10) {
              const dataConvertida = converterDataParaISO(valorFormatado);
              if (dataConvertida) {
                setDataISO(dataConvertida);
              }
            }
          }}
          onBlur={() => {
            handleBlur('data');
            // Validar data ao sair do campo
            if (dataBR.length === 10) {
              const dataConvertida = converterDataParaISO(dataBR);
              if (dataConvertida) {
                const [ano, mes, dia] = dataConvertida.split('-');
                const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
                if (dataObj.getFullYear() != parseInt(ano) || 
                    dataObj.getMonth() != parseInt(mes) - 1 || 
                    dataObj.getDate() != parseInt(dia)) {
                  setDataBR(converterDataParaBrasileiro(dataISO));
                }
              }
            }
          }}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          className={touched.data && erros.data ? 'input-erro' : touched.data && !erros.data ? 'input-valido' : ''}
          required
          aria-label="Data da transação no formato dia/mês/ano"
          aria-invalid={touched.data && erros.data ? 'true' : 'false'}
          aria-describedby={touched.data && erros.data ? 'erro-data' : undefined}
        />
        {touched.data && erros.data && (
          <span id="erro-data" className="erro-mensagem" role="alert">{erros.data}</span>
        )}
      </div>

      <div className="form-grupo">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Adicione uma descrição (opcional)"
          aria-label="Descrição da transação (opcional)"
        />
      </div>

      <div className="form-acoes">
        <button type="button" className="btn btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className={`btn ${tipo === 'receita' ? 'btn-receita' : 'btn-despesa'}`}>
          {transacao ? 'Atualizar' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
}

