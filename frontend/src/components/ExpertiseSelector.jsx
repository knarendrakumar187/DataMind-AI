import React from 'react'

const levels = [
  {
    id: 'beginner',
    icon: '🌱',
    title: 'Beginner',
    description: 'New to data science. I want simple explanations and guided steps.',
    features: ['Plain English explanations', 'Step-by-step guidance', 'No jargon'],
    color: 'emerald',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    badge: null,
    ring: 'focus:ring-emerald-500',
    accent: 'bg-emerald-500/10 text-emerald-400',
    btn: 'bg-emerald-600 hover:bg-emerald-500',
  },
  {
    id: 'intermediate',
    icon: '⚡',
    title: 'Intermediate',
    description: 'I know ML basics. I want technical details and model insights.',
    features: ['Technical metrics', 'Model comparison', 'Parameter details'],
    color: 'blue',
    border: 'border-blue-500/60 hover:border-blue-400',
    badge: 'Most Popular',
    ring: 'focus:ring-blue-500',
    accent: 'bg-blue-500/10 text-blue-400',
    btn: 'bg-blue-600 hover:bg-blue-500',
  },
  {
    id: 'expert',
    icon: '🔬',
    title: 'Expert',
    description: "I'm a data scientist. Give me full technical depth and insights.",
    features: ['Advanced metrics', 'Statistical analysis', 'Research-level detail'],
    color: 'purple',
    border: 'border-purple-500/40 hover:border-purple-400',
    badge: null,
    ring: 'focus:ring-purple-500',
    accent: 'bg-purple-500/10 text-purple-400',
    btn: 'bg-purple-600 hover:bg-purple-500',
  },
]

export default function ExpertiseSelector({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        {/* Premium Logo Mark */}
        <div className="flex justify-center mb-5">
          <svg width="72" height="72" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B82F6"/>
                <stop offset="100%" stopColor="#8B5CF6"/>
              </linearGradient>
              <linearGradient id="heroBg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e3a5f"/>
                <stop offset="100%" stopColor="#2d1b69"/>
              </linearGradient>
              <filter id="heroGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <rect width="36" height="36" rx="9" fill="url(#heroBg)"/>
            <rect width="36" height="36" rx="9" fill="url(#heroGrad)" fillOpacity="0.2"/>
            <rect x="0.5" y="0.5" width="35" height="35" rx="8.5" stroke="url(#heroGrad)" strokeOpacity="0.8" strokeWidth="1"/>
            <g filter="url(#heroGlow)" strokeWidth="1" strokeLinecap="round" opacity="0.8">
              <line x1="18" y1="18" x2="9"  y2="10" stroke="url(#heroGrad)"/>
              <line x1="18" y1="18" x2="27" y2="10" stroke="url(#heroGrad)"/>
              <line x1="18" y1="18" x2="9"  y2="26" stroke="url(#heroGrad)"/>
              <line x1="18" y1="18" x2="27" y2="26" stroke="url(#heroGrad)"/>
              <line x1="18" y1="18" x2="18" y2="7"  stroke="url(#heroGrad)"/>
              <line x1="18" y1="18" x2="18" y2="29" stroke="url(#heroGrad)"/>
              <line x1="18" y1="18" x2="7"  y2="18" stroke="url(#heroGrad)"/>
              <line x1="18" y1="18" x2="29" y2="18" stroke="url(#heroGrad)"/>
              <line x1="9"  y1="10" x2="18" y2="7"  stroke="#3B82F6" strokeOpacity="0.5"/>
              <line x1="18" y1="7"  x2="27" y2="10" stroke="#3B82F6" strokeOpacity="0.5"/>
              <line x1="27" y1="10" x2="29" y2="18" stroke="#8B5CF6" strokeOpacity="0.5"/>
              <line x1="29" y1="18" x2="27" y2="26" stroke="#8B5CF6" strokeOpacity="0.5"/>
              <line x1="27" y1="26" x2="18" y2="29" stroke="#8B5CF6" strokeOpacity="0.5"/>
              <line x1="18" y1="29" x2="9"  y2="26" stroke="#3B82F6" strokeOpacity="0.5"/>
              <line x1="9"  y1="26" x2="7"  y2="18" stroke="#3B82F6" strokeOpacity="0.5"/>
              <line x1="7"  y1="18" x2="9"  y2="10" stroke="#3B82F6" strokeOpacity="0.5"/>
            </g>
            <g filter="url(#heroGlow)">
              <circle cx="9"  cy="10" r="2.2" fill="#3B82F6"/>
              <circle cx="27" cy="10" r="2.2" fill="#3B82F6"/>
              <circle cx="9"  cy="26" r="2.2" fill="#8B5CF6"/>
              <circle cx="27" cy="26" r="2.2" fill="#8B5CF6"/>
              <circle cx="18" cy="7"  r="2"   fill="#60A5FA"/>
              <circle cx="18" cy="29" r="2"   fill="#A78BFA"/>
              <circle cx="7"  cy="18" r="2"   fill="#60A5FA"/>
              <circle cx="29" cy="18" r="2"   fill="#A78BFA"/>
            </g>
            <circle cx="18" cy="18" r="3.5" fill="url(#heroGrad)" filter="url(#heroGlow)"/>
            <circle cx="18" cy="18" r="2"   fill="white" fillOpacity="0.95"/>
          </svg>
        </div>
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-6 font-medium">
          <span>🏆</span> ABB EngineeredX 2.0 · Problem Statement 8
        </div>
        <h1 className="text-5xl sm:text-6xl font-black mb-4 leading-tight">
          <span className="gradient-text">DataMind AI</span>
        </h1>
        <p className="text-slate-400 text-lg mb-3 max-w-xl mx-auto leading-relaxed">
          Intelligent Data Science Assistant powered by{' '}
          <span className="text-orange-400 font-semibold">Groq LLaMA 3</span>
        </p>
        <p className="text-slate-500 text-sm">
          Upload any CSV → Auto-detect ML task → Get model recommendations → Train & Explain
        </p>
      </div>

      {/* Cards */}
      <p className="text-slate-400 text-sm mb-6 font-medium tracking-wide uppercase">
        Select your expertise level to get started
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full">
        {levels.map((level) => (
          <button
            key={level.id}
            id={`expertise-${level.id}`}
            onClick={() => onSelect(level.id)}
            className={`relative group bg-slate-800/60 border-2 ${level.border} rounded-2xl p-6 text-left 
              transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer
              focus:outline-none ${level.ring} focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900`}
          >
            {level.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                {level.badge}
              </div>
            )}
            <div className="text-4xl mb-3">{level.icon}</div>
            <h2 className="text-xl font-bold text-white mb-2">{level.title}</h2>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">{level.description}</p>
            <ul className="space-y-2 mb-5">
              {level.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className={`w-1.5 h-1.5 rounded-full ${level.btn.split(' ')[0]}`} />
                  {f}
                </li>
              ))}
            </ul>
            <div className={`w-full py-2 rounded-lg text-center text-sm font-semibold text-white ${level.btn} transition-colors`}>
              Start as {level.title} →
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p className="text-slate-600 text-xs mt-10 text-center">
        No account needed · Powered by Groq LLaMA 3 (Free) · SRM University-AP
      </p>
    </div>
  )
}
