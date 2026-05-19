"""order service — 订单 CRUD 与业务功能封装。"""

from typing import Optional

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.order import Order
from app.schemas.order import OrderCreate


def get_orders(db: Session, keyword: Optional[str] = None, status: Optional[str] = None):
    """查询订单列表，支持关键词和状态过滤。"""
    query = db.query(Order)
    if keyword:
        query = query.filter(
            (Order.id.contains(keyword)) | (Order.customer_name.contains(keyword))
        )
    if status:
        query = query.filter(Order.status == status)
    orders = query.all()
    return {"orders": orders, "total": len(orders)}


def get_order_by_id(db: Session, order_id: str) -> Order:
    """根据 ID 查询订单，不存在抛 404。"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def create_order(db: Session, order_data: OrderCreate) -> Order:
    """创建新订单。"""
    db_order = Order(**order_data.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


def update_order(db: Session, order_id: str, order_data: OrderCreate) -> Order:
    """更新订单信息。"""
    db_order = get_order_by_id(db, order_id)
    for key, value in order_data.model_dump().items():
        setattr(db_order, key, value)
    db.commit()
    db.refresh(db_order)
    return db_order


def delete_order(db: Session, order_id: str) -> dict:
    """删除订单。"""
    db_order = get_order_by_id(db, order_id)
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted successfully"}


def match_capacity(db: Session, order_id: str) -> dict:
    """运力匹配（stub）。"""
    get_order_by_id(db, order_id)
    return {"success": True, "matched": True}


def analyze_capacity(db: Session, order_id: str) -> dict:
    """运力分析（stub）。"""
    get_order_by_id(db, order_id)
    return {"capacity": 100.0, "utilization": 75.5}


def get_carbon_emission(db: Session, order_id: str) -> dict:
    """碳排放查询（stub）。"""
    get_order_by_id(db, order_id)
    return {"carbon": 25.5, "unit": "kg CO2"}
