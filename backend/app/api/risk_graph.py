from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.schemas.risk import GraphResponse
from app.services.risk_graph import build_risk_graph

# [DEMO MODE] 鉴权已禁用 — 所有接口允许匿名访问
router = APIRouter(prefix="/graph", tags=["risk-graph"])


@router.get("/risk-trace", response_model=GraphResponse)
async def get_risk_trace(
    db: Session = Depends(get_db),
):
    """返回物流风险知识图谱数据：节点 + 关联三元组。"""
    return build_risk_graph(db)
