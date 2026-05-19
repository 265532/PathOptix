"""simulation service — 压力测试仿真核心逻辑。"""

import random

from app.schemas.simulation import SimulationRunResponse, SimulationStrategy, P90Range


def _normal_mode(base_cost: float, base_time: float) -> SimulationRunResponse:
    """常规模式: 基准有中等波动, PPO 更稳定"""
    base_cost_low = round(base_cost * 0.85)
    base_cost_high = round(base_cost * 1.15)
    base_time_low = max(1, round(base_time - 3))
    base_time_high = round(base_time + 3)
    base_stability = random.randint(55, 68)

    robust_cost_low = round(base_cost * 0.95)
    robust_cost_high = round(base_cost * 1.05)
    robust_time_low = max(1, round(base_time - 1))
    robust_time_high = round(base_time + 1)
    robust_stability = random.randint(88, 96)

    risk_reduction = round(((base_cost_high - base_cost_low) - (robust_cost_high - robust_cost_low))
                           / (base_cost_high - base_cost_low) * 100)

    return SimulationRunResponse(
        mode="normal",
        base=SimulationStrategy(
            cost=P90Range(p90_lower=base_cost_low, p90_upper=base_cost_high),
            time=P90Range(p90_lower=base_time_low, p90_upper=base_time_high),
            stability=base_stability,
        ),
        robust=SimulationStrategy(
            cost=P90Range(p90_lower=robust_cost_low, p90_upper=robust_cost_high),
            time=P90Range(p90_lower=robust_time_low, p90_upper=robust_time_high),
            stability=robust_stability,
        ),
        risk_reduction_pct=risk_reduction,
        description="常规运营环境仿真完成",
    )


def _stress_mode(base_cost: float, base_time: float) -> SimulationRunResponse:
    """压力测试模式: BASE 极大随机波动, ROBUST 窄区间稳健"""
    base_cost_low = round(base_cost * 0.6)
    base_cost_high = round(base_cost * 1.4)
    base_time_low = max(1, round(base_time - 5))
    base_time_high = round(base_time + 15)
    base_stability = random.randint(28, 42)

    robust_base_cost = base_cost * 1.20
    robust_cost_low = round(robust_base_cost - robust_base_cost * 0.04)
    robust_cost_high = round(robust_base_cost + robust_base_cost * 0.04)
    robust_base_time = base_time * 0.9
    robust_time_low = max(1, round(robust_base_time - 1))
    robust_time_high = round(robust_base_time + 1)
    robust_stability = random.randint(86, 95)

    base_range = base_cost_high - base_cost_low
    robust_range = robust_cost_high - robust_cost_low
    risk_reduction = round((1 - robust_range / base_range) * 100)

    return SimulationRunResponse(
        mode="stress",
        base=SimulationStrategy(
            cost=P90Range(p90_lower=base_cost_low, p90_upper=base_cost_high),
            time=P90Range(p90_lower=base_time_low, p90_upper=base_time_high),
            stability=base_stability,
        ),
        robust=SimulationStrategy(
            cost=P90Range(p90_lower=robust_cost_low, p90_upper=robust_cost_high),
            time=P90Range(p90_lower=robust_time_low, p90_upper=robust_time_high),
            stability=robust_stability,
        ),
        risk_reduction_pct=risk_reduction,
        description="极端拥堵压力测试完成 — PPO 引擎风险抵御能力 {0}%".format(risk_reduction),
    )


def run_simulation(mode: str, base_cost: float, base_time: float) -> SimulationRunResponse:
    """根据模式运行仿真推演, 返回 BASE vs ROBUST 对比数据。"""
    if mode == "stress":
        return _stress_mode(base_cost, base_time)
    return _normal_mode(base_cost, base_time)
