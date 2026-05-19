from pydantic import BaseModel
from typing import List, Optional


class IntelligenceNewsOut(BaseModel):
    id: int
    title: str
    risk_level: str
    region: str
    timestamp: str

    class Config:
        from_attributes = True


class RiskMetricsOut(BaseModel):
    congestion_index: float
    weather_disruption: float
    patency_rate: float
    affected_routes: int
    updated_at: str

    class Config:
        from_attributes = True


class DispatchLogOut(BaseModel):
    id: int
    order_id: str
    trigger_event: str
    ai_action: str
    status: str
    timestamp: str

    class Config:
        from_attributes = True


class RiskDashboardResponse(BaseModel):
    news: List[IntelligenceNewsOut]
    metrics: Optional[RiskMetricsOut]
    logs: List[DispatchLogOut]


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # event | port | ship | order
    properties: dict = {}


class GraphLink(BaseModel):
    source: str
    target: str
    relationship: str


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]
