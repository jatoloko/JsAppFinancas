interface GraficoPizzaProps {
  dados: Array<{ nome: string; valor: number; cor: string }>;
  tamanho?: number;
}

export default function GraficoPizza({ dados, tamanho = 200 }: GraficoPizzaProps) {
  if (dados.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--cor-texto-secundario)' }}>
        Sem dados para exibir
      </div>
    );
  }

  const total = dados.reduce((sum, item) => sum + item.valor, 0);
  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--cor-texto-secundario)' }}>
        Sem dados para exibir
      </div>
    );
  }

  const raio = tamanho / 2 - 10;
  const centro = tamanho / 2;
  let anguloAtual = -90; // Começa no topo

  const segmentos = dados.map((item) => {
    const porcentagem = (item.valor / total) * 100;
    const angulo = (porcentagem / 100) * 360;
    
    const x1 = centro + raio * Math.cos((anguloAtual * Math.PI) / 180);
    const y1 = centro + raio * Math.sin((anguloAtual * Math.PI) / 180);
    
    const x2 = centro + raio * Math.cos(((anguloAtual + angulo) * Math.PI) / 180);
    const y2 = centro + raio * Math.sin(((anguloAtual + angulo) * Math.PI) / 180);
    
    const largeArc = angulo > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centro} ${centro}`,
      `L ${x1} ${y1}`,
      `A ${raio} ${raio} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    const anguloInicial = anguloAtual;
    anguloAtual += angulo;

    return {
      ...item,
      pathData,
      porcentagem,
      anguloInicial,
      angulo
    };
  });

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: '0 0 auto' }}>
        <svg width={tamanho} height={tamanho} style={{ display: 'block' }}>
          {segmentos.map((segmento, index) => (
            <path
              key={index}
              d={segmento.pathData}
              fill={segmento.cor}
              stroke="white"
              strokeWidth="2"
              style={{ transition: 'opacity 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            />
          ))}
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: '200px' }}>
        {dados.map((item, index) => {
          const porcentagem = (item.valor / total) * 100;
          return (
            <div key={index} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  backgroundColor: item.cor,
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1, fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.nome}</span>
                  <span style={{ fontWeight: 700, color: item.cor }}>{porcentagem.toFixed(1)}%</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--cor-texto-secundario)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

