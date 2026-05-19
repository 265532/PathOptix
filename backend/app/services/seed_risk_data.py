"""
seed_risk_data.py - 向数据库注入全球供应链风险与不可抗力预警种子数据
"""
from sqlalchemy.orm import Session
from app.models.risk import IntelligenceNews, RiskMetrics, DispatchLog
from app.models.database import SessionLocal, engine, Base


def seed_risk_data():
    """创建表并注入种子数据。"""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 如果已有数据则跳过
        if db.query(IntelligenceNews).count() > 0:
            print("[seed] 风险数据已存在，跳过注入")
            return

        # === 突发情报 ===
        news_items = [
            IntelligenceNews(
                title="红海海域航线受阻预警：胡塞武装持续袭击商船，多条亚欧航线被迫绕行好望角",
                risk_level="CRITICAL",
                region="中东/红海",
                timestamp="2024-03-24 08:30",
            ),
            IntelligenceNews(
                title="鹿特丹港口工人罢工：ECT 码头全面停工，预计影响 40% 欧洲到港货物",
                risk_level="HIGH",
                region="欧洲/鹿特丹",
                timestamp="2024-03-24 06:15",
            ),
            IntelligenceNews(
                title="台风「海葵」影响华东港口：上海港、宁波港部分泊位暂停作业",
                risk_level="HIGH",
                region="东亚/华东",
                timestamp="2024-03-23 22:00",
            ),
            IntelligenceNews(
                title="巴拿马运河水位持续下降：通行量削减 30%，亚美航线运费上涨",
                risk_level="MODERATE",
                region="中美洲/巴拿马",
                timestamp="2024-03-23 14:45",
            ),
        ]
        db.add_all(news_items)

        # === 全球风险指标 ===
        metrics = RiskMetrics(
            congestion_index=78.5,
            weather_disruption=62.3,
            patency_rate=54.2,
            affected_routes=23,
            updated_at="2024-03-24 09:00",
        )
        db.add(metrics)

        # === 调度日志 ===
        log_items = [
            DispatchLog(
                order_id="CN82991022",
                trigger_event="红海航线受阻",
                ai_action="PPO 引擎生成备选方案：截断转空运法兰克福",
                status="EXECUTED",
                timestamp="2024-03-24 08:35",
            ),
            DispatchLog(
                order_id="CN77218841",
                trigger_event="鹿特丹港口罢工",
                ai_action="自动切换至汉堡港卸货，调整陆运最后一公里",
                status="EXECUTED",
                timestamp="2024-03-24 06:20",
            ),
            DispatchLog(
                order_id="CN65432100",
                trigger_event="台风海葵预警",
                ai_action="延后出港 48h，启用深圳蛇口备用码头",
                status="PENDING",
                timestamp="2024-03-23 22:10",
            ),
            DispatchLog(
                order_id="CN11223344",
                trigger_event="巴拿马运河限行",
                ai_action="评估苏伊士运河替代方案，成本增加 $180",
                status="PENDING",
                timestamp="2024-03-23 15:00",
            ),
        ]
        db.add_all(log_items)

        db.commit()
        print("[seed] 风险预警种子数据注入成功")
    except Exception as e:
        db.rollback()
        print(f"[seed] 注入失败: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_risk_data()
