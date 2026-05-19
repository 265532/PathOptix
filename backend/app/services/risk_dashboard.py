"""risk_dashboard service — 风险看板数据组装。"""

from sqlalchemy.orm import Session

from app.models.risk import IntelligenceNews, RiskMetrics, DispatchLog
from app.schemas.risk import (
    IntelligenceNewsOut, RiskMetricsOut, DispatchLogOut, RiskDashboardResponse,
)


def get_risk_dashboard(db: Session) -> RiskDashboardResponse:
    """组装全球供应链风险看板的完整数据。"""
    news = (
        db.query(IntelligenceNews)
        .order_by(IntelligenceNews.id.desc())
        .limit(10)
        .all()
    )
    metrics = (
        db.query(RiskMetrics)
        .order_by(RiskMetrics.id.desc())
        .first()
    )
    logs = (
        db.query(DispatchLog)
        .order_by(DispatchLog.id.desc())
        .limit(10)
        .all()
    )
    return RiskDashboardResponse(
        news=[IntelligenceNewsOut.model_validate(n) for n in news],
        metrics=RiskMetricsOut.model_validate(metrics) if metrics else None,
        logs=[DispatchLogOut.model_validate(l) for l in logs],
    )
