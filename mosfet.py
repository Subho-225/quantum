import numpy as np
from scipy.linalg import eigh_tridiagonal

HBAR2_2M = 0.0380998  # eV * nm^2

def solve_mosfet(Lx=10.0, Nx=500, m_rel=0.2, F=0.5, V_oxide=5.0, oxide_thickness=2.0, n_levels=5):
    """
    F: Electric field (V/nm = eV/nm for an electron)
    m_rel: effective mass in transverse direction
    Lx: Total domain length from negative oxide to semiconductor depth
    """
    # x goes from -oxide_thickness to (Lx - oxide_thickness)
    x = np.linspace(-oxide_thickness, Lx - oxide_thickness, Nx)
    dx = x[1] - x[0]
    
    # Potential profile
    V = np.zeros(Nx)
    
    # In the oxide (x < 0)
    V[x < 0] = V_oxide
    
    # In the semiconductor (x >= 0), V(x) = e F x = F x (since E in eV)
    V[x >= 0] = F * x[x >= 0]
    
    # Infinite boundary at both ends is implicit
    
    coeff = HBAR2_2M / (m_rel * dx**2)
    d = 2.0 * coeff * np.ones(Nx) + V
    e = -coeff * np.ones(Nx - 1)
    
    eigvals, eigvecs = eigh_tridiagonal(d, e, select='v', select_range=(-np.inf, np.inf))
    
    wavefunctions = []
    energies = []
    
    for i in range(min(n_levels, len(eigvals))):
        psi = eigvecs[:, i]
        norm = np.sqrt(np.trapz(np.abs(psi)**2, x))
        psi_norm = psi / norm
        wavefunctions.append(psi_norm.tolist())
        energies.append(float(eigvals[i]))
        
    return {
        "x": x.tolist(),
        "V": V.tolist(),
        "energies": energies,
        "wavefunctions": wavefunctions
    }
