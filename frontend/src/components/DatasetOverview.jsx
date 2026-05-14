import React from 'react'

const DTYPE_COLORS = {
  numeric: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  categorical: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  datetime: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  text: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const TASK_ICONS = {
  classification: '🎯',
  regression: '📈',
  clustering: '🔵',
  time_series: '⏱️',
  unknown: '❓',
}

function QualityColor(score) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

function CircleProgress({ value, size = 64 }) {
  const radius = 24
  const circ = 2 * Math.PI * radius
  const stroke = circ - (value / 100) * circ
  const color = value >= 80 ? '#34d399' : value >= 60 ? '#fbbf24' : '#f87171'
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={radius} fill="none" stroke="#1E293B" strokeWidth="6" />
      <circle
        cx="28" cy="28" r={radius} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={stroke}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="28" y="33" textAnchor="middle" fill={color} fontSize="12" fontWeight="bold">{Math.round(value)}</text>
    </svg>
  )
}

export default function DatasetOverview({ dataset, llmExplanation, expertiseLevel, onProceed, loading }) {
  if (!dataset) return null

  const analysis = dataset.analysis || dataset
  const shape = analysis.shape || {}
  const columns = analysis.columns || []
  const issues = analysis.issues || []
  const quality = analysis.data_quality_score || 0
  const taskType = analysis.task_type || 'unknown'
  const confidence = analysis.task_confidence || 0
  const targetSuggestions = analysis.target_suggestions || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dataset Analysis</h1>
        <p className="text-slate-400 text-sm">Here's what DataMind AI found in your dataset</p>
      </div>

      {/* SECTION 1 — Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Rows', value: (shape.rows || 0).toLocaleString(), icon: '📋', color: 'blue' },
          { label: 'Columns', value: shape.columns || 0, icon: '📊', color: 'purple' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}

        {/* Quality Score */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center">
          <CircleProgress value={quality} />
          <div className="text-slate-400 text-xs mt-1">Quality Score</div>
        </div>

        {/* Task Type */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">{TASK_ICONS[taskType]}</div>
          <div className="text-base font-bold text-white capitalize">{taskType.replace('_', ' ')}</div>
          <div className="text-slate-400 text-xs mt-0.5">Task detected</div>
          <div className="text-blue-400 text-xs mt-1">{Math.round(confidence * 100)}% confidence</div>
        </div>
      </div>

      {/* SECTION 2 — AI Explanation */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="gradient-text text-lg font-bold">✦ AI Analysis</span>
          {expertiseLevel && (
            <span className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full capitalize">
              {expertiseLevel}
            </span>
          )}
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 skeleton rounded" style={{ width: `${100 - i * 10}%` }} />
            ))}
          </div>
        ) : (
          <p className="text-slate-300 leading-relaxed text-sm">
            {llmExplanation || 'AI explanation loading...'}
          </p>
        )}
        {targetSuggestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <span className="text-slate-500 text-xs">Suggested target column: </span>
            <span className="text-blue-400 text-xs font-medium">{targetSuggestions[0]}</span>
          </div>
        )}
      </div>

      {/* SECTION 3 — Column Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-6">
        <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Column Details</h2>
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-900">
              <tr className="text-slate-400 text-xs uppercase border-b border-slate-700/50">
                <th className="text-left py-2 pr-4">Column</th>
                <th className="text-left py-2 pr-4">Type</th>
                <th className="text-left py-2 pr-4">Missing</th>
                <th className="text-left py-2 pr-4">Unique</th>
                <th className="text-left py-2">Samples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {columns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-700/20 transition-colors">
                  <td className="py-2 pr-4 font-mono text-slate-200 text-xs">{col.name}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${DTYPE_COLORS[col.dtype] || DTYPE_COLORS.categorical}`}>
                      {col.dtype}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${col.missing_pct > 10 ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, col.missing_pct)}%` }}
                        />
                      </div>
                      <span className={`text-xs ${col.missing_pct > 10 ? 'text-red-400' : 'text-slate-400'}`}>
                        {col.missing_pct?.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-slate-400 text-xs">{col.unique_count}</td>
                  <td className="py-2 text-slate-500 text-xs truncate max-w-[150px]">
                    {(col.sample_values || []).slice(0, 3).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4 — Issues */}
      <div className="mb-6">
        {issues.length > 0 ? (
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
                <span className="text-yellow-400 mt-0.5">⚠️</span>
                <p className="text-yellow-200 text-sm">{issue}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
            <span className="text-emerald-400">✅</span>
            <p className="text-emerald-300 text-sm">Data quality looks good! No critical issues detected.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        id="proceed-models-btn"
        onClick={onProceed}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25 text-lg"
      >
        Proceed to Model Recommendations →
      </button>
    </div>
  )
}
