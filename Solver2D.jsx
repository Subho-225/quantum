import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Plot from 'react-plotly.js'

export default function Solver2D() {
  const [params, setParams] = useState({
    Lx: 10.0,
    Ly: 10.0,
    Nx: 40,
    Ny: 40,
    m_rel: 1.0,
    V_type: 'quantum_dot',
    n_levels: 4,
    V_params: { depth: 10.0, radius: 3.0 }
  })
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeLevel, setActiveLevel] = useState(0)

  const fetchSimulation = async () => {
    setLoading(true)
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/solve_2d', params)
      setData(res.data)
      setActiveLevel(0)
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
    const { x, y, wavefunctions, energies } = data
    const psi = wavefunctions[activeLevel]
    
    // Convert 2D wavefunctions to 2D probability density |psi|^2
    const z_data = psi.map(row => row.map(val => val * val))

    return (
      <Plot
        data={[
          {
            z: z_data,
            x: x,
            y: y,
            type: 'surface',
            colorscale: 'Viridis',
            showscale: false
          }
        ]}
        layout={{
          title: `State n=${activeLevel} (E=${energies[activeLevel].toFixed(4)} eV)`,
          template: 'plotly_dark',
          paper_bgcolor: 'transparent',
          scene: {
            xaxis: { title: 'X (nm)', color: '#E2E8F0', gridcolor: '#1E293B' },
            yaxis: { title: 'Y (nm)', color: '#E2E8F0', gridcolor: '#1E293B' },
            zaxis: { title: '|ψ|²', color: '#E2E8F0', gridcolor: '#1E293B' },
            bgcolor: 'transparent'
          },
          margin: { l: 0, r: 0, t: 80, b: 0 },
          font: { color: '#E2E8F0', family: 'Inter' }
        }}
        useResizeHandler
        className="w-full h-[600px]"
      />
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-bold">2D Schrödinger Solver</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        <div className="lg:col-span-1 bg-surfaceHighlight border border-white/10 p-6 rounded-2xl space-y-6">
          <h3 className="font-semibold text-neonPurple uppercase tracking-wider text-sm mb-4">Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-textMuted mb-1">Potential Setup</label>
              <select 
                value={params.V_type}
                onChange={e => setParams({...params, V_type: e.target.value})}
                className="w-full bg-surface border border-white/10 rounded-lg p-2 text-sm focus:border-neonPurple focus:outline-none"
              >
                <option value="infinite_well">2D Infinite Well</option>
                <option value="quantum_dot">Quantum Dot (Circular)</option>
              </select>
            </div>
            
            {params.V_type === 'quantum_dot' && (
              <>
                <div>
                  <label className="block text-xs text-textMuted mb-1">Dot Radius (nm): {params.V_params.radius}</label>
                  <input type="range" min="1" max="10" step="0.5" value={params.V_params.radius} onChange={e => setParams({...params, V_params: {...params.V_params, radius: parseFloat(e.target.value)}})} className="w-full" />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-textMuted mb-1">Grid Resolution: {params.Nx}x{params.Nx}</label>
              <input type="range" min="20" max="60" step="5" value={params.Nx} onChange={e => setParams({...params, Nx: parseInt(e.target.value), Ny: parseInt(e.target.value)})} className="w-full" />
            </div>

            <button 
              onClick={fetchSimulation}
              disabled={loading}
              className="w-full bg-neonPurple/20 text-neonPurple border border-neonPurple/50 hover:bg-neonPurple hover:text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {loading ? 'Computing...' : 'Solve Map'}
            </button>
          </div>
          
          {data && (
            <div className="pt-4 border-t border-white/10">
              <label className="block text-xs text-textMuted mb-2">View Energy Level</label>
              <div className="flex flex-wrap gap-2">
                {data.energies.map((E, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveLevel(i)}
                    className={`px-3 py-1 text-sm rounded ${activeLevel === i ? 'bg-neonPurple text-white' : 'bg-surface border border-white/10 hover:border-white/30 text-textMuted'}`}
                  >
                    n={i}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-3 bg-surface border border-white/5 p-4 rounded-2xl shadow-xl">
           {renderPlot()}
        </div>
      </div>
    </div>
  )
}
