import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Plus, Search, Send, Settings, Database, Menu, X, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const API_URL = '/api'

const areas = [
  { id: 'economia', label: 'Economia', icon: '💰' },
  { id: 'ibge', label: 'IBGE', icon: '📊' },
  { id: 'legislativo', label: 'Legislativo', icon: '🏛️' },
  { id: 'transparencia', label: 'Transparência', icon: '🔍' },
  { id: 'tcu', label: 'TCU', icon: '⚖️' },
  { id: 'judiciario', label: 'Judiciário', icon: '⚖️' },
  { id: 'eleitoral', label: 'Eleitoral', icon: '🗳️' },
  { id: 'meio_ambiente', label: 'Meio Ambiente', icon: '🌳' },
  { id: 'saude', label: 'Saúde', icon: '🏥' },
  { id: 'seguranca', label: 'Segurança', icon: '🔒' },
  { id: 'compras', label: 'Compras', icon: '📦' },
]

function App() {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedAreas, setSelectedAreas] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/sessions`)
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch (e) {
      console.error('Erro ao carregar sessões:', e)
    }
  }

  const loadMessages = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/sessions/${sessionId}/messages`)
      const data = await res.json()
      setMessages(data)
    } catch (e) {
      console.error('Erro ao carregar mensagens:', e)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage, sources: [] }])

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, session_id: currentSession })
      })
      const data = await res.json()

      if (!currentSession && data.session_id) {
        setCurrentSession(data.session_id)
        loadSessions()
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message, sources: data.sources }])
    } catch (e) {
      console.error('Erro ao enviar mensagem:', e)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao conectar com o servidor. Tente novamente.', sources: [] }])
    } finally {
      setLoading(false)
    }
  }

  const newChat = () => {
    setCurrentSession(null)
    setMessages([])
  }

  const toggleArea = (areaId) => {
    setSelectedAreas(prev =>
      prev.includes(areaId)
        ? prev.filter(a => a !== areaId)
        : [...prev, areaId]
    )
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-[60px] bg-surface border-b border-border flex items-center px-4 gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-surface rounded">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <Database className="text-primary" size={24} />
          <h1 className="text-lg font-semibold">Brasil Data Hub</h1>
        </div>
        <div className="flex-1" />
        <button onClick={newChat} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-background rounded hover:opacity-90">
          <Plus size={16} />
          <span className="hidden sm:inline">Nova Consulta</span>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-[280px]' : 'w-0'} lg:w-[280px] bg-surface border-r border-border flex flex-col transition-all overflow-hidden`}>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="text"
                placeholder="Buscar conversas..."
                className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length === 0 ? (
              <p className="p-4 text-center text-text-muted text-sm">Nenhuma conversa ainda</p>
            ) : (
              sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => { setCurrentSession(session.id); loadMessages(session.id) }}
                  className={`w-full text-left p-3 rounded-lg mb-1 ${currentSession === session.id ? 'bg-border' : 'hover:bg-background'}`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-text-muted" />
                    <span className="text-sm truncate">{session.title}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-4 border-t border-border">
            <p className="text-xs text-text-muted mb-2">Filtrar por área:</p>
            <div className="flex flex-wrap gap-1">
              {areas.map(area => (
                <button
                  key={area.id}
                  onClick={() => toggleArea(area.id)}
                  className={`text-xs px-2 py-1 rounded ${selectedAreas.includes(area.id) ? 'bg-primary text-background' : 'bg-background border border-border'}`}
                >
                  {area.icon} {area.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Chat */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Database size={64} className="text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2">Bem-vindo ao Brasil Data Hub</h2>
                <p className="text-text-muted max-w-md">Consulte dados de 41 APIs públicas brasileiras em linguagem natural</p>
                <div className="mt-8 flex flex-wrap gap-2 justify-center">
                  {['Qual a taxa Selic atual?', ' Projetos de lei sobre IA em 2024', ' Hospitais em SP', ' Contratos government'].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); }}
                      className="px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:border-primary"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${msg.role === 'user' ? 'bg-primary text-background' : 'bg-surface border border-border'}`}>
                    {msg.role === 'user' ? 'V' : '🤖'}
                  </div>
                  <div className={`flex-1 max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-background' : 'bg-surface border border-border'}`}>
                      <div className="message-content text-sm">
                        <ReactMarkdown
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              return inline ? (
                                <code {...props}>{children}</code>
                              ) : (
                                <SyntaxHighlighter style={oneDark} language="text" {...props}>
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              )
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {msg.sources?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.sources.map((src, j) => (
                          <span key={j} className="text-xs px-2 py-0.5 bg-surface border border-border rounded text-text-muted">
                            {src.tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center">🤖</div>
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <Loader2 className="animate-spin text-primary" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta sobre dados públicos brasileiros..."
                className="flex-1 bg-surface border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-3 bg-primary text-background rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App