import React, { useRef, useState, useCallback } from 'react'

const SAMPLE_DATASETS = [
  { icon: '🏭', name: 'Industrial Sensor Data', task: 'Classification', desc: 'temperature, pressure, vibration → failure prediction' },
  { icon: '📈', name: 'Energy Consumption', task: 'Regression', desc: 'time, weather, usage → predict energy demand' },
  { icon: '🔧', name: 'Equipment Maintenance', task: 'Clustering', desc: 'maintenance logs → group by fault patterns' },
]

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadSection({ expertiseLevel, onUpload, loading }) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['csv', 'xlsx'].includes(ext)) {
      alert('Only .csv and .xlsx files are supported.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.')
      return
    }
    setFile(f)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    handleFile(dropped)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  const handleInputChange = (e) => {
    handleFile(e.target.files[0])
  }

  const handleSubmit = () => {
    if (file && !loading) {
      onUpload(file)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Upload Your Dataset</h1>
        <p className="text-slate-400 text-sm">
          Drag & drop a CSV or Excel file — our AI will analyze it automatically
        </p>
      </div>

      {/* Drop Zone */}
      <div
        id="upload-dropzone"
        onClick={() => !loading && fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative min-h-[220px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 mb-6
          ${dragOver
            ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
            : file
            ? 'border-emerald-500/60 bg-emerald-500/5'
            : 'border-slate-600 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/60'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={handleInputChange}
          id="file-input"
        />

        {file ? (
          <div className="text-center px-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-emerald-400 font-semibold text-lg">{file.name}</p>
            <p className="text-slate-400 text-sm mt-1">
              {formatFileSize(file.size)} · Click to change file
            </p>
            <p className="text-slate-500 text-xs mt-2">
              ~{Math.round(file.size / 200).toLocaleString()} rows estimated
            </p>
          </div>
        ) : (
          <div className="text-center px-6">
            <div className="text-5xl mb-3 opacity-60">📂</div>
            <p className="text-slate-300 font-medium">Drag & drop your CSV or Excel file here</p>
            <p className="text-slate-500 text-sm mt-1">or click to browse</p>
            <p className="text-slate-600 text-xs mt-3">Supported: .csv, .xlsx · Max size: 10MB</p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <button
        id="analyze-btn"
        onClick={handleSubmit}
        disabled={!file || loading}
        className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2
          ${!file || loading
            ? 'bg-slate-700 cursor-not-allowed text-slate-500'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-blue-500/25'
          }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Processing...
          </>
        ) : (
          <>Analyze Dataset →</>
        )}
      </button>

      {/* Sample Datasets */}
      <div className="mt-8">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 text-center">Example dataset types you can use</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_DATASETS.map((s) => (
            <div key={s.name} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-slate-300 text-xs font-semibold">{s.name}</div>
              <div className="text-blue-400 text-xs mt-0.5">{s.task}</div>
              <div className="text-slate-500 text-xs mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-600 text-xs text-center mt-2">Upload your own CSV to get started</p>
      </div>
    </div>
  )
}
