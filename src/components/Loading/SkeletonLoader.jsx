import DesignTokens from '../../constants/DesignTokens';

const SkeletonLoader = ({
  width = '100%',
  height = 20,
  borderRadius = DesignTokens.borderRadius.md,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(
          90deg,
          ${DesignTokens.colors.neutral.gray200} 0%,
          ${DesignTokens.colors.neutral.gray300} 50%,
          ${DesignTokens.colors.neutral.gray200} 100%
        )`,
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
};

const SkeletonText = ({
  lines = 3,
  lineHeight = 16,
  gap = 8,
  lastLineWidth = '60%',
  className = '',
}) => {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap }}>
      {[...Array(lines - 1)].map((_, i) => (
        <SkeletonLoader key={i} width="100%" height={lineHeight} />
      ))}
      <SkeletonLoader width={lastLineWidth} height={lineHeight} />
    </div>
  );
};

const SkeletonCard = ({
  showAvatar = true,
  showTitle = true,
  showDescription = true,
  showImage = false,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: DesignTokens.borderRadius.xl,
        padding: DesignTokens.spacing.lg,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: DesignTokens.shadows.sm,
      }}
    >
      {showAvatar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: DesignTokens.spacing.md, marginBottom: DesignTokens.spacing.md }}>
          <SkeletonLoader width={48} height={48} borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <SkeletonLoader width="60%" height={16} style={{ marginBottom: DesignTokens.spacing.xs }} />
            <SkeletonLoader width="40%" height={12} />
          </div>
        </div>
      )}

      {showImage && (
        <SkeletonLoader
          width="100%"
          height={120}
          borderRadius={DesignTokens.borderRadius.lg}
          style={{ marginBottom: DesignTokens.spacing.md }}
        />
      )}

      {showTitle && (
        <SkeletonLoader
          width="80%"
          height={20}
          borderRadius={DesignTokens.borderRadius.sm}
          style={{ marginBottom: DesignTokens.spacing.xs }}
        />
      )}

      {showDescription && (
        <SkeletonText lines={3} lineHeight={14} gap={6} />
      )}
    </div>
  );
};

const SkeletonButton = ({
  width = 120,
  height = 40,
  className = '',
}) => {
  return (
    <div className={className}>
      <SkeletonLoader
        width={width}
        height={height}
        borderRadius={DesignTokens.borderRadius.xl}
      />
    </div>
  );
};

const SkeletonList = ({
  items = 5,
  showAvatar = true,
  showContent = true,
  className = '',
}) => {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: DesignTokens.spacing.md }}>
      {[...Array(items)].map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: DesignTokens.spacing.md,
            padding: DesignTokens.spacing.md,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: DesignTokens.borderRadius.lg,
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {showAvatar && (
            <SkeletonLoader width={40} height={40} borderRadius="50%" />
          )}
          <div style={{ flex: 1 }}>
            <SkeletonLoader width="40%" height={14} style={{ marginBottom: 8 }} />
            <SkeletonText lines={2} lineHeight={12} gap={4} />
          </div>
        </div>
      ))}
    </div>
  );
};

const SkeletonGrid = ({
  items = 4,
  columns = 2,
  className = '',
}) => {
  const itemsPerRow = [];
  for (let i = 0; i < items; i += columns) {
    itemsPerRow.push([...Array(Math.min(columns, items - i))]);
  }

  return (
    <div className={className}>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {itemsPerRow.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: DesignTokens.spacing.md,
            marginBottom: DesignTokens.spacing.md,
          }}
        >
          {row.map((_, itemIndex) => (
            <SkeletonCard key={`${rowIndex}-${itemIndex}`} showImage />
          ))}
        </div>
      ))}
    </div>
  );
};

const SkeletonProfile = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: DesignTokens.spacing.xl,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: DesignTokens.borderRadius.xl,
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <SkeletonLoader width={80} height={80} borderRadius="50%" style={{ marginBottom: DesignTokens.spacing.md }} />
      <SkeletonLoader width="50%" height={24} borderRadius={DesignTokens.borderRadius.sm} style={{ marginBottom: DesignTokens.spacing.xs }} />
      <SkeletonLoader width="30%" height={14} style={{ marginBottom: DesignTokens.spacing.lg }} />
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
        {[1, 2, 3].map((_, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <SkeletonLoader width={48} height={48} borderRadius="50%" style={{ marginBottom: 4 }} />
            <SkeletonLoader width={40} height={10} />
          </div>
        ))}
      </div>
    </div>
  );
};

const SkeletonCircle = ({
  size = 40,
  className = '',
}) => {
  return (
    <div className={className}>
      <SkeletonLoader width={size} height={size} borderRadius="50%" />
    </div>
  );
};

export {
  SkeletonLoader as default,
  SkeletonText,
  SkeletonCard,
  SkeletonButton,
  SkeletonList,
  SkeletonGrid,
  SkeletonProfile,
  SkeletonCircle,
};
