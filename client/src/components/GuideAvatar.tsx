// Guide avatar — the glowing orb mascot used across the app
export default function GuideAvatar({ size = 44, animate = true }: { size?: number; animate?: boolean }) {
  return (
    <div className={animate ? "animate-bounce-slow" : ""} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <radialGradient id="guideGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFD6A5" />
            <stop offset="60%" stopColor="#FFB6B9" />
            <stop offset="100%" stopColor="#C9B6E4" />
          </radialGradient>
          <radialGradient id="innerGlow" cx="50%" cy="35%" r="40%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="48" r="38" fill="url(#guideGlow)" opacity="0.3" />
        <ellipse cx="50" cy="50" rx="28" ry="30" fill="url(#guideGlow)" />
        <ellipse cx="50" cy="44" rx="20" ry="18" fill="url(#innerGlow)" />
        <ellipse cx="40" cy="46" rx="4" ry="4.5" fill="#5a4a3a" />
        <ellipse cx="60" cy="46" rx="4" ry="4.5" fill="#5a4a3a" />
        <circle cx="41.5" cy="44.5" r="1.5" fill="white" />
        <circle cx="61.5" cy="44.5" r="1.5" fill="white" />
        <path
          d="M 40 56 Q 50 63 60 56"
          fill="none"
          stroke="#5a4a3a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="72" cy="30" r="2" fill="#FFD6A5" opacity="0.8" />
        <circle cx="28" cy="35" r="1.5" fill="#C9B6E4" opacity="0.6" />
      </svg>
    </div>
  );
}
