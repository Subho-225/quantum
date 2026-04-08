from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional

from solvers.solver_1d import solve_1d_tise
from solvers.solver_2d import solve_2d_tise
from solvers.tunneling import solve_tunneling
from solvers.mosfet import solve_mosfet

app = FastAPI(title="QuantumLab Pro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TISE1DRequest(BaseModel):
    Lx: float = 10.0
    Nx: int = 500
    m_rel: float = 1.0
    V_type: str = "infinite_well"
    V_params: Optional[Dict[str, Any]] = None
    n_levels: int = 5

class TISE2DRequest(BaseModel):
    Lx: float = 10.0
    Ly: float = 10.0
    Nx: int = 40
    Ny: int = 40
    m_rel: float = 1.0
    V_type: str = "infinite_well"
    V_params: Optional[Dict[str, Any]] = None
    n_levels: int = 4

class TunnelingRequest(BaseModel):
    Lx: float = 20.0
    Nx: int = 300
    m_rel: float = 1.0
    barrier_width: float = 1.0
    barrier_height: float = 2.0
    E_initial: float = 1.0
    wave_packet_width: float = 1.0
    x0: float = 5.0
    dt: float = 0.1
    num_frames: int = 60
    steps_per_frame: int = 8

class MosfetRequest(BaseModel):
    Lx: float = 10.0
    Nx: int = 500
    m_rel: float = 0.2
    F: float = 0.5
    V_oxide: float = 5.0
    oxide_thickness: float = 2.0
    n_levels: int = 5

@app.post("/api/solve_1d")
def solve_1d(req: TISE1DRequest):
    return solve_1d_tise(**req.dict())

@app.post("/api/solve_2d")
def solve_2d(req: TISE2DRequest):
    return solve_2d_tise(**req.dict())

@app.post("/api/solve_tunneling")
def solve_tunn(req: TunnelingRequest):
    return solve_tunneling(**req.dict())

@app.post("/api/solve_mosfet")
def solve_mosf(req: MosfetRequest):
    return solve_mosfet(**req.dict())
