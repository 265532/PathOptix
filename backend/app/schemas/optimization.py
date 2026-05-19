from pydantic import BaseModel, Field


class RouteRequest(BaseModel):
    start_node: str = Field(..., description="起点节点 ID，如 shenzhen")
    end_node: str = Field(..., description="终点节点 ID，如 new_york")
    weight_cost: float = Field(0.5, ge=0, le=1, description="成本权重")
    weight_time: float = Field(0.3, ge=0, le=1, description="时效权重")
    weight_carbon: float = Field(0.2, ge=0, le=1, description="碳排放权重")
