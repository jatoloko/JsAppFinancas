export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarData = (data: string): string => {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const formatarDataInput = (data: string): string => {
  // Converte dd/mm/yyyy para yyyy-mm-dd
  if (data.includes('/')) {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  }
  return data;
};

export const converterDataParaBrasileiro = (dataISO: string): string => {
  // Converte yyyy-mm-dd para dd/mm/yyyy
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const converterDataParaISO = (dataBR: string): string => {
  // Converte dd/mm/yyyy para yyyy-mm-dd
  if (!dataBR) return '';
  const [dia, mes, ano] = dataBR.split('/');
  return `${ano}-${mes}-${dia}`;
};

export const aplicarMascaraData = (valor: string): string => {
  // Remove tudo que não é número
  const apenasNumeros = valor.replace(/\D/g, '');
  
  // Aplica a máscara DD/MM/YYYY
  if (apenasNumeros.length <= 2) {
    return apenasNumeros;
  } else if (apenasNumeros.length <= 4) {
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
  } else {
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
  }
};

export const obterMesAnoAtual = (): { mes: number; ano: number } => {
  const hoje = new Date();
  return {
    mes: hoje.getMonth() + 1,
    ano: hoje.getFullYear()
  };
};

export const obterNomeMes = (mes: number): string => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1];
};

export const calcularPorcentagem = (valor: number, total: number): number => {
  if (total === 0) return 0;
  return (valor / total) * 100;
};

