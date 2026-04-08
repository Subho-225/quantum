import numpy as np
from scipy.linalg import eigh_tridiagonal

HBAR2_2M = 0.0380998  # eV * nm^2 (for m = 1 electron mass)

def generate_potential_1d(Nx, x, V_type, V_params):
    V = np.zeros(Nx)
    if V_type == "infinite_well":
        pass  # V=0 inside, infinite at boundaries is handled by Dirichlet BCs
    elif V_type == "finite_well":
        depth = V_params.get("depth", 1.0) # eV
        width = V_params.get("width", 2.0) # nm
        center = x[0] + (x[-1] - x[0])/2
        V = np.where(np.abs(x - center) > width/2, depth, 0.0)
    elif V_type == "harmonic":
        omega = V_params.get("omega", 1.0) # eV/nm^2 equivalent
        center = x[0] + (x[-1] - x[0])/2
        V = 0.5 * omega * (x - center)**2
    elif V_type == "custom":
        V = np.array(V_params.get("V_array", np.zeros(Nx)))
    return V

def solve_1d_tise(Lx=10.0, Nx=500, m_rel=1.0, V_type="infinite_well", V_params=None, n_levels=5):
    if V_params is None:
        V_params = {}
    
    x = np.linspace(0, Lx, Nx)
    dx = x[1] - x[0]
    
    V = generate_potential_1d(Nx, x, V_type, V_params)
    
    # Kinetic energy matrix (Tridiagonal)
    # T = - (HBAR2_2M / m_rel) * laplacian
    coeff = HBAR2_2M / (m_rel * dx**2)
    
    d = 2.0 * coeff * np.ones(Nx) + V
    e = -coeff * np.ones(Nx - 1)
    
    # Solve eigenvalue problem
    eigvals, eigvecs = eigh_tridiagonal(d, e, select='v', select_range=( -np.inf, np.inf ))
    
    # Normalize wavefunctions (int |psi|^2 dx = 1)
    # eigvecs are columns.
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
