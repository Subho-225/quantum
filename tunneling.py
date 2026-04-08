import numpy as np
import scipy.sparse as sparse
from scipy.sparse.linalg import spsolve

HBAR_EV_FS = 0.6582
HBAR2_2M = 0.0380998  # eV * nm^2

def solve_tunneling(Lx=20.0, Nx=400, m_rel=1.0, 
                    barrier_width=1.0, barrier_height=2.0, 
                    E_initial=1.0, wave_packet_width=1.0, x0=5.0, 
                    dt=0.1, num_frames=100, steps_per_frame=5):
    
    x = np.linspace(0, Lx, Nx)
    dx = x[1] - x[0]
    
    center = Lx / 2.0
    V = np.where(np.abs(x - center) <= barrier_width/2, barrier_height, 0.0)
    
    k0 = np.sqrt(E_initial * m_rel / HBAR2_2M)
    sigma = wave_packet_width
    psi = (1/(sigma * np.sqrt(2*np.pi)))**0.5 * np.exp(-0.25 * ((x - x0)/sigma)**2) * np.exp(1j * k0 * x)
    
    norm = np.sqrt(np.trapz(np.abs(psi)**2, x))
    psi = psi / norm
    
    coeff = HBAR2_2M / (m_rel * dx**2)
    main_diag = 2.0 * coeff + V
    off_diag = -coeff * np.ones(Nx - 1)
    
    H = sparse.diags([off_diag, main_diag, off_diag], [-1, 0, 1], format='csc')
    
    I = sparse.eye(Nx, format='csc')
    A = I + (0.5j * dt / HBAR_EV_FS) * H
    B = I - (0.5j * dt / HBAR_EV_FS) * H
    
    frames = []
    
    for _ in range(num_frames):
        frames.append({
            "prob": (np.abs(psi)**2).tolist()
        })
        for _ in range(steps_per_frame):
            vec = B.dot(psi)
            psi = spsolve(A, vec)
            
    # Calculate transmission and reflection based on the final frame
    packet_end_prob = np.abs(psi)**2
    mid_idx = int(Nx/2)
    transmission = float(np.trapz(packet_end_prob[mid_idx:], x[mid_idx:]))
    reflection = float(np.trapz(packet_end_prob[:mid_idx], x[:mid_idx]))
    
    return {
        "x": x.tolist(),
        "V": V.tolist(),
        "frames": frames,
        "transmission": transmission,
        "reflection": reflection
    }
