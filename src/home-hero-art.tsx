/** Soft subway-platform backdrop for the home hero. Decorative only. */
export function HomeHeroArt() {
  return <svg className="home-hero-art" viewBox="0 0 390 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="hh-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dfeee3"/>
        <stop offset="1" stopColor="#f3f7f1"/>
      </linearGradient>
      <linearGradient id="hh-train" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3f704c"/>
        <stop offset="1" stopColor="#2f5a3c"/>
      </linearGradient>
    </defs>
    <rect width="390" height="220" fill="url(#hh-sky)"/>
    <rect x="0" y="148" width="390" height="72" fill="#e7efe4"/>
    <path d="M0 148 H390" stroke="#c5d6c8" strokeWidth="2"/>
    <path d="M0 168 H390 M0 188 H390" stroke="#d5e2d6" strokeWidth="1.5" strokeDasharray="10 8"/>
    <g transform="translate(168 46)">
      <rect x="18" y="0" width="8" height="42" rx="2" fill="#9bb3a0"/>
      <rect x="96" y="0" width="8" height="42" rx="2" fill="#9bb3a0"/>
      <rect x="0" y="36" width="122" height="58" rx="10" fill="url(#hh-train)"/>
      <rect x="10" y="46" width="28" height="22" rx="4" fill="#dceca6" opacity=".9"/>
      <rect x="46" y="46" width="28" height="22" rx="4" fill="#dceca6" opacity=".9"/>
      <rect x="82" y="46" width="28" height="22" rx="4" fill="#dceca6" opacity=".9"/>
      <rect x="0" y="88" width="122" height="10" rx="3" fill="#284b34"/>
      <circle cx="28" cy="102" r="7" fill="#2a3430"/>
      <circle cx="94" cy="102" r="7" fill="#2a3430"/>
    </g>
    <g transform="translate(292 28)">
      <rect width="14" height="96" rx="3" fill="#3f704c"/>
      <rect x="-34" y="18" width="82" height="52" rx="8" fill="#3f704c"/>
      <text x="7" y="40" textAnchor="middle" fill="#f4faf4" fontSize="9" fontWeight="700">수어로</text>
      <text x="7" y="54" textAnchor="middle" fill="#dceca6" fontSize="8" fontWeight="650">더 가까운 세상</text>
    </g>
  </svg>;
}
