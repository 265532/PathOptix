"""predictive_sandbox service — 风险预测沙盒数据与偏移匹配。"""

from app.schemas.sandbox import RiskRadar, PreemptiveAction, PredictionTimeData

# ---------- 时序种子数据（完整剧本） ----------

_TIME_SEED = {
    0: PredictionTimeData(
        offset_hours=0,
        label="现在 (T+0h)",
        narrative="当前全球航线运行平稳。东海区域检测到微弱气压异常，PPO 引擎处于低频监控模式。",
        risks=[
            RiskRadar(id="r0-1", hazard_type="气压异常", probability=8,
                      impact_region="东海 / 台湾海峡北侧", estimated_loss="—",
                      severity="LOW"),
            RiskRadar(id="r0-2", hazard_type="港口拥堵", probability=15,
                      impact_region="鹿特丹港", estimated_loss="$12,000/日",
                      severity="LOW"),
        ],
        actions=[
            PreemptiveAction(id="a0-1", target_order="#CN82991022",
                             strategy="PPO 引擎保持低频监控，每 6h 扫描一次东海气压梯度",
                             cost_saved="—", status="QUEUED"),
        ],
    ),
    24: PredictionTimeData(
        offset_hours=24,
        label="+24 小时 (T+24h)",
        narrative="东海气压梯度加速下降，热带低压生成概率升至 60%。台湾海峡海况恶化预警已发布。PPO 引擎切换为高频监控模式。",
        risks=[
            RiskRadar(id="r24-1", hazard_type="台风预警", probability=60,
                      impact_region="台湾海峡 / 福建沿海", estimated_loss="$380,000",
                      severity="HIGH"),
            RiskRadar(id="r24-2", hazard_type="港口拥堵", probability=35,
                      impact_region="上海港 / 宁波港", estimated_loss="$95,000/日",
                      severity="MODERATE"),
            RiskRadar(id="r24-3", hazard_type="航线中断", probability=20,
                      impact_region="深圳 → 洛杉矶海运线", estimated_loss="$210,000",
                      severity="MODERATE"),
        ],
        actions=[
            PreemptiveAction(id="a24-1", target_order="#CN77218841",
                             strategy="检测到台湾海峡 24h 后通航概率仅 40%，已启动备选航线评估：经巴士海峡绕行",
                             cost_saved="$28,000", status="QUEUED"),
            PreemptiveAction(id="a24-2", target_order="#CN65432100",
                             strategy="建议将原定 48h 后离港的 12 标箱提前至 12h 内出港，避开台风窗口",
                             cost_saved="$15,000", status="QUEUED"),
        ],
    ),
    48: PredictionTimeData(
        offset_hours=48,
        label="+48 小时 (T+48h)",
        narrative="热带气旋已加强为强台风（中心风速 45m/s），路径锁定台湾海峡。PPO 引擎已执行 3 条主动防御策略，保护 47 标箱货物安全转移。",
        risks=[
            RiskRadar(id="r48-1", hazard_type="台风", probability=95,
                      impact_region="台湾海峡全线", estimated_loss="$1,200,000",
                      severity="CRITICAL"),
            RiskRadar(id="r48-2", hazard_type="港口停摆", probability=90,
                      impact_region="厦门港 / 福州港", estimated_loss="$450,000/日",
                      severity="CRITICAL"),
            RiskRadar(id="r48-3", hazard_type="航线中断", probability=88,
                      impact_region="所有东亚→北美西海岸航线", estimated_loss="$2,800,000",
                      severity="CRITICAL"),
            RiskRadar(id="r48-4", hazard_type="港口拥堵", probability=70,
                      impact_region="釜山港（替代航线集散）", estimated_loss="$180,000/日",
                      severity="HIGH"),
        ],
        actions=[
            PreemptiveAction(id="a48-1", target_order="#CN82991022",
                             strategy="已将 20 标箱从厦门港提前转储至釜山港，48h 后台风到达时货物已安全",
                             cost_saved="$340,000", status="COMPLETED"),
            PreemptiveAction(id="a48-2", target_order="#CN77218841",
                             strategy="经巴士海峡绕行方案已激活，航程增加 1.2 天但规避台风核心区",
                             cost_saved="$195,000", status="EXECUTING"),
            PreemptiveAction(id="a48-3", target_order="#CN65432100",
                             strategy="12 标箱已提前 36h 离港，预计台风到达前 24h 抵达目的港",
                             cost_saved="$87,000", status="COMPLETED"),
            PreemptiveAction(id="a48-4", target_order="#CN11223344",
                             strategy="PPO 建议将空运货物改签至台风影响较小的周三航班",
                             cost_saved="$12,000", status="QUEUED"),
        ],
    ),
    72: PredictionTimeData(
        offset_hours=72,
        label="+72 小时 (T+72h)",
        narrative="强台风在福建沿海登陆，台湾海峡全面封航。但所有受保护订单已提前完成转移或绕行。PPO 主动防御引擎本轮响应挽回损失约 $634,000。",
        risks=[
            RiskRadar(id="r72-1", hazard_type="台风登陆", probability=99,
                      impact_region="福建沿海 / 台湾西部", estimated_loss="$5,600,000",
                      severity="CRITICAL"),
            RiskRadar(id="r72-2", hazard_type="港口停摆", probability=98,
                      impact_region="厦门港 / 福州港 / 台中港", estimated_loss="$1,200,000/日",
                      severity="CRITICAL"),
            RiskRadar(id="r72-3", hazard_type="航线中断", probability=97,
                      impact_region="东亚近海所有航线", estimated_loss="$8,400,000",
                      severity="CRITICAL"),
            RiskRadar(id="r72-4", hazard_type="陆运中断", probability=60,
                      impact_region="福建 / 浙江南部高速公路", estimated_loss="$320,000",
                      severity="HIGH"),
            RiskRadar(id="r72-5", hazard_type="港口拥堵", probability=85,
                      impact_region="釜山港 / 东京港（替代集散）", estimated_loss="$520,000/日",
                      severity="HIGH"),
        ],
        actions=[
            PreemptiveAction(id="a72-1", target_order="#CN82991022",
                             strategy="20 标箱已安全抵达目的港（釜山中转），提前 48h 完成撤离",
                             cost_saved="$340,000", status="COMPLETED"),
            PreemptiveAction(id="a72-2", target_order="#CN77218841",
                             strategy="巴士海峡绕行船舶已通过台风影响区，预计延误 0.8 天",
                             cost_saved="$195,000", status="COMPLETED"),
            PreemptiveAction(id="a72-3", target_order="#CN65432100",
                             strategy="12 标箱已于 T+12h 安全到港，台风路径未影响",
                             cost_saved="$87,000", status="COMPLETED"),
            PreemptiveAction(id="a72-4", target_order="#CN11223344",
                             strategy="空运货物已改签至周三航班，避开台风登陆日",
                             cost_saved="$12,000", status="COMPLETED"),
        ],
    ),
}


def get_prediction_for_offset(offset_hours: int) -> PredictionTimeData:
    """根据未来时间偏移量，返回最近预设时间点的预测数据。"""
    valid_offsets = sorted(_TIME_SEED.keys())
    closest = min(valid_offsets, key=lambda t: abs(t - offset_hours))
    return _TIME_SEED[closest]
