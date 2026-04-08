import React from 'react'
import { motion } from 'framer-motion'
import { Activity, LayoutGrid, Waves, Cpu, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const cards = [
  { path: '/1d', title: '1D Schrödinger', icon: Activity, desc: 'Solve particle in a box and harmonic oscillators.', color: 'from-blue-500 to-cyan-400' },
  { path: '/2d', title: '2D Quantum Map', icon: LayoutGrid, desc: 'Interactive 2D surface potential simulation.', color: 'from-purple-500 to-indigo-400' },
  { path: '/tunneling', title: 'Quantum Tunneling', icon: Waves, desc: 'Time-dependent wave packet propagation.', color: 'from-emerald-500 to-teal-400' },
  { path: '/mosfet', title: 'Nano-MOSFET', icon: Cpu, desc: 'Quantization within the channel inversion layer.', color: 'from-rose-500 to-orange-400' }
]

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-5xl mx-auto text-center space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neonBlue/30 bg-neonBlue/10 text-neonBlue text-sm mb-4 backdrop-blur-sm shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <span className="w-2 h-2 rounded-full bg-neonBlue animate-pulse" />
          Simulation Engine Online
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight">
          Simulating Quantum Physics Inside the <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-neonBlue via-neonPurple to-pink-500 mt-4 block">
            Smallest Transistors on Earth
          </span>
        </h1>
        <p className="text-xl text-textMuted max-w-3xl mx-auto">
          QuantumLab Pro provides research-grade numerical solutions to the Schrödinger equation, 
          allowing real-time visualization of sub-atomic particle dynamics.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-12">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 + 0.4 }}
          >
            <Link to={card.path} className="group block p-1 rounded-3xl bg-gradient-to-br from-surfaceHighlight to-surface hover:from-white/10 hover:to-surface transition-all duration-500 relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 ease-out blur-xl" style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
              <div className="relative bg-surface rounded-[22px] p-8 h-full flex flex-col items-start text-left border border-white/5 group-hover:border-white/10 transition-colors z-10">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} mb-6 shadow-lg shadow-black/50`}>
                  <card.icon size={32} className="text-white drop-shadow-md" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-neonBlue transition-colors">{card.title}</h3>
                <p className="text-textMuted flex-1 leading-relaxed">{card.desc}</p>
                <div className="mt-8 flex items-center text-sm font-semibold text-neonBlue/70 group-hover:text-neonBlue transition-colors uppercase tracking-wider">
                  Launch Module <ChevronRight size={18} className="ml-1 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
