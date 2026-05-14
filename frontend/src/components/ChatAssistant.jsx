import React, { useEffect, useRef, useState } from 'react'

const SUGGESTED_QUESTIONS = [
  'Why was this model recommended?',
  'How can I improve the accuracy?',
  'What does the F1 score mean?',
  'Is my data quality good enough?',
]

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-slate-700/60 rounded-2xl rounded-bl-sm w-fit">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-slate-400 rounded-full typing-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}

function formatTime(isoString) {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function ChatAssistant({ messages, onSendMessage, loading, expertiseLevel, datasetContext }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    onSendMessage(msg)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggest = (q) => {
    setInput('')
    onSendMessage(q)
  }

  const showSuggestions = messages.length <= 1

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm">✦</div>
          <div>
            <div className="text-white font-semibold text-sm">Ask DataMind AI</div>
            <div className="text-slate-500 text-xs capitalize">{expertiseLevel} mode</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-slate-400 text-xs">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm pt-8">
            <div className="text-2xl mb-2">💬</div>
            Ask anything about your data, model, or results
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">✦</div>
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-slate-700/60 text-slate-200 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
              {msg.timestamp && (
                <span className="text-slate-600 text-xs">{formatTime(msg.timestamp)}</span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">✦</div>
            <TypingDots />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {showSuggestions && (
        <div className="px-4 py-2 border-t border-slate-700/30 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSuggest(q)}
              className="text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-600/50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-700/50 flex gap-2">
        <textarea
          ref={inputRef}
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Ask anything about your data or model..."
          rows={1}
          className="flex-1 bg-slate-900 border border-slate-600 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
          style={{ maxHeight: '80px' }}
        />
        <button
          id="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 self-end
            ${!input.trim() || loading
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
        >
          →
        </button>
      </div>
    </div>
  )
}
