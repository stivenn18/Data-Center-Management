import { create } from 'zustand'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

const generateSecurityCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  ).join('-')
}

const useCrisisStore = create((set, get) => ({
  
  player: null,
  setPlayer: (name, role) => set({ player: { name, role } }),

  
  socket: null,
  connected: false,

  connectSocket: () => {
    const { socket: existing } = get()
    if (existing) return
    const socket = io(SOCKET_URL, { transports: ['websocket'], reconnection: true })

    socket.on('connect', () => {
      set({ connected: true })
      const { player } = get()
      if (player) socket.emit('player:join', { name: player.name, role: player.role })
    })
    socket.on('disconnect', () => set({ connected: false }))
    socket.on('metrics:update', (data) => set({ metrics: { ...get().metrics, ...data } }))
    socket.on('event:new', (event) => set({ events: [event, ...get().events].slice(0, 50) }))
    socket.on('security:code', (code) => set({ securityCode: code }))
    socket.on('system:status', (status) => set({ systemStatus: status }))
    socket.on('action:result', (result) => {
      set({ actionLog: [result, ...get().actionLog].slice(0, 30), lastActionResult: result })
    })
    socket.on('alert:critical', (alert) => {
      set({ criticalAlert: alert })
      setTimeout(() => set({ criticalAlert: null }), 5000)
    })
    set({ socket })
  },

  disconnectSocket: () => {
    const { socket } = get()
    if (socket) { socket.disconnect() }
    set({ socket: null, connected: false })
  },

  
  metrics: {
    temperature: [
      { rack: 'A1', value: 42, max: 80 },
      { rack: 'A2', value: 67, max: 80 },
      { rack: 'B1', value: 35, max: 80 },
      { rack: 'B2', value: 78, max: 80 },
      { rack: 'C1', value: 55, max: 80 },
      { rack: 'C2', value: 61, max: 80 },
    ],
    bandwidth: [
      { time: '00h', in: 120, out: 80 },
      { time: '04h', in: 90,  out: 60 },
      { time: '08h', in: 200, out: 150 },
      { time: '12h', in: 340, out: 280 },
      { time: '16h', in: 420, out: 310 },
      { time: '20h', in: 380, out: 260 },
      { time: '24h', in: 290, out: 190 },
    ],
    ddosAttempts: 47,
    firewallStatus: 'ACTIVE',
    serversOnline: 142,
    serversTotal: 148,
    cpuLoad: 73,
    memoryUsage: 61,
    diskIO: 88,
    networkLatency: 12,
  },

  
  events: [
    { id: 1, time: '23:47:12', type: 'WARN',  msg: 'RACK-B2 temperatura elevada: 78°C' },
    { id: 2, time: '23:45:01', type: 'ALERT', msg: 'Intento DDoS bloqueado — IP: 192.168.44.22' },
    { id: 3, time: '23:42:33', type: 'INFO',  msg: 'Servidor SRV-112 reiniciado exitosamente' },
    { id: 4, time: '23:39:10', type: 'ALERT', msg: 'Ancho de banda superó umbral 420 Gbps' },
    { id: 5, time: '23:35:55', type: 'INFO',  msg: 'Firewall actualizado — reglas v4.2.1' },
    { id: 6, time: '23:30:00', type: 'WARN',  msg: 'RACK-A2 temperatura: 67°C — monitorear' },
  ],

  
  securityCode: generateSecurityCode(),
  regenerateCode: () => set({ securityCode: generateSecurityCode() }),

  
  systemStatus: 'WARNING',

  
  actionLog: [
    { time: '23:47:00', cmd: 'COOL RACK-B2 100', status: 'OK',    msg: 'Enfriamiento al 100% activado' },
    { time: '23:42:00', cmd: 'RESTART SRV-112',  status: 'OK',    msg: 'Servidor reiniciado correctamente' },
    { time: '23:39:00', cmd: 'FIREWALL ENABLE',  status: 'OK',    msg: 'Firewall de emergencia activado' },
  ],
  lastActionResult: null,
  criticalAlert: null,

  
  sendCommand: (command) => {
    const { socket, connected, securityCode } = get()
    const timestamp = new Date().toLocaleTimeString('es-CO', { hour12: false })
    const entry = { time: timestamp, cmd: command, status: 'PENDING', msg: 'Procesando...' }
    set({ actionLog: [entry, ...get().actionLog].slice(0, 30) })

    if (socket && connected) {
      socket.emit('action:command', { command, securityCode })
    } else {
      setTimeout(() => {
        const result = simulateCommand(command)
        const { actionLog, metrics, events } = get()
        const updated = actionLog.map((l, i) =>
          i === 0 ? { ...l, status: result.status, msg: result.msg } : l
        )
        const newEvent = {
          id: Date.now(),
          time: timestamp,
          type: result.status === 'OK' ? 'INFO' : 'ALERT',
          msg: `[TÉCNICO] ${command} — ${result.msg}`,
        }
        set({
          actionLog: updated,
          events: [newEvent, ...events].slice(0, 50),
          metrics: applyCommandToMetrics(command, metrics),
        })
      }, 600)
    }
  },
}))

function simulateCommand(cmd) {
  const u = cmd.toUpperCase()
  if (u.includes('COOL'))     return { status: 'OK',    msg: 'Enfriamiento ajustado exitosamente' }
  if (u.includes('RESTART'))  return { status: 'OK',    msg: 'Servidor reiniciado correctamente' }
  if (u.includes('FIREWALL')) return { status: 'OK',    msg: 'Firewall activado — DDoS bloqueado' }
  if (u.includes('SHUTDOWN')) return { status: 'OK',    msg: 'Sistema apagado de forma controlada' }
  if (u.includes('ISOLATE'))  return { status: 'OK',    msg: 'Rack aislado de la red principal' }
  if (u.includes('BOOST'))    return { status: 'OK',    msg: 'Potencia de cooling incrementada' }
  return { status: 'ERROR', msg: 'Comando no reconocido. Revisa la sintaxis.' }
}

function applyCommandToMetrics(cmd, metrics) {
  const u = cmd.toUpperCase()
  if (u.includes('COOL')) {
    return {
      ...metrics,
      temperature: metrics.temperature.map(r => ({
        ...r, value: Math.max(28, r.value - Math.floor(Math.random() * 12 + 5)),
      })),
    }
  }
  if (u.includes('RESTART')) {
    return { ...metrics, serversOnline: Math.min(metrics.serversTotal, metrics.serversOnline + 1) }
  }
  if (u.includes('FIREWALL')) {
    return { ...metrics, ddosAttempts: Math.max(0, metrics.ddosAttempts - 12), firewallStatus: 'ACTIVE' }
  }
  return metrics
}

export default useCrisisStore
