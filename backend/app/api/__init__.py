from fastapi import APIRouter
from app.api import auth, chat, order, optimization, risk_dashboard, risk_graph, predictive_sandbox, simulation

# 创建主路由
router = APIRouter()

# 包含认证路由
router.include_router(auth.router)
# 包含聊天路由
router.include_router(chat.router)
# 包含订单路由
router.include_router(order.router)
# 包含 AI 路径优化路由
router.include_router(optimization.router)
# 包含全球供应链风险看板路由
router.include_router(risk_dashboard.router)
# 包含风险知识图谱路由
router.include_router(risk_graph.router)
# 包含未来态沙盘推演与主动防御引擎路由
router.include_router(predictive_sandbox.router)
# 包含仿真推演路由
router.include_router(simulation.router)
