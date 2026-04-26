import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function OpsLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden grid-lines hex-bg" style={{ background: '#050a0e' }}>
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
