"""
optimization.py - AI 路径优化 API 路由
封装 xrl_workflow 工作流，提供 REST 接口
"""

import traceback

from fastapi import APIRouter, HTTPException

from app.services.ai import run_logistics_pipeline
from app.schemas.optimization import RouteRequest

# [DEMO MODE] 鉴权已禁用 — 所有接口允许匿名访问
router = APIRouter(prefix="/optimize", tags=["路径优化"])


@router.post("/route")
async def optimize_route(
    req: RouteRequest,
):
    """
    接收起点终点和权重偏好，返回 RL 最优路径 + LLM 解释报告。
    """
    try:
        result = await run_logistics_pipeline(
            start_node=req.start_node,
            end_node=req.end_node,
            w1=req.weight_cost,
            w2=req.weight_time,
            w3=req.weight_carbon,
        )
        return {"code": 0, "msg": "success", "data": result}
    except Exception:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail={"code": -1, "msg": "路径规划失败", "error": traceback.format_exc()},
        )
