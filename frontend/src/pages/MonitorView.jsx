import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import useCrisisStore from '../store/useCrisisStore'

export default function MonitorView() {
  const navigate = useNavigate()
  const { player, metrics, events, securityCode, systemStatus } = useCrisisStore()

  useEffect(() => {
    if (!player) navigate('/')
  }, [player, navigate])

  const isCritical = systemStatus === 'CRITICAL'
  const isWarning  = systemStatus === 'WARNING'

  const statusBg = isCritical
    ? 'from-[#0d0505] to-[#150808]'
    : isWarning
    ? 'from-[#0a0a05] to-[#0d1408]'
    : 'from-[#050a0e] to-[#080f14]'

  return (
    <div className={`h-full overflow-y-auto bg-gradient-to-br ${statusBg} ${isCritical ? 'alert-flash' : ''}`}>
      <div className="p-4 space-y-4">

        
        <div
          className="flex items-center justify-between px-5 py-3 rounded"
          style={{
            background: isCritical
              ? 'linear-gradient(90deg, rgba(255,68,68,0.15), rgba(255,68,68,0.05))'
              : isWarning
              ? 'linear-gradient(90deg, rgba(255,170,0,0.12), rgba(255,170,0,0.04))'
              : 'linear-gradient(90deg, rgba(0,255,136,0.08), rgba(0,255,136,0.02))',
            border: `1px solid ${isCritical ? 'rgba(255,68,68,0.4)' : isWarning ? 'rgba(255,170,0,0.35)' : 'rgba(0,255,136,0.3)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className={`font-mono text-xs font-bold tracking-widest ${isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400'}`}>
              {isCritical ? '⚠ ESTADO CRÍTICO — ACCIÓN INMEDIATA REQUERIDA'
               : isWarning ? '◈ ALERTA ACTIVA — MONITOREO INTENSIVO'
               : '◎ SISTEMAS NOMINALES'}
            </span>
            {isCritical && (
              <span className="font-mono text-xs text-red-500 animate-pulse">NOTIFICAR AL TÉCNICO</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-gray-600">SERVIDORES:</span>
            <span className="font-mono text-sm font-bold text-cyan-400">
              {metrics.serversOnline}/{metrics.serversTotal}
            </span>
            <span className="font-mono text-xs text-gray-600">DDoS BLOQUEADOS:</span>
            <span className="font-mono text-sm font-bold text-red-400">{metrics.ddosAttempts}</span>
          </div>
        </div>

        
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="CPU LOAD"    value={`${metrics.cpuLoad}%`}          val={metrics.cpuLoad}        warn={70} crit={90} />
          <KpiCard label="MEMORIA"     value={`${metrics.memoryUsage}%`}       val={metrics.memoryUsage}    warn={75} crit={90} />
          <KpiCard label="DISK I/O"    value={`${metrics.diskIO}%`}            val={metrics.diskIO}         warn={80} crit={95} />
          <KpiCard label="LATENCIA RED" value={`${metrics.networkLatency}ms`}  val={metrics.networkLatency} warn={50} crit={100} />
        </div>

        
        <div className="grid grid-cols-3 gap-4">

          
          <div className="col-span-1 panel-border rounded-lg overflow-hidden" style={{ background: '#080f14' }}>
            <PanelHeader title="TEMPERATURA RACKS" icon="◈" unit="°C" />
            <div className="p-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={metrics.temperature} barSize={24}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(15,58,74,0.4)" />
                  <XAxis
                    dataKey="rack"
                    tick={{ fill: '#4a7a8a', fontSize: 10, fontFamily: 'Share Tech Mono' }}
                  />
                  <YAxis
                    domain={[0, 80]}
                    tick={{ fill: '#4a7a8a', fontSize: 10, fontFamily: 'Share Tech Mono' }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#0d1920', border: '1px solid #0f3a4a', borderRadius: 4 }}
                    labelStyle={{ color: '#22d3ee', fontFamily: 'Share Tech Mono', fontSize: 11 }}
                    itemStyle={{ color: '#a8d8e8', fontFamily: 'Share Tech Mono', fontSize: 11 }}
                    formatter={(v) => [`${v}°C`, 'Temp']}
                  />
                  <Bar
                    dataKey="value"
                    radius={[2, 2, 0, 0]}
                    label={{
                      position: 'top',
                      fill: '#4a7a8a',
                      fontSize: 9,
                      fontFamily: 'Share Tech Mono',
                      formatter: (v) => `${v}°`,
                    }}
                  >
                    {metrics.temperature.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.value >= 70 ? '#ff4444' : entry.value >= 55 ? '#ffaa00' : '#06b6d4'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-between">
                {metrics.temperature.map((r, i) => (
                  <div key={i} className="text-center">
                    <div
                      className="font-mono text-xs font-bold"
                      style={{ color: r.value >= 70 ? '#ff4444' : r.value >= 55 ? '#ffaa00' : '#22d3ee' }}
                    >
                      {r.rack}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
          <div className="col-span-2 panel-border rounded-lg overflow-hidden" style={{ background: '#080f14' }}>
            <PanelHeader title="ANCHO DE BANDA — 24H" icon="◎" unit="Gbps" />
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={metrics.bandwidth}>
                  <defs>
                    <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(15,58,74,0.4)" />
                  <XAxis dataKey="time" tick={{ fill: '#4a7a8a', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                  <YAxis tick={{ fill: '#4a7a8a', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                  <Tooltip
                    contentStyle={{ background: '#0d1920', border: '1px solid #0f3a4a', borderRadius: 4 }}
                    labelStyle={{ color: '#22d3ee', fontFamily: 'Share Tech Mono', fontSize: 11 }}
                    itemStyle={{ fontFamily: 'Share Tech Mono', fontSize: 11 }}
                    formatter={(v, n) => [`${v} Gbps`, n === 'in' ? '↓ Entrada' : '↑ Salida']}
                  />
                  <Area type="monotone" dataKey="in"  stroke="#06b6d4" strokeWidth={2} fill="url(#gradIn)" />
                  <Area type="monotone" dataKey="out" stroke="#00ff88" strokeWidth={2} fill="url(#gradOut)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-1 justify-end">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-cyan-500" />
                  <span className="font-mono text-xs text-cyan-700">ENTRADA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-green-400" />
                  <span className="font-mono text-xs text-green-800">SALIDA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-3 gap-4">

          
          <div className="panel-border rounded-lg overflow-hidden" style={{ background: '#080f14' }}>
            <PanelHeader title="CÓDIGO DE SEGURIDAD" icon="⬡" />
            <div className="p-5 flex flex-col items-center justify-center" style={{ minHeight: 140 }}>
              <div className="font-mono text-xs text-cyan-800 tracking-widest mb-3 uppercase">
                — Comunicar al Técnico —
              </div>
              <div
                className="font-mono text-2xl font-bold tracking-widest text-center mb-4"
                style={{
                  color: '#22d3ee',
                  letterSpacing: '0.25em',
                  textShadow: '0 0 15px #06b6d4, 0 0 30px #06b6d4',
                }}
              >
                {securityCode}
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-xs text-green-700">CÓDIGO ACTIVO</span>
              </div>
              <div className="mt-3 font-mono text-xs text-cyan-900">
                FIREWALL: <span className="text-green-500">{metrics.firewallStatus}</span>
              </div>
            </div>
          </div>

          
          <div className="panel-border rounded-lg overflow-hidden" style={{ background: '#080f14' }}>
            <PanelHeader title="MONITOR DE INTRUSIONES" icon="◉" />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-gray-600">INTENTOS DDoS (HOY)</span>
                <span className="font-mono text-xl font-bold text-red-400">{metrics.ddosAttempts}</span>
              </div>
              <div className="space-y-2">
                {[
                  { ip: '192.168.44.22', status: 'BLOQUEADO', type: 'SYN Flood' },
                  { ip: '10.0.88.131',   status: 'BLOQUEADO', type: 'UDP Storm' },
                  { ip: '172.16.5.44',   status: 'ANALIZAR',  type: 'HTTP Flood' },
                ].map((threat, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 px-2 rounded"
                    style={{ background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.1)' }}
                  >
                    <span className="font-mono text-xs text-gray-500">{threat.ip}</span>
                    <span className="font-mono text-xs text-gray-600">{threat.type}</span>
                    <span className={`font-mono text-xs font-bold ${threat.status === 'BLOQUEADO' ? 'text-green-500' : 'text-yellow-400'}`}>
                      {threat.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

      
          <div className="panel-border rounded-lg overflow-hidden" style={{ background: '#080f14' }}>
            <PanelHeader title="LOG DE EVENTOS" icon="▸" />
            <div className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 160 }}>
              {events.map((ev, i) => (
                <div
                  key={ev.id ?? i}
                  className="flex gap-2 items-start py-1 px-2 rounded"
                  style={{
                    background: i === 0 ? 'rgba(6,182,212,0.05)' : 'transparent',
                    borderLeft: `2px solid ${ev.type === 'ALERT' ? '#ff4444' : ev.type === 'WARN' ? '#ffaa00' : '#0f3a4a'}`,
                  }}
                >
                  <span className="font-mono text-xs text-cyan-900 shrink-0">{ev.time}</span>
                  <span className={`font-mono text-xs shrink-0 font-bold ${
                    ev.type === 'ALERT' ? 'text-red-500' :
                    ev.type === 'WARN'  ? 'text-yellow-500' : 'text-cyan-700'
                  }`}>
                    [{ev.type}]
                  </span>
                  <span className="font-mono text-xs text-gray-500 leading-relaxed">{ev.msg}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function PanelHeader({ title, icon, unit }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{ borderBottom: '1px solid #0f3a4a', background: 'rgba(6,182,212,0.03)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-cyan-600 text-xs">{icon}</span>
        <span className="font-mono text-xs tracking-widest text-cyan-700 uppercase">{title}</span>
      </div>
      {unit && <span className="font-mono text-xs text-cyan-900">{unit}</span>}
    </div>
  )
}

function KpiCard({ label, value, val, warn, crit }) {
  const pct   = Math.min(val, 100)
  const color = val >= crit ? '#ff4444' : val >= warn ? '#ffaa00' : '#22d3ee'

  return (
    <div className="panel-border rounded-lg p-4" style={{ background: '#080f14' }}>
      <div className="font-mono text-xs text-cyan-800 tracking-widest mb-1">{label}</div>
      <div className="font-display text-2xl font-bold mb-2" style={{ color }}>{value}</div>
      <div className="w-full h-1 rounded-full" style={{ background: '#0f2030' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
    </div>
  )
}
