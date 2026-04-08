import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Plot from 'react-plotly.js'

export default function Solver1D() {
  const [params, setParams] = useState({
    Lx: 10.0,
    Nx: 500,
    m_rel: 1.0,
    V_type: 'infinite_well',
    n_levels: 5,
    V_params: { depth: 50.0, width: 4.0, omega: 2.0 }
  })
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchSimulation = async () => {
    setLoading(true)
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/solve_1d', {
        Lx: params.Lx,
        Nx: params.Nx,
        m_rel: params.m_rel,
        V_type: params.V_type,
        n_levels: params.n_levels,
        V_params: params.V_params
      })
      setData(res.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSimulation()
  }, [params.V_type])

  const renderPlot = () => {
    if (!data) return null
    const { x, V, energies, wavefunctions } = data
    
    const traces = []
    
    // Potential V(x) trace
    traces.push({
      x, y: V, type: 'scatter', mode: 'lines', name: 'V(x)', line: { color: '#E2E8F0', width: 2 }
    })
    
    // Wavefunctions / Probabilities
    wavefunctions.forEach((psi, i) => {
      const En = energies[i]
      const y_offset = psi.map(val => En + val * 2.0) // Scale psi for vis
      
      traces.push({
        x, y: y_offset, type: 'scatter', mode: 'lines', name: `ψ_${i} (E=${En.toFixed(3)}eV)`,
        line: { width: 2 }
      })
      
      // Energy Level line
      traces.push({
        x: [x[0], x[x.length-1]], y: [En, En], type: 'scatter', mode: 'lines', name: `E_${i}`,
        line: { dash: 'dash', width: 1 }, showlegend: false
      })
    })

    return (
      <Plot
        data={traces}
        layout={{
          template: 'plotly_dark',
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          title: '1D Energy Eigenstates',
          xaxis: { title: 'Position (nm)', gridcolor: '#1E293B' },
          yaxis: { title: 'Energy (eV)', gridcolor: '#1E293B' },
          margin: { l: 50, r: 20, t: 50, b: 50 },
          font: { color: '#E2E8F0', family: 'Inter' }
        }}
        useResizeHandler
        className="w-full h-[600px]"
      />
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-bold">1D Schrödinger Solver</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <div className="lg:col-span-1 bg-surfaceHighlight border border-white/10 p-6 rounded-2xl space-y-6">
          <h3 className="font-semibold text-neonBlue uppercase tracking-wider text-sm mb-4">Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-textMuted mb-1">Potential Type</label>
              <select 
                value={params.V_type}
                onChange={e => setParams({...params, V_type: e.target.value})}
                className="w-full bg-surface border border-white/10 rounded-lg p-2 text-sm focus:border-neonBlue focus:outline-none"
              >
                <option value="infinite_well">Infinite Well</option>
                <option value="finite_well">Finite Well</option>
                <option value="harmonic">Harmonic Oscillator</option>
              </select>
            </div>
            
            {params.V_type === 'finite_well' && (
              <>
                <div>
                  <label className="block text-xs text-textMuted mb-1">Well Depth (eV): {params.V_params.depth}</label>
                  <input type="range" min="1" max="100" value={params.V_params.depth} onChange={e => setParams({...params, V_params: {...params.V_params, depth: parseFloat(e.target.value)}})} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs text-textMuted mb-1">Well Width (nm): {params.V_params.width}</label>
                  <input type="range" min="1" max="10" step="0.1" value={params.V_params.width} onChange={e => setParams({...params, V_params: {...params.V_params, width: parseFloat(e.target.value)}})} className="w-full" />
                </div>
              </>
            )}
            
            {params.V_type === 'harmonic' && (
              <div>
                <label className="block text-xs text-textMuted mb-1">Omega (Strength): {params.V_params.omega}</label>
                <input type="range" min="0.1" max="10" step="0.1" value={params.V_params.omega} onChange={e => setParams({...params, V_params: {...params.V_params, omega: parseFloat(e.target.value)}})} className="w-full" />
              </div>
            )}
            
            <div>
              <label className="block text-xs text-textMuted mb-1">Mass (m_e): {params.m_rel}</label>
              <input type="range" min="0.01" max="5" step="0.01" value={params.m_rel} onChange={e => setParams({...params, m_rel: parseFloat(e.target.value)})} className="w-full" />
            </div>
            
            <div>
              <label className="block text-xs text-textMuted mb-1">Domain L (nm): {params.Lx}</label>
              <input type="range" min="5" max="50" step="1" value={params.Lx} onChange={e => setParams({...params, Lx: parseFloat(e.target.value)})} className="w-full" />
            </div>

            <button 
              onClick={fetchSimulation}
              disabled={loading}
              className="w-full bg-neonBlue/20 text-neonBlue border border-neonBlue/50 hover:bg-neonBlue hover:text-surface font-semibold py-2 rounded-lg transition-colors"
            >
              {loading ? 'Solving...' : 'Run Simulation'}
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
