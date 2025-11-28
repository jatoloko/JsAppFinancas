import { formatarMoeda } from '../utils';

interface GraficoBarrasProps {
  dados: Array<{ nome: string; valor: number; cor: string }>;
  altura?: number;
}

export default function GraficoBarras({ dados, altura = 200 }: GraficoBarrasProps) {
  if (dados.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--cor-texto-secundario)' }}>
        Sem dados para exibir
      </div>
    );
  }

  const maxValor = Math.max(...dados.map(d => d.valor));

  return (
    <div style={{ position: 'relative', height: `${altura}px`, display: 'flex', alignItems: 'flex-end', gap: '0.5rem', padding: '1rem 0' }}>
      {dados.map((item, index) => {
        const alturaBarra = maxValor > 0 ? (item.valor / maxValor) * 100 : 0;
        return (
          <div
            key={index}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '60px'
            }}
          >
            <div
              style={{
                width: '100%',
                height: `${alturaBarra}%`,
                backgroundColor: item.cor,
                borderRadius: '8px 8px 0 0',
                minHeight: alturaBarra > 0 ? '4px' : '0',
                transition: 'all 0.5s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '0.5rem'
              }}
              title={`${item.nome}: ${formatarMoeda(item.valor)}`}
            >
              {alturaBarra > 15 && (
                <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                  {formatarMoeda(item.valor)}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--cor-texto)',
                textAlign: 'center',
                wordBreak: 'break-word',
                maxWidth: '100%'
              }}
            >
              {item.nome}
            </div>
          </div>
        );
      })}
    </div>
  );
}

