import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import useCrisisStore from '../store/useCrisisStore'

export default function OpsLayout() {
  const navigate = useNavigate()
  const { criticalAlert, abortMission, restartMission } = useCrisisStore()

  const isGameOver = criticalAlert && 
    (criticalAlert.title === 'SISTEMA CAÍDO' || criticalAlert.title === 'MISIÓN ABORTADA')

  const handleFullRestart = () => {
    console.log('[CLIENT] Reiniciando partida con mismos jugadores...')
    restartMission()
  }

  const handleAbortAndExit = () => {
    console.log('[CLIENT] Terminando sesión y volviendo al lobby...')
    abortMission()
    navigate('/')
  }
 
  return (
    <div className="flex flex-col h-screen overflow-hidden grid-lines hex-bg relative" style={{ background: '#050a0e' }}>
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
 
      {/* MODAL DE GAME OVER / MISIÓN FINALIZADA */}
      {isGameOver && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="max-w-md w-full p-8 panel-border bg-[#0d0505] rounded-lg shadow-[0_0_50px_rgba(255,0,0,0.3)] text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-red-500 flex items-center justify-center animate-pulse">
              <span className="text-4xl text-red-500">⚠</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-red-500 tracking-tighter mb-2 uppercase">
              {criticalAlert.title}
            </h2>
            <p className="font-mono text-sm text-gray-400 mb-8 leading-relaxed">
              {criticalAlert.msg}
            </p>
            <div className="space-y-4">
              <button
                onClick={handleFullRestart}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-display text-sm font-bold tracking-widest transition-all rounded shadow-lg shadow-red-900/20"
              >
                REINTENTAR (MISMOS JUGADORES)
              </button>
              <button
                onClick={handleAbortAndExit}
                className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 font-mono text-[11px] tracking-widest transition-all rounded border border-gray-800"
              >
                TERMINAR MISIÓN Y SALIR AL LOBBY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
