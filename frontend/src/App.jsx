import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import OpsLayout from './layouts/OpsLayout'
import Lobby from './pages/Lobby'
import MonitorView from './pages/MonitorView'
import BridgeView from './pages/BridgeView'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Lobby />,
  },
  {
    path: '/ops',
    element: <OpsLayout />,
    children: [
      { index: true, element: <Navigate to="/" replace /> },
      { path: 'monitor', element: <MonitorView /> },
      { path: 'bridge',  element: <BridgeView /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
