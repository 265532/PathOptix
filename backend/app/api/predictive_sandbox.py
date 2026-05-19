from fastapi import APIRouter, Query

from app.schemas.sandbox import PredictionTimeData
from app.services.predictive_sandbox import get_prediction_for_offset

# [DEMO MODE] 鉴权已禁用 — 所有接口允许匿名访问
router = APIRouter(prefix="/predictive-sandbox", tags=["predictive-sandbox"])


@router.get("")
async def get_predictive_data(
    offset_hours: int = Query(0, ge=0, le=72),
) -> PredictionTimeData:
    """根据未来时间偏移量，返回对应的风险预测与 PPO 防御策略数据。"""
    return get_prediction_for_offset(offset_hours)
