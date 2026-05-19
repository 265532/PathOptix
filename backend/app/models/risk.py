from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql.expression import text
from app.models.database import Base


class IntelligenceNews(Base):
    __tablename__ = "intelligence_news"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)  # CRITICAL / HIGH / MODERATE
    region = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))


class RiskMetrics(Base):
    __tablename__ = "risk_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    congestion_index = Column(Float, nullable=False)
    weather_disruption = Column(Float, nullable=False)
    patency_rate = Column(Float, nullable=False)
    affected_routes = Column(Integer, nullable=False)
    updated_at = Column(String, nullable=False)


class DispatchLog(Base):
    __tablename__ = "dispatch_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String, nullable=False)
    trigger_event = Column(String, nullable=False)
    ai_action = Column(String, nullable=False)
    status = Column(String, nullable=False)  # EXECUTED / PENDING / FAILED
    timestamp = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
