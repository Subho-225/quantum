import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Activity, LayoutGrid, Waves, Cpu, Home as HomeIcon } from 'lucide-react'
import Home from './pages/Home'
import Solver1D from './pages/Solver1D'
import Solver2D from './pages/Solver2D'
import Tunneling from './pages/Tunneling'
import Mosfet from './pages/Mosfet'

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive ? 'bg-neonBlue/10 text-neonBlue border border-neonBlue/20' : 'text-textMuted hover:bg-surfaceHighlight hover:text-textMain'}`}>
      <Icon size={20} className={isActive ? 'text-neonBlue' : 'text-textMuted'} />
      <span className="font-medium">{label}</span>
    </Link>
  )
}

function Sidebar() {
  return (
    <div className="w-64 bg-surface/80 backdrop-blur-md border-r border-surfaceHighlight h-screen fixed left-0 top-0 flex flex-col pt-8">
      <div className="px-6 mb-10 flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-neonBlue to-neonPurple flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.5)]">
          <Activity size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neonBlue to-neonPurple">
          QuantumLab Pro
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <SidebarItem to="/" icon={HomeIcon} label="Dashboard" />
        <SidebarItem to="/1d" icon={Activity} label="1D Solver" />
        <SidebarItem to="/2d" icon={LayoutGrid} label="2D Map Solver" />
        <SidebarItem to="/tunneling" icon={Waves} label="Wave Packets" />
        <SidebarItem to="/mosfet" icon={Cpu} label="MOSFET Channel" />
      </nav>
      
      <div className="p-6 text-xs text-textMuted/50 text-center">
        v1.0.0 • Advanced Simulation
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-background text-textMain selection:bg-neonBlue/30">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-neonBlue/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-neonPurple/5 blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 w-full h-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/1d" element={<Solver1D />} />
              <Route path="/2d" element={<Solver2D />} />
              <Route path="/tunneling" element={<Tunneling />} />
              <Route path="/mosfet" element={<Mosfet />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
