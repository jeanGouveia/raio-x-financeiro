export default function ScoreGauge({ score }) {
  const arcLen = 148;
  const progress = Math.round((score / 100) * arcLen);
  const color = score >= 70 ? "#1a9e6e" : score >= 40 ? "#f59e0b" : "#ef4444";
  // arco semicircular: M8,58 A47,47 0 0,1 102,58
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <svg width="110" height="65" viewBox="0 0 110 65">
        {/* trilho */}
        <path
          d="M8,58 A47,47 0 0,1 102,58"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* progresso */}
        <path
          d="M8,58 A47,47 0 0,1 102,58"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${arcLen}`}
        />
        <text
          x="55" y="52"
          textAnchor="middle"
          fontFamily="ui-monospace, monospace"
          fontSize="15"
          fontWeight="500"
          fill={color}
        >
          {score}%
        </text>
      </svg>
      <span style={{ fontSize: "11px", color: "rgba(148,163,184,0.7)" }}>Escala 0–100</span>
    </div>
  );
}