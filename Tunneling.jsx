import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Plot from 'react-plotly.js'

export default function Tunneling() {
  const [params, setParams] = useState({
    Lx: 20.0,
    Nx: 300,
    m_rel: 1.0,
    barrier_width: 1.0,
    barrier_height: 3.0,
    E_initial: 2.0,
    wave_packet_width: 1.5,
    x0: 5.0,
    dt: 0.1,
    num_frames: 100,
    steps_per_frame: 10
  })
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [frameIdx, setFrameIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  
  const timerRef = useRef()

  const fetchSimulation = async () => {
    setLoading(true)
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/solve_tunneling', params)
      setData(res.data)
      setFrameIdx(0)
      setPlaying(false)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (playing && data) {
      timerRef.current = setInterval(() => {
        setFrameIdx(prev => {
          if (prev >= data.frames.length - 1) {
            setPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 50) 
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, data])

  const renderPlot = () => {
    if (!data) return null
    const { x, V, frames } = data
    const prob = frames[frameIdx].prob
    
    // Scale V for visualization purposes
    const maxProb = Math.max(...frames[0].prob)
    const scaled_V = V.map(v => v * (maxProb / Math.max(...V, 1)))

    return (
      <Plot
        data={[
          { x, y: prob, type: 'scatter', mode: 'lines', name: '|ψ|²', fill: 'tozeroy', line: { color: '#00F0FF', width: 2 } },
          { x, y: scaled_V, type: 'scatter', mode: 'lines', name: 'Potential (V)', line: { color: '#94A3B8', width: 2, dash: 'dot' } },
        ]}
        layout={{
          template: 'plotly_dark',
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          title: `Time-Dependent Wave Packet Propogation (Frame ${frameIdx+1}/${frames.length})`,
          xaxis: { title: 'Position X (nm)', gridcolor: '#1E293B', range: [0, params.Lx] },
          yaxis: { title: 'Probability Density', gridcolor: '#1E293B', range: [0, maxProb * 1.5] },
          margin: { l: 50, r: 20, t: 50, b: 50 },
          font: { color: '#E2E8F0', family: 'Inter' }
        }}
        useResizeHandler
        className="w-full h-[500px]"
      />
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-bold">Quantum Tunneling</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <div className="lg:col-span-1 bg-surfaceHighlight border border-white/10 p-6 rounded-2xl space-y-6">
          <h3 className="font-semibold text-emerald-400 uppercase tracking-wider text-sm mb-4">Setup</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-textMuted mb-1">Incoming Kinetic Energy (eV): {params.E_initial}</label>
              <input type="range" min="0.1" max="10" step="0.1" value={params.E_initial} onChange={e => setParams({...params, E_initial: parseFloat(e.target.value)})} className="w-full" />
            </div>

            <div>
              <label className="block text-xs text-textMuted mb-1">Barrier Height (eV): {params.barrier_height}</label>
              <input type="range" min="0" max="10" step="0.1" value={params.barrier_height} onChange={e => setParams({...params, barrier_height: parseFloat(e.target.value)})} className="w-full" />
            </div>

            <div>
              <label className="block text-xs text-textMuted mb-1">Barrier Width (nm): {params.barrier_width}</label>
              <input type="range" min="0.1" max="5" step="0.1" value={params.barrier_width} onChange={e => setParams({...params, barrier_width: parseFloat(e.target.value)})} className="w-full" />
            </div>
            
            <button 
              onClick={fetchSimulation}
              disabled={loading}
              className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {loading ? 'Simulating...' : 'Generate Wave'}
            </button>
          </div>

          {data && (
            <div className="pt-4 border-t border-white/10 text-sm">
              <p>Transmission: {(data.transmission * 100).toFixed(4)}%</p>
              <p>Reflection: {(data.reflection * 100).toFixed(4)}%</p>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-surface border border-white/5 p-4 rounded-2xl shadow-xl">
             {renderPlot()}
          </div>
          {data && (
            <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-white/5">
              <button 
                onClick={() => setPlaying(!playing)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                {playing ? 'Pause' : 'Play'}
              </button>
              <input 
                type="range" 
                min="0" max={data.frames.length - 1} 
                value={frameIdx} 
                onChange={(e) => setFrameIdx(parseInt(e.target.value))} 
                className="flex-1"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
