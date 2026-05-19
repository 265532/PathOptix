from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.schemas.risk import RiskDashboardResponse
from app.services.risk_dashboard import get_risk_dashboard

# [DEMO MODE] 鉴权已禁用 — 所有接口允许匿名访问
router = APIRouter(prefix="/dashboard", tags=["risk-dashboard"])


@router.get("/risk-metrics", response_model=RiskDashboardResponse)
async def get_risk_dashboard_endpoint(
    db: Session = Depends(get_db),
):
    """返回全球供应链风险与不可抗力预警中心的完整看板数据。"""
    return get_risk_dashboard(db)
