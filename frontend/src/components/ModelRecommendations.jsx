import React, { useState } from 'react'

const COMPLEXITY_COLORS = {
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-lg transition-colors"
    >
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  )
}

export default function ModelRecommendations({
  recommendations, dataset, llmExplanation, expertiseLevel,
  onSelectModel, loading, pipeline, selectedModel
}) {
  const [selectedRec, setSelectedRec] = useState(0)
  const [targetColumn, setTargetColumn] = useState('')
  const [showPipeline, setShowPipeline] = useState(false)
  const [pipelineTab, setPipelineTab] = useState('steps')

  const analysis = dataset?.analysis || dataset || {}
  const columns = analysis.columns || []
  const targetSuggestions = analysis.target_suggestions || []

  React.useEffect(() => {
    if (targetSuggestions.length > 0 && !targetColumn) {
      setTargetColumn(targetSuggestions[0])
    } else if (columns.length > 0 && !targetColumn) {
      setTargetColumn(columns[columns.length - 1]?.name || '')
    }
  }, [targetSuggestions, columns])

  React.useEffect(() => {
    if (pipeline) setShowPipeline(true)
  }, [pipeline])

  const handleSelectModel = () => {
    if (recommendations[selectedRec] && targetColumn) {
      onSelectModel(recommendations[selectedRec], targetColumn)
    }
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-400">
        <div className="text-4xl mb-3">🔄</div>
        <p>Loading model recommendations...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Model Recommendations</h1>
        <p className="text-slate-400 text-sm">DataMind AI ranked the best models for your dataset</p>
      </div>

      {/* Target Column Selector */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-6">
        <label className="block text-slate-300 text-sm font-medium mb-2">
          🎯 Select target column <span className="text-slate-500 font-normal">(what do you want to predict?)</span>
        </label>
        <select
          id="target-column-select"
          value={targetColumn}
          onChange={(e) => setTargetColumn(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
        >
          {columns.map((col) => (
            <option key={col.name} value={col.name}>{col.name} ({col.dtype})</option>
          ))}
        </select>
        <p className="text-slate-500 text-xs mt-2">For clustering tasks, target column selection is optional.</p>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {recommendations.map((rec, idx) => (
          <button
            key={rec.name}
            id={`model-card-${idx}`}
            onClick={() => setSelectedRec(idx)}
            className={`text-left rounded-2xl border-2 p-5 transition-all duration-200 relative cursor-pointer
              ${selectedRec === idx
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                : 'border-slate-700/50 bg-slate-800/60 hover:border-slate-600'
              }
              ${idx === 0 ? 'md:scale-105 md:z-10' : ''}
            `}
          >
            {/* Rank badge */}
            <div className="flex items-start justify-between mb-3">
              <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                idx === 1 ? 'bg-slate-500/20 text-slate-400 border border-slate-500/40' :
                'bg-orange-500/20 text-orange-400 border border-orange-500/40'
              }`}>
                {idx === 0 ? '⭐ #1 Recommended' : idx === 1 ? '#2 Alternative' : '#3 Baseline'}
              </div>
              {selectedRec === idx && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
            </div>

            <h3 className="text-white font-bold text-base mb-1">{rec.name}</h3>

            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${COMPLEXITY_COLORS[rec.complexity]}`}>
                {rec.complexity} complexity
              </span>
              <span className="text-slate-400 text-xs">Score: {rec.final_score}</span>
            </div>

            {/* Score bar */}
            <div className="mb-3">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${rec.final_score}%` }}
                />
              </div>
            </div>

            <p className="text-slate-400 text-xs italic mb-3 leading-relaxed">{rec.when_to_use}</p>

            <div className="space-y-1 mb-3">
              {(rec.pros || []).map((p) => (
                <div key={p} className="flex items-start gap-1.5 text-xs text-slate-300">
                  <span className="text-emerald-400 mt-0.5">✓</span> {p}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {(rec.cons || []).map((c) => (
                <div key={c} className="flex items-start gap-1.5 text-xs text-slate-400">
                  <span className="text-orange-400 mt-0.5">⚠</span> {c}
                </div>
              ))}
            </div>

            {/* LLM Explanation on #1 */}
            {idx === 0 && llmExplanation && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  ✦ {llmExplanation.substring(0, 180)}{llmExplanation.length > 180 ? '...' : ''}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Generate Pipeline button */}
      <button
        id="select-model-btn"
        onClick={handleSelectModel}
        disabled={loading}
        className={`w-full py-3.5 rounded-xl font-semibold text-white mb-6 transition-all flex items-center justify-center gap-2
          ${loading
            ? 'bg-slate-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg'
          }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Generating Pipeline...
          </>
        ) : `Generate Pipeline for ${recommendations[selectedRec]?.name || 'Selected Model'} →`}
      </button>

      {/* Pipeline Viewer */}
      {showPipeline && pipeline && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 animate-slide-up">
          <h2 className="text-white font-semibold text-lg mb-4">📋 Generated Pipeline</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-slate-700/50 pb-2">
            <button
              id="pipeline-tab-steps"
              onClick={() => setPipelineTab('steps')}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${pipelineTab === 'steps' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Step-by-Step
            </button>
            <button
              id="pipeline-tab-code"
              onClick={() => setPipelineTab('code')}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${pipelineTab === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Full Code
            </button>
          </div>

          {pipelineTab === 'steps' ? (
            <div className="space-y-3">
              {(pipeline.steps || []).map((step) => (
                <details key={step.step_number} className="bg-slate-900/50 border border-slate-700/40 rounded-xl group">
                  <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {step.step_number}
                    </div>
                    <div>
                      <div className="text-slate-200 font-medium text-sm">{step.title}</div>
                      <div className="text-slate-400 text-xs">{step.description}</div>
                    </div>
                  </summary>
                  <div className="px-4 pb-3">
                    <pre className="text-xs code-font bg-[#0d1117] text-green-300 rounded-lg p-3 overflow-x-auto">
                      {step.code_snippet}
                    </pre>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="relative">
              <CopyButton text={pipeline.code || ''} />
              <pre className="text-xs code-font bg-[#0d1117] text-slate-300 rounded-xl p-4 overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">
                {pipeline.code}
              </pre>
            </div>
          )}

          {/* Train button */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <button
              id="train-model-btn"
              onClick={() => onSelectModel(recommendations[selectedRec], targetColumn, true)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all"
            >
              🚀 Train This Model →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
