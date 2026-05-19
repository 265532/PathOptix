from pydantic import BaseModel
from typing import List


class OrderResponse(BaseModel):
    id: str
    customer_name: str
    date: str
    amount: str
    status: str
    status_color: str

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    id: str
    customer_name: str
    date: str
    amount: str
    status: str
    status_color: str


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int


class MatchCapacityResponse(BaseModel):
    success: bool
    matched: bool


class CapacityAnalysisResponse(BaseModel):
    capacity: float
    utilization: float


class CarbonEmissionResponse(BaseModel):
    carbon: float
    unit: str
