"""
simulation.py - 压力测试仿真 API
POST /api/simulation/run  返回 BASE vs ROBUST 对比数据
"""

from fastapi import APIRouter

from app.schemas.simulation import SimulationRunRequest
from app.services.simulation import run_simulation

# [DEMO MODE] 鉴权已禁用 — 所有接口允许匿名访问
router = APIRouter(prefix="/simulation", tags=["仿真推演"])


@router.post("/run")
async def run_simulation_endpoint(
    req: SimulationRunRequest,
):
    """
    运行仿真推演, 返回 BASE vs ROBUST 的对比数据。
    mode="normal"  → 常规运营基准
    mode="stress"  → 极端拥堵压力测试
    """
    base_cost = req.rl_cost or 5000.0
    base_time = req.rl_time or 20.0
    return run_simulation(req.mode, base_cost, base_time)
