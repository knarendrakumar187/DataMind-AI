import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import ExpertiseSelector from './components/ExpertiseSelector'
import UploadSection from './components/UploadSection'
import DatasetOverview from './components/DatasetOverview'
import ModelRecommendations from './components/ModelRecommendations'
import TrainingResults from './components/TrainingResults'
import ChatAssistant from './components/ChatAssistant'

import {
  uploadDataset,
  analyzeDataset,
  recommendModels,
  generatePipeline,
  trainModel,
  explainDataset,
  chatWithAI,
} from './api/datamind'

// ─── Loading overlay ──────────────────────────────────────────────────────────
function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 bg-[#0A1628]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-slate-300 text-base font-medium">{message}</p>
    </div>
  )
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ error, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [error])
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4">
      <div className="bg-red-900/90 border border-red-500/50 text-red-200 rounded-xl px-5 py-3 text-sm shadow-2xl flex items-start gap-3 animate-slide-up">
        <span className="text-red-400 mt-0.5 shrink-0">⚠️</span>
        <div className="flex-1">{error}</div>
        <button onClick={onDismiss} className="text-red-400 hover:text-red-200 shrink-0 ml-2">✕</button>
      </div>
    </div>
  )
}

// ─── Progress steps loader ────────────────────────────────────────────────────
function ProgressLoader({ steps, currentStep }) {
  return (
    <div className="fixed inset-0 bg-[#0A1628]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6">
      <div className="w-14 h-14 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step} className={`flex items-center gap-3 transition-all ${i <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
              i < currentStep ? 'bg-emerald-500 text-white' :
              i === currentStep ? 'bg-blue-500 text-white animate-pulse' :
              'bg-slate-700 text-slate-500'
            }`}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${i <= currentStep ? 'text-slate-200' : 'text-slate-500'}`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [currentStage, setCurrentStage] = useState(1)
  const [expertiseLevel, setExpertiseLevel] = useState('')
  const [dataset, setDataset] = useState(null)         // full analysis from backend
  const [datasetId, setDatasetId] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [selectedModel, setSelectedModel] = useState(null)
  const [targetColumn, setTargetColumn] = useState('')
  const [pipeline, setPipeline] = useState(null)
  const [trainingResult, setTrainingResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState('')
  const [llmExplanation, setLlmExplanation] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [uploadStep, setUploadStep] = useState(-1)  // for progress loader

  const UPLOAD_STEPS = ['Uploading file...', 'Analyzing dataset...', 'Generating AI explanation...']

  const showError = (msg) => setError(typeof msg === 'string' ? msg : JSON.stringify(msg))

  // ── Stage 1 → 2: Expertise selected ────────────────────────────────────────
  const handleExpertiseSelect = (level) => {
    setExpertiseLevel(level)
    setCurrentStage(2)
  }

  // ── Stage 2 → 3: File upload ────────────────────────────────────────────────
  const handleFileUpload = async (file) => {
    setLoading(true)
    setUploadStep(0)
    setError('')
    try {
      // Step 1: Upload
      const uploadResult = await uploadDataset(file, expertiseLevel)
      const id = uploadResult.id
      setDatasetId(id)

      // Step 2: Analyze
      setUploadStep(1)
      const analyzeResult = await analyzeDataset(id)
      setDataset(analyzeResult)

      // Step 3: Explain
      setUploadStep(2)
      try {
        const explainResult = await explainDataset(id, expertiseLevel)
        setLlmExplanation(explainResult.explanation || '')
      } catch {
        setLlmExplanation('AI explanation unavailable — add your Groq API key to backend/.env')
      }

      setCurrentStage(3)
    } catch (err) {
      showError(err.message || 'Upload failed')
    } finally {
      setLoading(false)
      setUploadStep(-1)
    }
  }

  // ── Stage 3 → 4: Proceed to model recommendations ──────────────────────────
  const handleProceedToModels = async () => {
    setLoading(true)
    setLoadingMessage('Loading model recommendations...')
    try {
      const result = await recommendModels(datasetId, expertiseLevel)
      setRecommendations(result.recommendations || [])
      setLlmExplanation(result.llm_explanation || llmExplanation)
      setCurrentStage(4)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  // ── Stage 4: Select model + generate pipeline ────────────────────────────────
  const handleModelSelect = async (model, tCol, trainNow = false) => {
    setSelectedModel(model)
    setTargetColumn(tCol)

    if (!trainNow) {
      // Just generate pipeline
      setLoading(true)
      setLoadingMessage('Generating pipeline...')
      try {
        const result = await generatePipeline(datasetId, model.name, tCol)
        setPipeline(result)
      } catch (err) {
        showError(err.message)
      } finally {
        setLoading(false)
        setLoadingMessage('')
      }
    } else {
      // Generate pipeline then train
      setLoading(true)
      setLoadingMessage('Training model — this may take 10–30 seconds...')
      try {
        // Ensure pipeline is generated
        if (!pipeline) {
          const pip = await generatePipeline(datasetId, model.name, tCol)
          setPipeline(pip)
        }
        // Train
        const result = await trainModel(datasetId, model.name, tCol, expertiseLevel)
        setTrainingResult(result)
        setCurrentStage(5)
        // Add AI welcome message to chat
        setChatMessages([{
          role: 'assistant',
          content: `Great! I just trained ${model.name} on your dataset. Ask me anything about the results, model choice, or how to improve performance!`,
          timestamp: new Date().toISOString(),
        }])
      } catch (err) {
        showError(err.message || 'Training failed')
      } finally {
        setLoading(false)
        setLoadingMessage('')
      }
    }
  }

  // ── Stage 5: Chat ────────────────────────────────────────────────────────────
  const handleChat = async (message) => {
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
    ])
    setChatLoading(true)
    try {
      const analysis = dataset?.analysis || dataset || {}
      const result = await chatWithAI(
        message,
        datasetId,
        expertiseLevel,
        selectedModel?.name || ''
      )
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.response, timestamp: result.timestamp || new Date().toISOString() },
      ])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date().toISOString() },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setCurrentStage(1)
    setExpertiseLevel('')
    setDataset(null)
    setDatasetId(null)
    setRecommendations([])
    setSelectedModel(null)
    setTargetColumn('')
    setPipeline(null)
    setTrainingResult(null)
    setLlmExplanation('')
    setChatMessages([])
    setError('')
  }

  const datasetContext = {
    task_type: dataset?.analysis?.task_type || 'unknown',
    rows: dataset?.analysis?.shape?.rows || 0,
    model_name: selectedModel?.name || '',
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Error banner */}
      {error && <ErrorBanner error={error} onDismiss={() => setError('')} />}

      {/* Upload progress loader */}
      {uploadStep >= 0 && <ProgressLoader steps={UPLOAD_STEPS} currentStep={uploadStep} />}

      {/* Generic loading overlay */}
      {loading && uploadStep < 0 && <LoadingOverlay message={loadingMessage || 'Processing...'} />}

      {/* Fixed header */}
      <Header currentStage={currentStage} expertiseLevel={expertiseLevel} onReset={handleReset} />

      {/* Main content — offset for fixed header */}
      <main className="pt-16">
        {currentStage === 1 && (
          <ExpertiseSelector onSelect={handleExpertiseSelect} />
        )}
        {currentStage === 2 && (
          <UploadSection
            expertiseLevel={expertiseLevel}
            onUpload={handleFileUpload}
            loading={loading}
          />
        )}
        {currentStage === 3 && (
          <DatasetOverview
            dataset={dataset}
            llmExplanation={llmExplanation}
            expertiseLevel={expertiseLevel}
            onProceed={handleProceedToModels}
            loading={loading}
          />
        )}
        {currentStage === 4 && (
          <ModelRecommendations
            recommendations={recommendations}
            dataset={dataset}
            llmExplanation={llmExplanation}
            expertiseLevel={expertiseLevel}
            onSelectModel={handleModelSelect}
            loading={loading}
            pipeline={pipeline}
            selectedModel={selectedModel}
          />
        )}
        {currentStage === 5 && (
          <div className="max-w-5xl mx-auto px-4">
            <TrainingResults
              trainingResult={trainingResult}
              dataset={dataset}
              selectedModel={selectedModel}
              expertiseLevel={expertiseLevel}
              onReset={handleReset}
            />
            <div className="pb-10">
              <ChatAssistant
                messages={chatMessages}
                onSendMessage={handleChat}
                loading={chatLoading}
                expertiseLevel={expertiseLevel}
                datasetContext={datasetContext}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
