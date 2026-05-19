from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.models.database import get_db
from app.schemas.order import OrderResponse, OrderCreate, OrderListResponse, MatchCapacityResponse, CapacityAnalysisResponse, CarbonEmissionResponse
from app.services import order as order_service

# [DEMO MODE] 鉴权已禁用 — 所有接口允许匿名访问
router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=OrderListResponse)
async def get_orders(
    keyword: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return order_service.get_orders(db, keyword, status)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    db: Session = Depends(get_db),
):
    return order_service.get_order_by_id(db, order_id)


@router.post("/", response_model=OrderResponse)
async def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
):
    return order_service.create_order(db, order)


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str,
    order: OrderCreate,
    db: Session = Depends(get_db),
):
    return order_service.update_order(db, order_id, order)


@router.delete("/{order_id}")
async def delete_order(
    order_id: str,
    db: Session = Depends(get_db),
):
    return order_service.delete_order(db, order_id)


@router.post("/{order_id}/match-capacity", response_model=MatchCapacityResponse)
async def match_capacity(
    order_id: str,
    db: Session = Depends(get_db),
):
    return order_service.match_capacity(db, order_id)


@router.get("/{order_id}/capacity-analysis", response_model=CapacityAnalysisResponse)
async def analyze_capacity(
    order_id: str,
    db: Session = Depends(get_db),
):
    return order_service.analyze_capacity(db, order_id)


@router.get("/{order_id}/carbon", response_model=CarbonEmissionResponse)
async def get_carbon_emission(
    order_id: str,
    db: Session = Depends(get_db),
):
    return order_service.get_carbon_emission(db, order_id)
