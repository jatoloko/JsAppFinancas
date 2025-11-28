interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({ width = '100%', height = '1rem', borderRadius = '8px', className = '', style }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton width="60%" height="1.5rem" borderRadius="8px" />
      <div style={{ marginTop: '1rem' }}>
        <Skeleton width="100%" height="3rem" borderRadius="12px" />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <Skeleton width="80%" height="1rem" borderRadius="8px" />
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="card">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          <Skeleton width="3rem" height="3rem" borderRadius="12px" />
          <div style={{ flex: 1 }}>
            <Skeleton width="40%" height="1.25rem" borderRadius="8px" />
            <Skeleton width="60%" height="1rem" borderRadius="8px" style={{ marginTop: '0.5rem' }} />
          </div>
          <Skeleton width="6rem" height="1.5rem" borderRadius="8px" />
        </div>
      ))}
    </div>
  );
}

