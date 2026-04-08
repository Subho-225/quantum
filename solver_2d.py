import numpy as np
import scipy.sparse as sp
from scipy.sparse.linalg import eigsh

HBAR2_2M = 0.0380998  # eV * nm^2

def generate_potential_2d(Nx, Ny, x, y, V_type, V_params):
    V = np.zeros((Nx, Ny))
    X, Y = np.meshgrid(x, y, indexing='ij')
    
    if V_type == "infinite_well":
        pass
    elif V_type == "quantum_dot":
        radius = V_params.get("radius", 2.0)
        depth = V_params.get("depth", 1.0)
        cx = x[0] + (x[-1] - x[0]) / 2
        cy = y[0] + (y[-1] - y[0]) / 2
        V = np.where((X - cx)**2 + (Y - cy)**2 > radius**2, depth, 0.0)
    elif V_type == "custom":
        V = np.array(V_params.get("V_array", np.zeros((Nx, Ny))))
    return V

def solve_2d_tise(Lx=10.0, Ly=10.0, Nx=50, Ny=50, m_rel=1.0, V_type="infinite_well", V_params=None, n_levels=5):
    if V_params is None:
        V_params = {}
        
    x = np.linspace(0, Lx, Nx)
    y = np.linspace(0, Ly, Ny)
    dx = x[1] - x[0]
    dy = y[1] - y[0]
    
    V_2d = generate_potential_2d(Nx, Ny, x, y, V_type, V_params)
    V_1d = V_2d.flatten() # Flattens in row-major (C-style)
    
    coeff_x = HBAR2_2M / (m_rel * dx**2)
    coeff_y = HBAR2_2M / (m_rel * dy**2)
    
    # 1D 2nd derivative operators
    D2x = sp.diags([-1, 2, -1], [-1, 0, 1], shape=(Nx, Nx))
    D2y = sp.diags([-1, 2, -1], [-1, 0, 1], shape=(Ny, Ny))
    
    # 2D Laplacian using discrete kronecker sum: I_y \otimes D2x + D2y \otimes I_x
    # Depending on flatten order. If we flatten as V.flatten(), it's like (Nx, Ny)
    # The slow axis is x, fast axis is y.
    Ix = sp.eye(Nx)
    Iy = sp.eye(Ny)
    
    # T = coeff_x * (D2x \otimes Iy) + coeff_y * (Ix \otimes D2y)
    T = coeff_x * sp.kron(D2x, Iy) + coeff_y * sp.kron(Ix, D2y)
    
    # Add potential
    H = T + sp.diags(V_1d, 0)
    
    # Solve for smallest algebraic eigenvalues
    eigvals, eigvecs = eigsh(H, k=n_levels, which='SA')
    
    wavefunctions = []
    energies = []
    
    for i in range(min(n_levels, len(eigvals))):
        psi = eigvecs[:, i].reshape((Nx, Ny))
        # Normalize
        norm = np.sqrt(np.trapz(np.trapz(np.abs(psi)**2, y), x))
        psi_norm = psi / norm
        wavefunctions.append(psi_norm.tolist())
        energies.append(float(eigvals[i]))
        
    return {
        "x": x.tolist(),
        "y": y.tolist(),
        "V": V_2d.tolist(),
        "energies": energies,
        "wavefunctions": wavefunctions
    }
