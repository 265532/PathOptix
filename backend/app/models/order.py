from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql.expression import text
from app.models.database import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    amount = Column(String, nullable=False)
    status = Column(String, nullable=False)
    status_color = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), onupdate=text('CURRENT_TIMESTAMP'))
