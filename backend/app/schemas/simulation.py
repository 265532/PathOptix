from pydantic import BaseModel, Field
from typing import Optional


class SimulationRunRequest(BaseModel):
    mode: str = Field("normal", description="仿真模式: normal | stress")
    rl_cost: Optional[float] = Field(None, description="RL 路径总成本 (USD)")
    rl_time: Optional[float] = Field(None, description="RL 路径总时效 (天)")
    rl_carbon: Optional[float] = Field(None, description="RL 路径总碳排 (kg)")


class P90Range(BaseModel):
    p90_lower: float
    p90_upper: float


class SimulationStrategy(BaseModel):
    cost: P90Range
    time: P90Range
    stability: int


class SimulationRunResponse(BaseModel):
    mode: str
    base: SimulationStrategy
    robust: SimulationStrategy
    risk_reduction_pct: int
    description: str
