import React from 'react'

const STAGES = [
  { id: 1, label: 'Setup' },
  { id: 2, label: 'Upload' },
  { id: 3, label: 'Analyze' },
  { id: 4, label: 'Model' },
  { id: 5, label: 'Results' },
]

const EXPERTISE_COLORS = {
  beginner: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  intermediate: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  expert: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
}

export default function Header({ currentStage, expertiseLevel, onReset }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A1628] border-b border-slate-700/50 flex items-center px-4 gap-4"
      style={{ boxShadow: '0 1px 20px rgba(0,0,0,0.5)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 min-w-fit">
        {/* Premium SVG Neural Network Logo */}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-lg">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e3a5f"/>
              <stop offset="100%" stopColor="#2d1b69"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Background rounded square */}
          <rect width="36" height="36" rx="9" fill="url(#bgGrad)"/>
          <rect width="36" height="36" rx="9" fill="url(#logoGrad)" fillOpacity="0.15"/>
          <rect x="0.5" y="0.5" width="35" height="35" rx="8.5" stroke="url(#logoGrad)" strokeOpacity="0.6" strokeWidth="1"/>

          {/* Neural network connections */}
          <g filter="url(#glow)" strokeWidth="1" strokeLinecap="round" opacity="0.7">
            {/* Center to outer nodes */}
            <line x1="18" y1="18" x2="9"  y2="10" stroke="url(#logoGrad)"/>
            <line x1="18" y1="18" x2="27" y2="10" stroke="url(#logoGrad)"/>
            <line x1="18" y1="18" x2="9"  y2="26" stroke="url(#logoGrad)"/>
            <line x1="18" y1="18" x2="27" y2="26" stroke="url(#logoGrad)"/>
            <line x1="18" y1="18" x2="18" y2="7"  stroke="url(#logoGrad)"/>
            <line x1="18" y1="18" x2="18" y2="29" stroke="url(#logoGrad)"/>
            <line x1="18" y1="18" x2="7"  y2="18" stroke="url(#logoGrad)"/>
            <line x1="18" y1="18" x2="29" y2="18" stroke="url(#logoGrad)"/>
            {/* Outer ring connections */}
            <line x1="9"  y1="10" x2="18" y2="7"  stroke="#3B82F6" strokeOpacity="0.5"/>
            <line x1="18" y1="7"  x2="27" y2="10" stroke="#3B82F6" strokeOpacity="0.5"/>
            <line x1="27" y1="10" x2="29" y2="18" stroke="#8B5CF6" strokeOpacity="0.5"/>
            <line x1="29" y1="18" x2="27" y2="26" stroke="#8B5CF6" strokeOpacity="0.5"/>
            <line x1="27" y1="26" x2="18" y2="29" stroke="#8B5CF6" strokeOpacity="0.5"/>
            <line x1="18" y1="29" x2="9"  y2="26" stroke="#3B82F6" strokeOpacity="0.5"/>
            <line x1="9"  y1="26" x2="7"  y2="18" stroke="#3B82F6" strokeOpacity="0.5"/>
            <line x1="7"  y1="18" x2="9"  y2="10" stroke="#3B82F6" strokeOpacity="0.5"/>
          </g>

          {/* Outer nodes */}
          <g filter="url(#glow)">
            <circle cx="9"  cy="10" r="2.2" fill="#3B82F6" fillOpacity="0.9"/>
            <circle cx="27" cy="10" r="2.2" fill="#3B82F6" fillOpacity="0.9"/>
            <circle cx="9"  cy="26" r="2.2" fill="#8B5CF6" fillOpacity="0.9"/>
            <circle cx="27" cy="26" r="2.2" fill="#8B5CF6" fillOpacity="0.9"/>
            <circle cx="18" cy="7"  r="2"   fill="#60A5FA" fillOpacity="0.9"/>
            <circle cx="18" cy="29" r="2"   fill="#A78BFA" fillOpacity="0.9"/>
            <circle cx="7"  cy="18" r="2"   fill="#60A5FA" fillOpacity="0.9"/>
            <circle cx="29" cy="18" r="2"   fill="#A78BFA" fillOpacity="0.9"/>
          </g>

          {/* Center node — brightest */}
          <circle cx="18" cy="18" r="3.5" fill="url(#logoGrad)" filter="url(#glow)"/>
          <circle cx="18" cy="18" r="2"   fill="white" fillOpacity="0.95"/>
        </svg>

        <div>
          <div className="text-white font-bold text-sm leading-tight tracking-tight">DataMind AI</div>
          <div className="text-slate-500 text-[10px] leading-tight">ABB EngineeredX 2.0</div>
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-0">
          {STAGES.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              {idx > 0 && (
                <div className={`h-0.5 w-8 sm:w-12 transition-all duration-500 ${
                  currentStage > idx ? 'bg-blue-500' : 'bg-slate-700'
                }`} />
              )}
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                  currentStage > stage.id
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : currentStage === stage.id
                    ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800 border-slate-600 text-slate-500'
                }`}>
                  {currentStage > stage.id ? '✓' : stage.id}
                </div>
                <span className={`text-[9px] hidden sm:block ${
                  currentStage >= stage.id ? 'text-slate-300' : 'text-slate-600'
                }`}>{stage.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Expertise + Reset */}
      <div className="flex items-center gap-2 min-w-fit">
        {expertiseLevel && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border capitalize ${EXPERTISE_COLORS[expertiseLevel] || EXPERTISE_COLORS.beginner}`}>
            {expertiseLevel}
          </span>
        )}
        <button
          onClick={onReset}
          id="reset-btn"
          className="px-3 py-1.5 text-xs border border-slate-600 text-slate-400 rounded-lg hover:border-slate-400 hover:text-slate-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </header>
  )
}
