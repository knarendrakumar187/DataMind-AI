import React, { useEffect, useState } from 'react'

function MetricCard({ label, value, unit = '', threshold }) {
  const numVal = parseFloat(value)
  let color = 'text-slate-300'
  if (threshold) {
    if (numVal >= threshold.good) color = 'text-emerald-400'
    else if (numVal >= threshold.ok) color = 'text-yellow-400'
    else color = 'text-red-400'
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
      <div className={`text-2xl font-black ${color}`}>
        {typeof numVal === 'number' && !isNaN(numVal) ? numVal.toFixed(4) : '—'}{unit}
      </div>
      <div className="text-slate-400 text-xs mt-1">{label}</div>
    </div>
  )
}

function FeatureBar({ feature, maxImportance, isFirst }) {
  const pct = maxImportance > 0 ? (feature.importance / maxImportance) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-300 text-sm w-32 truncate">{feature.name}</div>
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isFirst ? 'bg-blue-500' : 'bg-blue-400/60'}`}
          style={{ width: `${pct}%`, animationDelay: '0.2s' }}
        />
      </div>
      <div className="text-slate-400 text-xs w-12 text-right">{feature.importance.toFixed(4)}</div>
    </div>
  )
}

export default function TrainingResults({ trainingResult, dataset, selectedModel, expertiseLevel, onReset }) {
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowCheck(true), 100)
    return () => clearTimeout(t)
  }, [])

  if (!trainingResult) return null

  const { metrics = {}, llm_explanation = '', top_features = [], model_name = '' } = trainingResult
  const analysis = dataset?.analysis || dataset || {}
  const taskType = analysis.task_type || 'classification'

  const maxImportance = top_features.reduce((max, f) => Math.max(max, f.importance), 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">

      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${showCheck ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={showCheck ? 'animate-check' : ''}
              strokeDasharray="100"
              strokeDashoffset={showCheck ? 0 : 100}
              style={{ transition: 'stroke-dashoffset 0.6s ease 0.2s' }}
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">Training Complete! 🎉</h1>
        <p className="text-slate-400 text-sm">
          <span className="text-blue-400 font-medium">{model_name}</span> trained for{' '}
          <span className="text-purple-400 capitalize">{taskType.replace('_', ' ')}</span>
        </p>
      </div>

      {/* SECTION 2 — Metrics */}
      <div className="mb-6">
        <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3">📊 Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {taskType === 'classification' && (
            <>
              <MetricCard label="Accuracy" value={metrics.accuracy} unit="" threshold={{ good: 0.85, ok: 0.7 }} />
              <MetricCard label="F1 Score" value={metrics.f1_score} threshold={{ good: 0.80, ok: 0.65 }} />
              <MetricCard label="Precision" value={metrics.precision} threshold={{ good: 0.80, ok: 0.65 }} />
              <MetricCard label="Recall" value={metrics.recall} threshold={{ good: 0.80, ok: 0.65 }} />
              {metrics.cv_mean !== undefined && (
                <div className="col-span-2 md:col-span-4 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-slate-400 text-sm">Cross-Validation (5-fold):</span>
                  <span className="text-blue-400 font-bold">{parseFloat(metrics.cv_mean).toFixed(4)}</span>
                  {metrics.cv_std !== undefined && (
                    <span className="text-slate-500 text-xs">± {parseFloat(metrics.cv_std).toFixed(4)}</span>
                  )}
                </div>
              )}
            </>
          )}
          {(taskType === 'regression' || taskType === 'time_series') && (
            <>
              <MetricCard label="R² Score" value={metrics.r2_score} threshold={{ good: 0.8, ok: 0.5 }} />
              <MetricCard label="MAE" value={metrics.mae} />
              <MetricCard label="RMSE" value={metrics.rmse} />
              {metrics.cv_mean !== undefined && (
                <MetricCard label="CV Score" value={metrics.cv_mean} />
              )}
            </>
          )}
          {taskType === 'clustering' && (
            <>
              <MetricCard label="Silhouette Score" value={metrics.silhouette_score} threshold={{ good: 0.5, ok: 0.25 }} />
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-blue-400">{metrics.n_clusters}</div>
                <div className="text-slate-400 text-xs mt-1">Clusters Found</div>
              </div>
              {metrics.inertia !== undefined && (
                <MetricCard label="Inertia" value={metrics.inertia} />
              )}
            </>
          )}
        </div>
      </div>

      {/* SECTION 3 — Feature Importance */}
      {top_features.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">🔑 Top Predictive Features</h2>
          <div className="space-y-3">
            {top_features.map((f, i) => (
              <FeatureBar key={f.name} feature={f} maxImportance={maxImportance} isFirst={i === 0} />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4 — AI Insights */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="gradient-text text-lg font-bold">✦ AI Performance Analysis</span>
          <span className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full capitalize">
            {expertiseLevel}
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed text-sm">
          {llm_explanation || 'Training complete! AI explanation unavailable — add your Groq API key to .env.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          id="new-analysis-btn"
          onClick={onReset}
          className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
        >
          ↩ Start New Analysis
        </button>
      </div>
    </div>
  )
}
