import json
from app.models.database import SessionLocal, engine, Base
from app.models.order import Order

Base.metadata.create_all(bind=engine)

with open('orders.json', 'r', encoding='utf-8') as f:
    orders_data = json.load(f)

db = SessionLocal()

try:
    existing_count = db.query(Order).count()
    print(f"当前数据库中有 {existing_count} 条订单记录")

    for order_data in orders_data:
        existing = db.query(Order).filter(Order.id == order_data['id']).first()
        if not existing:
            order = Order(**order_data)
            db.add(order)

    db.commit()
    print(f"成功添加 {len(orders_data)} 条订单记录到数据库")
finally:
    db.close()