import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useCrisisStore from '../store/useCrisisStore'

export default function Navbar() {
  const navigate = useNavigate()
  const { player, connected, systemStatus, disconnectSocket, setPlayer } = useCrisisStore()

  const handleAbort = () => {
    disconnectSocket()
    setPlayer(null, null)
    navigate('/')
  }

  const statusColor = {
    NOMINAL:  { dot: 'bg-green-400',  text: 'text-green-400',  label: 'NOMINAL' },
    WARNING:  { dot: 'bg-yellow-400', text: 'text-yellow-400', label: 'ALERTA' },
    CRITICAL: { dot: 'bg-red-500',    text: 'text-red-400',    label: 'CRÍTICO' },
  }[systemStatus] || { dot: 'bg-gray-500', text: 'text-gray-400', label: 'DESCONOCIDO' }

  const roleLabel = player?.role === 'monitor' ? '[ MONITOR ]' : '[ TÉCNICO ]'
  const roleColor = player?.role === 'monitor' ? 'text-cyan-400' : 'text-yellow-400'

  return (
    <nav
      className="relative z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: 'linear-gradient(180deg, #050a0e 0%, rgba(5,10,14,0.95) 100%)',
        borderBottom: '1px solid #0f3a4a',
        boxShadow: '0 2px 20px rgba(6,182,212,0.08)',
      }}
    >
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 border border-cyan-500 flex items-center justify-center"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          >
            <span className="text-cyan-400 text-xs font-bold">DC</span>
          </div>
          <div>
            <div
              className="font-display text-sm font-bold tracking-widest text-cyan-400 uppercase"
              style={{ letterSpacing: '0.3em' }}
            >
              Data Center
            </div>
            <div className="font-mono text-xs text-cyan-700 tracking-widest">
              CRISIS — OPS v2.4
            </div>
          </div>
        </div>

        
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{ background: 'rgba(13,25,32,0.8)', border: '1px solid #0f3a4a' }}
        >
          <span className={`inline-block w-2 h-2 rounded-full ${statusColor.dot} animate-pulse`} />
          <span className="font-mono text-xs text-gray-500">SYS:</span>
          <span className={`font-mono text-xs font-bold ${statusColor.text}`}>{statusColor.label}</span>
        </div>

        
        <div className="flex items-center gap-2">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-600'}`} />
          <span className="font-mono text-xs text-gray-600">
            {connected ? 'SOCKET ACTIVO' : 'MODO DEMO'}
          </span>
        </div>
      </div>

      
      {player && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="font-mono text-xs text-gray-500">OPERADOR:</div>
          <div className="font-display text-base font-semibold text-white tracking-wide uppercase">
            {player.name}
          </div>
          <div className={`font-mono text-xs font-bold ${roleColor} tracking-widest`}>
            {roleLabel}
          </div>
        </div>
      )}

      
      <div className="flex items-center gap-3">
        <Clock />
        {player && (
          <button
            onClick={handleAbort}
            className="btn-danger px-4 py-1.5 font-mono text-xs font-bold tracking-widest rounded flex items-center gap-2 uppercase"
          >
            <span className="text-red-400">⬡</span>
            Abortar Misión
          </button>
        )}
      </div>
    </nav>
  )
}

function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="font-mono text-sm text-cyan-600 tabular-nums tracking-widest">
      {time.toLocaleTimeString('es-CO', { hour12: false })}
    </div>
  )
}
