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

    if existing_count > 0:
        db.query(Order).delete()
        db.commit()
        print(f"已清空原有订单数据")

    for order_data in orders_data:
        order = Order(**order_data)
        db.add(order)

    db.commit()
    print(f"成功添加 {len(orders_data)} 条订单记录到数据库")
finally:
    db.close()