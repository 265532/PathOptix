from pydantic import BaseModel
from typing import List


class RiskRadar(BaseModel):
    id: str
    hazard_type: str       # 台风 / 港口拥堵 / 航线中断 / 气压异常
    probability: float     # 0-100
    impact_region: str
    estimated_loss: str
    severity: str          # LOW / MODERATE / HIGH / CRITICAL


class PreemptiveAction(BaseModel):
    id: str
    target_order: str
    strategy: str
    cost_saved: str
    status: str            # QUEUED / EXECUTING / COMPLETED


class PredictionTimeData(BaseModel):
    offset_hours: int
    label: str
    narrative: str
    risks: List[RiskRadar]
    actions: List[PreemptiveAction]
