import { create } from 'zustand'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3001'

const initialMetrics = {
  temperature: [
    { rack: 'RACK-A1', value: 24, max: 80 },
    { rack: 'RACK-A2', value: 26, max: 80 },
    { rack: 'RACK-B1', value: 23, max: 80 },
    { rack: 'RACK-B2', value: 25, max: 80 },
    { rack: 'RACK-C1', value: 24, max: 80 },
    { rack: 'RACK-C2', value: 27, max: 80 },
  ],
  bandwidth: [],
  ddosAttempts: 0,
  firewallStatus: 'INACTIVE',
  serversOnline: 148,
  serversTotal: 148,
  cpuLoad: 20,
  memoryUsage: 35,
  diskIO: 12,
  networkLatency: 15,
}

const useCrisisStore = create((set, get) => ({
  player: null,
  setPlayer: (name, role) => set({ player: { name, role } }),

  socket: null,
  connected: false,

  connectSocket: () => {
    const { socket: existing } = get()
    if (existing) return
    
    // LIMPIEZA PREVENTIVA: Asegurar que el estado esté limpio al conectar
    set({
      metrics: initialMetrics,
      criticalAlert: null,
      systemStatus: 'NOMINAL',
      actionLog: [],
      events: [],
      securityCode: '----'
    })

    const socket = io(SOCKET_URL, { transports: ['websocket'], reconnection: true })

    socket.on('connect', () => {
      set({ connected: true })
      const { player } = get()
      if (player) {
        socket.emit('join-room', { roomId: 'Sala-01', role: player.role === 'technician' ? 'tecnico' : 'monitor' })
      }
    })

    socket.on('disconnect', () => set({ connected: false }))

    socket.on('update-state', (data) => {
      const state = get();
      const currentMetrics = state.metrics;
      
      const newBandwidth = [...currentMetrics.bandwidth];
      const timeStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      newBandwidth.push({ time: timeStr, in: data.anchoBanda, out: Math.floor(data.anchoBanda * 0.7) });
      if (newBandwidth.length > 20) newBandwidth.shift();

      set({ 
        metrics: { 
          ...currentMetrics, 
          temperature: currentMetrics.temperature.map(r => ({ ...r, value: data.tempRacks })),
          ddosAttempts: data.intentosDDoS,
          bandwidth: newBandwidth,
          memoryUsage: data.memoryUsage,
          diskIO: data.diskIO,
          networkLatency: data.networkLatency,
          serversOnline: data.serversOnline,
          serversTotal: data.serversTotal,
          firewallStatus: data.firewallStatus,
          cpuLoad: 40 + (data.crisisLevel * 0.6)
        },
        systemStatus: data.crisisLevel > 70 ? 'CRITICAL' : data.crisisLevel > 30 ? 'WARNING' : 'NOMINAL'
      })
    })

    socket.on('crisis-alert', (data) => {
      const event = { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'ALERT', msg: data.message }
      set({ 
        events: [event, ...get().events].slice(0, 50),
        criticalAlert: { title: 'ALERTA CRÍTICA', msg: data.message, time: event.time }
      })
      setTimeout(() => set({ criticalAlert: null }), 5000)
    })

    socket.on('crisis-code', (data) => {
      set({ securityCode: data.code })
      const event = { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'INFO', msg: `Código de emergencia: ${data.code}` }
      set({ events: [event, ...get().events].slice(0, 50) })
    })

    socket.on('crisis-resolved', (data) => {
      const result = { status: 'OK', msg: data.message, time: new Date().toLocaleTimeString() }
      set({ 
        securityCode: '----', // Limpiar el código al resolver la crisis
        lastActionResult: result,
        actionLog: [{ time: result.time, cmd: 'PROTOCOL', status: 'OK', msg: data.message }, ...get().actionLog].slice(0, 30)
      })
    })

    socket.on('action-failed', (data) => {
      const result = { status: 'ERROR', msg: data.message, time: new Date().toLocaleTimeString() }
      set({ 
        lastActionResult: result,
        actionLog: get().actionLog.map(a => a.status === 'PENDING' ? { ...a, status: 'ERROR', msg: data.message } : a)
      })
    })

    socket.on('action-performed', (data) => {
      const event = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: 'INFO',
        msg: `${data.player}: ${data.action} -> ${data.result}`
      }
      set({ events: [event, ...get().events].slice(0, 50) })
    })

    socket.on('force-lobby', (data) => {
      const { socket } = get()
      if (socket) socket.disconnect()
      
      set({ 
        socket: null,
        connected: false,
        player: null,
        metrics: initialMetrics,
        criticalAlert: { title: 'MISIÓN ABORTADA', msg: data.message, time: new Date().toLocaleTimeString() },
        systemStatus: 'NOMINAL',
        actionLog: [],
        events: []
      })
    })

    socket.on('mission-reset', (data) => {
      set({ 
        metrics: initialMetrics,
        criticalAlert: null,
        systemStatus: 'NOMINAL',
        securityCode: '----'
        // No borramos historial para que puedan leerlo
      })
      const event = { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'INFO', msg: `SISTEMA REINICIADO: ${data.message}` }
      set({ events: [event, ...get().events].slice(0, 50) })
    })

    socket.on('game-over', (data) => {
      set({ 
        systemStatus: 'CRITICAL',
        criticalAlert: { title: 'SISTEMA CAÍDO', msg: data.message, time: new Date().toLocaleTimeString() }
      })
    })

    set({ socket })
  },

  abortMission: () => {
    const { socket, player } = get()
    if (socket && player) {
      // Emitimos abort-mission para que el servidor nos eche al lobby a todos
      socket.emit('abort-mission', { roomId: 'Sala-01' })
    }
  },

  restartMission: () => {
    const { socket, player } = get()
    if (socket && player) {
      // Pedimos un reset suave al servidor (puedes añadir este evento si quieres o usar uno existente)
      // Por ahora, para "Volver a empezar" sin salir, necesitamos un evento que resetee pero no eche.
      socket.emit('restart-request', { roomId: 'Sala-01' })
    }
    set({ criticalAlert: null })
  },

  startMission: () => {
    const { socket, player } = get()
    if (socket && player) {
      socket.emit('start-mission', { roomId: 'Sala-01' })
    }
  },

  exitToLobby: () => {
    const { socket } = get()
    if (socket) socket.disconnect()
    set({
      socket: null,
      player: null,
      metrics: initialMetrics,
      criticalAlert: null,
      systemStatus: 'NOMINAL',
      actionLog: [],
      events: []
    })
  },

  metrics: initialMetrics,
  events: [],
  securityCode: '----',
  systemStatus: 'NOMINAL',
  actionLog: [],
  lastActionResult: null,
  criticalAlert: null,

  sendCommand: (command, securityCode) => {
    const { socket, connected } = get()
    const timestamp = new Date().toLocaleTimeString('es-CO', { hour12: false })
    const entry = { id: Date.now(), time: timestamp, cmd: command, status: 'PENDING', msg: 'Enviando...' }
    set({ actionLog: [entry, ...get().actionLog].slice(0, 30) })

    if (socket && connected) {
      socket.emit('action', { roomId: 'Sala-01', code: securityCode, command: command })
    }
  },
}))

export default useCrisisStore
