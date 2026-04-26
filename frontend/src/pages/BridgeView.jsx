import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useCrisisStore from '../store/useCrisisStore'

const COMMANDS = [
  { cmd: 'COOL RACK-{ID} {%}', label: 'Enfriar Rack',      desc: 'Ajusta AC de rack al %',  color: 'cyan',   icon: '❄' },
  { cmd: 'RESTART SRV-{ID}',   label: 'Reiniciar Servidor', desc: 'Reinicia servidor por ID', color: 'yellow', icon: '↺' },
  { cmd: 'FIREWALL ENABLE',    label: 'Activar Firewall',   desc: 'Firewall de emergencia',   color: 'red',    icon: '⬡' },
  { cmd: 'FIREWALL DISABLE',   label: 'Desactivar FW',      desc: 'Deshabilita el firewall',  color: 'red',    icon: '⬡' },
  { cmd: 'ISOLATE RACK-{ID}',  label: 'Aislar Rack',        desc: 'Desconecta rack de red',   color: 'warn',   icon: '◉' },
  { cmd: 'BOOST COOLING ALL',  label: 'Boost Enfriamiento', desc: 'Máxima potencia de AC',    color: 'cyan',   icon: '▲' },
  { cmd: 'SHUTDOWN SRV-{ID}',  label: 'Apagar Servidor',    desc: 'Apagado controlado',       color: 'red',    icon: '■' },
  { cmd: 'STATUS REPORT',      label: 'Reporte de Estado',  desc: 'Genera reporte completo',  color: 'safe',   icon: '◎' },
]

const HELP_TEXT = `COMANDOS DISPONIBLES:
  COOL RACK-[ID] [%]  — Ajusta potencia del aire acondicionado
  RESTART SRV-[ID]    — Reinicia servidor específico
  FIREWALL ENABLE     — Activa firewall de emergencia
  FIREWALL DISABLE    — Desactiva firewall
  ISOLATE RACK-[ID]   — Aísla rack de la red principal
  BOOST COOLING ALL   — Activa enfriamiento al 100%
  SHUTDOWN SRV-[ID]   — Apagado controlado del servidor
  STATUS REPORT       — Genera informe completo

IDs VÁLIDOS:
  Racks  : A1, A2, B1, B2, C1, C2
  Servers: SRV-100 a SRV-200

NOTA: El código de seguridad se obtiene del Monitor.`

const PALETTE = {
  cyan:   { border: 'rgba(6,182,212,0.3)',  text: '#22d3ee', hover: 'rgba(6,182,212,0.1)'  },
  yellow: { border: 'rgba(255,170,0,0.3)',  text: '#ffcc44', hover: 'rgba(255,170,0,0.08)' },
  red:    { border: 'rgba(255,68,68,0.3)',  text: '#ff8888', hover: 'rgba(255,68,68,0.08)' },
  warn:   { border: 'rgba(255,170,0,0.25)', text: '#ffaa44', hover: 'rgba(255,170,0,0.06)' },
  safe:   { border: 'rgba(0,255,136,0.25)', text: '#44ffaa', hover: 'rgba(0,255,136,0.06)' },
}

export default function BridgeView() {
  const navigate = useNavigate()
  const { player, actionLog, sendCommand, metrics } = useCrisisStore()
  const [input, setInput]     = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [secInput, setSecInput] = useState('')
  const terminalRef = useRef(null)
  const inputRef    = useRef(null)

  useEffect(() => {
    if (!player) navigate('/')
  }, [player, navigate])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [actionLog])

  const handleSubmit = (cmd) => {
    const command = (cmd ?? input).trim().toUpperCase()
    if (!command) return
    setHistory(h => [command, ...h].slice(0, 50))
    setHistIdx(-1)
    sendCommand(command)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { handleSubmit(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx)
      setInput(history[idx] ?? '')
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInput(idx === -1 ? '' : history[idx] ?? '')
    }
  }

  const statusColor = (s) => {
    if (s === 'OK')      return 'text-green-400'
    if (s === 'ERROR')   return 'text-red-400'
    if (s === 'PENDING') return 'text-yellow-400 animate-pulse'
    return 'text-gray-500'
  }

  return (
    <div className="h-full overflow-hidden" style={{ background: '#050a0e' }}>
      <div className="h-full grid grid-cols-12 gap-0">

        
        <div className="col-span-3 flex flex-col overflow-hidden"
          style={{ borderRight: '1px solid #0f3a4a', background: '#080f14' }}>

          <div className="px-4 py-3" style={{ borderBottom: '1px solid #0f3a4a', background: 'rgba(255,170,0,0.04)' }}>
            <div className="font-mono text-xs text-yellow-700 tracking-widest">ACCIONES RÁPIDAS</div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {COMMANDS.map((c, i) => {
              const p = PALETTE[c.color] || PALETTE.cyan
              const isTemplate = c.cmd.includes('{')
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!isTemplate) handleSubmit(c.cmd)
                    else setInput(c.cmd.replace('{ID}', '').replace('{%}', '80'))
                  }}
                  className="w-full text-left p-3 rounded transition-all duration-150"
                  style={{ background: 'rgba(13,25,32,0.5)', border: `1px solid ${p.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = p.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(13,25,32,0.5)'}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ color: p.text }}>{c.icon}</span>
                    <span className="font-display text-xs font-semibold tracking-wide" style={{ color: p.text }}>
                      {c.label}
                    </span>
                    {isTemplate && (
                      <span className="font-mono text-xs text-gray-700 ml-auto">›editar</span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-gray-700">{c.desc}</div>
                </button>
              )
            })}
          </div>

      
          <div className="p-3" style={{ borderTop: '1px solid #0f3a4a' }}>
            <div className="font-mono text-xs text-cyan-900 tracking-widest mb-2">ESTADO RACKS</div>
            <div className="space-y-1">
              {metrics.temperature.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-700 w-8">R-{r.rack}</span>
                  <div className="flex-1 h-1 rounded-full" style={{ background: '#0f2030' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(r.value / r.max) * 100}%`,
                        background: r.value >= 70 ? '#ff4444' : r.value >= 55 ? '#ffaa00' : '#06b6d4',
                      }}
                    />
                  </div>
                  <span
                    className="font-mono text-xs w-8 text-right"
                    style={{ color: r.value >= 70 ? '#ff4444' : r.value >= 55 ? '#ffaa00' : '#22d3ee' }}
                  >
                    {r.value}°
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div className="col-span-6 flex flex-col overflow-hidden"
          style={{ borderRight: '1px solid #0f3a4a' }}>

          <div className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid #0f3a4a', background: 'rgba(6,182,212,0.04)' }}>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-700" />
              </div>
              <span className="font-mono text-xs text-cyan-700 tracking-widest">
                TERMINAL — CONTROL OPS // {player?.name ?? 'UNKNOWN'}
              </span>
            </div>
            <span className="font-mono text-xs text-cyan-900">bash v4.2</span>
          </div>

          
          <div
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1"
            style={{ background: '#050a0e' }}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="text-cyan-800 mb-3">
              <div>╔══════════════════════════════════════════════╗</div>
              <div>║  DATA CENTER CRISIS — TERMINAL DE CONTROL    ║</div>
              <div>║  Escribe HELP para ver comandos disponibles  ║</div>
              <div>╚══════════════════════════════════════════════╝</div>
            </div>

            {[...actionLog].reverse().map((entry, i) => (
              <div key={i} className="space-y-0.5 line-appear">
                <div className="flex gap-2">
                  <span className="text-cyan-800">[{entry.time}]</span>
                  <span className="text-yellow-600">root@dc-ops:~$</span>
                  <span className="text-cyan-400">{entry.cmd}</span>
                </div>
                <div className="flex gap-2 pl-4">
                  <span className={`font-bold ${statusColor(entry.status)}`}>[{entry.status}]</span>
                  <span className="text-gray-500">{entry.msg}</span>
                </div>
              </div>
            ))}
          </div>

          
          <div style={{ borderTop: '1px solid #0f3a4a', background: '#070d12' }}>
            
            <div className="flex items-center gap-3 px-4 py-2"
              style={{ borderBottom: '1px solid #0a2030' }}>
              <span className="font-mono text-xs text-cyan-800 shrink-0">CÓDIGO DE SEGURIDAD:</span>
              <input
                type="text"
                value={secInput}
                onChange={e => setSecInput(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                maxLength={19}
                className="flex-1 bg-transparent font-mono text-xs text-cyan-500 outline-none tracking-widest placeholder-cyan-900"
              />
              <span className={`font-mono text-xs shrink-0 ${secInput.length === 19 ? 'text-green-500' : 'text-cyan-900'}`}>
                {secInput.length === 19 ? '✓ LISTO' : `${secInput.length}/19`}
              </span>
            </div>

            
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="font-mono text-xs text-yellow-600 shrink-0">root@dc-ops:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un comando..."
                className="flex-1 bg-transparent font-mono text-sm text-cyan-300 outline-none placeholder-cyan-900 tracking-wider"
                autoFocus
              />
              <button
                onClick={() => handleSubmit()}
                className="px-4 py-1.5 font-mono text-xs font-bold tracking-widest rounded btn-primary"
              >
                EJECUTAR ↵
              </button>
            </div>
          </div>
        </div>

      
        <div className="col-span-3 flex flex-col overflow-hidden" style={{ background: '#080f14' }}>

          <div className="px-4 py-3" style={{ borderBottom: '1px solid #0f3a4a' }}>
            <div className="font-mono text-xs text-cyan-700 tracking-widest">ESTADO DEL SISTEMA</div>
          </div>

          
          <div className="p-3 space-y-2 border-b border-[#0f3a4a]">
            {[
              { label: 'CPU LOAD',   val: metrics.cpuLoad,        unit: '%',               warn: 70, crit: 90 },
              { label: 'MEMORIA',    val: metrics.memoryUsage,    unit: '%',               warn: 75, crit: 90 },
              { label: 'DISK I/O',   val: metrics.diskIO,         unit: '%',               warn: 80, crit: 95 },
              { label: 'LATENCIA',   val: metrics.networkLatency, unit: 'ms',              warn: 50, crit: 100 },
              { label: 'SERVIDORES', val: metrics.serversOnline,  unit: `/${metrics.serversTotal}`, warn: 140, crit: 130 },
              { label: 'DDoS',       val: metrics.ddosAttempts,   unit: ' ataques',        warn: 30,  crit: 60 },
            ].map((m, i) => {
              const c = m.val >= m.crit ? '#ff4444' : m.val >= m.warn ? '#ffaa00' : '#22d3ee'
              return (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-700">{m.label}</span>
                  <span className="font-mono text-xs font-bold" style={{ color: c }}>
                    {m.val}{m.unit}
                  </span>
                </div>
              )
            })}
          </div>

          
          <div className="px-3 py-2 border-b border-[#0f3a4a]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-700">FIREWALL</span>
              <span className={`font-mono text-xs font-bold ${metrics.firewallStatus === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.firewallStatus}
              </span>
            </div>
          </div>

          
          <div className="flex-1 overflow-y-auto p-3">
            <div className="font-mono text-xs text-cyan-800 tracking-widest mb-2">REFERENCIA DE COMANDOS</div>
            <pre className="font-mono text-xs text-cyan-900 leading-relaxed whitespace-pre-wrap">
              {HELP_TEXT}
            </pre>
          </div>

          
          <div className="p-3" style={{ borderTop: '1px solid #0f3a4a' }}>
            <div className="font-mono text-xs text-cyan-800 mb-1">ÚLTIMO RESULTADO</div>
            {actionLog[0] ? (
              <div className="p-2 rounded" style={{ background: 'rgba(13,25,32,0.8)', border: '1px solid #0f3a4a' }}>
                <div className={`font-mono text-xs font-bold mb-0.5 ${statusColor(actionLog[0].status)}`}>
                  {actionLog[0].status}
                </div>
                <div className="font-mono text-xs text-gray-600">{actionLog[0].msg}</div>
              </div>
            ) : (
              <div className="font-mono text-xs text-cyan-900">Sin comandos ejecutados</div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
