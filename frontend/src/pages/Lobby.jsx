import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useCrisisStore from '../store/useCrisisStore'

const BOOT_SEQUENCE = [
  '> Iniciando subsistemas de control...',
  '> Verificando integridad del kernel...',
  '> Cargando módulos de red...',
  '> Conectando sensores térmicos...',
  '> Autenticación requerida.',
  '> SISTEMA LISTO.',
]

export default function Lobby() {
  const navigate = useNavigate()
  const { setPlayer, connectSocket } = useCrisisStore()
  const [name, setName] = useState('')
  const [role, setRole] = useState(null)
  const [error, setError] = useState('')
  const [booting, setBooting] = useState(true)
  const [bootLines, setBootLines] = useState([])

  useEffect(() => {
    let i = 0
    setBootLines([])
    const interval = setInterval(() => {
      if (i < BOOT_SEQUENCE.length) {
        setBootLines(prev => [...prev, BOOT_SEQUENCE[i]])
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => setBooting(false), 400)
      }
    }, 300)
    return () => clearInterval(interval)
  }, [])

  const handleJoin = () => {
    if (!name.trim()) { setError('Ingresa tu nombre de operador'); return }
    if (!role)        { setError('Selecciona un rol'); return }
    setError('')
    setPlayer(name.trim(), role)
    connectSocket()
    navigate(role === 'monitor' ? '/ops/monitor' : '/ops/bridge')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #080f14 0%, #050a0e 70%)' }}
    >
      <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" />

      <div className="absolute top-8 left-8 text-cyan-800 font-mono text-xs opacity-50">DC-OPS // SECTOR 7G</div>
      <div className="absolute top-8 right-8 text-cyan-800 font-mono text-xs opacity-50">CLEARANCE: LEVEL-5</div>
      <div className="absolute bottom-8 left-8 text-cyan-800 font-mono text-xs opacity-50">v2.4.1 // BUILD-20250425</div>
      <div className="absolute bottom-8 right-8 text-cyan-800 font-mono text-xs opacity-50">ENCRYP: AES-256</div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-700 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-700 to-transparent" />

      {booting ? (
        <div className="font-mono text-sm text-cyan-600 space-y-2 w-full max-w-md px-8">
          {bootLines.filter(Boolean).map((line, i) => (
            <div key={i} className="line-appear" style={{ animationDelay: `${i * 50}ms` }}>
              <span className={line.includes('LISTO') ? 'text-green-400' : 'text-cyan-600'}>
                {line}
              </span>
            </div>
          ))}
          {bootLines.length > 0 && (
            <span className="text-cyan-400 animate-pulse">▋</span>
          )}
        </div>
      ) : (
        <div className="relative w-full max-w-md mx-4">
          <div
            className="relative panel-border rounded-lg overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #0a1820 0%, #080f14 100%)' }}
          >
            
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: '1px solid #0f3a4a', background: 'rgba(6,182,212,0.05)' }}
            >
              <span className="font-mono text-xs text-cyan-600 tracking-widest">AUTENTICACIÓN DE OPERADOR</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-600 opacity-70" />
                <div className="w-2 h-2 rounded-full bg-yellow-600 opacity-70" />
                <div className="w-2 h-2 rounded-full bg-green-600 opacity-70" />
              </div>
            </div>

            <div className="p-8">
              
              <div className="text-center mb-8">
                <div
                  className="font-display text-4xl font-bold text-cyan-400 tracking-widest uppercase neon-text"
                  style={{ letterSpacing: '0.4em' }}
                >
                  DATA CENTER
                </div>
                <div className="font-mono text-xs text-cyan-700 tracking-widest mt-1 text-center">
                  ── CRISIS OPERATIONS SYSTEM ──
                </div>
                <div className="flex justify-center gap-2 mt-2">
                  {['NOMINAL', '●', 'ALERT', '●', 'CRITICAL'].map((item, i) => (
                    <span key={i} className={`font-mono text-xs ${
                      item === '●'        ? 'text-cyan-800' :
                      item === 'NOMINAL'  ? 'text-green-600' :
                      item === 'ALERT'    ? 'text-yellow-600' : 'text-red-600'
                    }`}>{item}</span>
                  ))}
                </div>
              </div>

              
              <div className="mb-6">
                <label className="block font-mono text-xs text-cyan-700 tracking-widest mb-2 uppercase">
                  Identificador del Operador
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-cyan-600 text-sm">›</span>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    placeholder="CODENAME_OPERADOR"
                    maxLength={20}
                    className="w-full pl-8 pr-4 py-3 font-mono text-sm text-cyan-300 placeholder-cyan-900 rounded outline-none focus:ring-1 focus:ring-cyan-500 uppercase tracking-wider"
                    style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid #0f3a4a', transition: 'all 0.2s ease' }}
                    onFocus={e => e.target.style.borderColor = '#06b6d4'}
                    onBlur={e =>  e.target.style.borderColor = '#0f3a4a'}
                  />
                </div>
              </div>

              
              <div className="mb-8">
                <label className="block font-mono text-xs text-cyan-700 tracking-widest mb-3 uppercase">
                  Asignación de Rol
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <RoleCard
                    selected={role === 'monitor'}
                    onClick={() => setRole('monitor')}
                    icon="◉"
                    title="MONITOR"
                    description="Observa métricas, temperatura, ancho de banda e intentos de intrusión en tiempo real."
                    color="cyan"
                  />
                  <RoleCard
                    selected={role === 'technician'}
                    onClick={() => setRole('technician')}
                    icon="⚙"
                    title="TÉCNICO"
                    description="Ejecuta comandos: reinicia servidores, activa firewalls y controla el enfriamiento."
                    color="yellow"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 px-4 py-2 rounded font-mono text-xs text-red-400 text-center"
                  style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)' }}>
                  ⚠ {error}
                </div>
              )}

              <button
                onClick={handleJoin}
                className="w-full py-3.5 font-display text-base font-bold tracking-widest uppercase rounded transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.25) 0%, rgba(6,182,212,0.1) 100%)',
                  border: '1px solid rgba(6,182,212,0.5)',
                  color: '#22d3ee',
                  boxShadow: '0 0 20px rgba(6,182,212,0.1)',
                  letterSpacing: '0.3em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(6,182,212,0.3)'
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(6,182,212,0.2) 100%)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(6,182,212,0.1)'
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,182,212,0.25) 0%, rgba(6,182,212,0.1) 100%)'
                }}
              >
                ⬡ &nbsp; Iniciar Misión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleCard({ selected, onClick, icon, title, description, color }) {
  const colors = {
    cyan:   { border: 'rgba(6,182,212,0.6)', bg: 'rgba(6,182,212,0.1)', text: '#22d3ee', dim: 'rgba(6,182,212,0.3)' },
    yellow: { border: 'rgba(255,170,0,0.6)', bg: 'rgba(255,170,0,0.1)', text: '#ffcc44', dim: 'rgba(255,170,0,0.3)' },
  }[color]

  return (
    <button
      onClick={onClick}
      className="p-4 rounded text-left transition-all duration-200 relative overflow-hidden"
      style={{
        background: selected ? colors.bg : 'rgba(13,25,32,0.6)',
        border: `1px solid ${selected ? colors.border : '#0f3a4a'}`,
        boxShadow: selected ? `0 0 15px ${colors.dim}` : 'none',
      }}
    >
      <div className="font-mono text-2xl mb-2" style={{ color: selected ? colors.text : '#2a5a6a' }}>{icon}</div>
      <div className="font-display text-sm font-bold tracking-wider mb-1" style={{ color: selected ? colors.text : '#4a7a8a' }}>
        {title}
      </div>
      <div className="text-xs leading-relaxed" style={{ color: '#3a6a7a' }}>{description}</div>
      {selected && (
        <div className="absolute top-2 right-2 font-mono text-xs" style={{ color: colors.text }}>✓</div>
      )}
    </button>
  )
}
