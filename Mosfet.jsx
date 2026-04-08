import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Plot from 'react-plotly.js'

export default function Mosfet() {
  const [params, setParams] = useState({
    Lx: 10.0,
    Nx: 400,
    m_rel: 0.19,    // typical longitudinal electron mass in Si inversion layer
    F: 1.0,         // Electric field in V/nm (~ MV/cm)
    V_oxide: 3.1,   // Si-SiO2 interface barrier in eV
    oxide_thickness: 2.0,
    n_levels: 4
  })
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchSimulation = async () => {
    setLoading(true)
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/solve_mosfet', params)
      setData(res.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSimulation()
  }, [])

  const renderPlot = () => {
    if (!data) return null
    const { x, V, energies, wavefunctions } = data
    
    const traces = []
    
    // Scale potential for visual aid inside plot (we can truncate because V_oxide is large)
    const max_V_show = Math.max(...energies) + 2.0
    const V_clamped = V.map(v => Math.min(v, max_V_show))
    
    traces.push({
      x, y: V_clamped, type: 'scatter', mode: 'lines', name: 'Conduction Band (eV)', line: { color: '#E2E8F0', width: 2, shape: 'hv' }, fill: 'tozeroy', fillcolor: 'rgba(226,232,240,0.1)'
    })
    
    wavefunctions.forEach((psi, i) => {
      const En = energies[i]
      const y_offset = psi.map(val => En + val * 0.8) // Scale for plotting
      
      traces.push({
        x, y: y_offset, type: 'scatter', mode: 'lines', name: `E${i} = ${En.toFixed(3)} eV`,
        line: { width: 2 }
      })
      
      traces.push({
        x: [0, params.Lx], y: [En, En], type: 'scatter', mode: 'lines', name: `Level ${i}`,
        line: { dash: 'dash', width: 1, color: 'rgba(255,255,255,0.3)' }, showlegend: false
      })
    })

    return (
      <Plot
        data={traces}
        layout={{
          template: 'plotly_dark',
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          title: 'MOSFET Inversion Layer Subbands',
          xaxis: { title: 'Depth z (nm)', gridcolor: '#1E293B', range: [-1, 6] },
          yaxis: { title: 'Energy (eV)', gridcolor: '#1E293B', range: [-0.5, max_V_show] },
          margin: { l: 50, r: 20, t: 50, b: 50 },
          font: { color: '#E2E8F0', family: 'Inter' },
          shapes: [
            {
              type: 'rect',
              x0: -params.oxide_thickness,
              x1: 0,
              y0: -0.5,
              y1: params.V_oxide,
              fillcolor: 'rgba(255,100,100,0.1)',
              line: { width: 0 }
            }
          ]
        }}
        useResizeHandler
        className="w-full h-[600px]"
      />
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-bold">Nano-MOSFET Channel Integrator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <div className="lg:col-span-1 bg-surfaceHighlight border border-white/10 p-6 rounded-2xl space-y-6">
          <h3 className="font-semibold text-rose-400 uppercase tracking-wider text-sm mb-4">Device Config</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-textMuted mb-1">Gate Electric Field (V/nm): {params.F}</label>
              <input type="range" min="0.1" max="5.0" step="0.1" value={params.F} onChange={e => setParams({...params, F: parseFloat(e.target.value)})} className="w-full" />
            </div>

            <div>
              <label className="block text-xs text-textMuted mb-1">Effective Mass (m_e): {params.m_rel}</label>
              <input type="range" min="0.05" max="1.0" step="0.01" value={params.m_rel} onChange={e => setParams({...params, m_rel: parseFloat(e.target.value)})} className="w-full" />
            </div>
            
            <button 
              onClick={fetchSimulation}
              disabled={loading}
              className="w-full bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500 hover:text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {loading ? 'Solving Subbands...' : 'Calculate Energy'}
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-3 bg-surface border border-white/5 p-4 rounded-2xl shadow-xl">
           {renderPlot()}
        </div>
      </div>
    </div>
  )
}
