import json
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.api import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.models.database import engine, Base, SessionLocal

    print("[DB Init] 开始初始化数据库...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        _init_user(db)
    except Exception as e:
        print(f"[DB Init] 用户初始化异常（不影响启动）: {e}")

    try:
        _init_orders(db)
    except Exception as e:
        print(f"[DB Init] 订单数据初始化异常（不影响启动）: {e}")

    db.close()
    print("[DB Init] 数据库初始化完成，服务就绪")
    yield


def _init_user(db):
    from app.models.user import User
    from app.services.auth import get_password_hash

    existing_user = db.query(User).filter(User.username == "lorry").first()
    if not existing_user:
        hashed_password = get_password_hash("123456")
        test_user = User(
            username="lorry",
            email="lorry@example.com",
            password_hash=hashed_password,
            full_name="Lorry Driver",
            is_active=True,
            is_admin=True
        )
        db.add(test_user)
        db.commit()
        print("[DB Init] 测试用户 'lorry' 已创建（密码: 123456）")
    else:
        print("[DB Init] 用户 'lorry' 已存在，跳过")


def _init_orders(db):
    from app.models.order import Order

    orders_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "orders.json")
    if not os.path.exists(orders_file):
        print(f"[DB Init] orders.json 未找到: {orders_file}")
        return

    with open(orders_file, "r", encoding="utf-8") as f:
        orders_data = json.load(f)

    added = 0
    for order_data in orders_data:
        existing = db.query(Order).filter(Order.id == order_data["id"]).first()
        if not existing:
            db.add(Order(**order_data))
            added += 1

    if added > 0:
        db.commit()
    print(f"[DB Init] 订单数据: 新增 {added} 条（已存在跳过）")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="PathOptix 强化学习路径优化引擎 API",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

app.include_router(api_router, prefix="/api")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir, html=True), name="frontend-static")


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/images/login-bg")
async def get_login_background():
    image_path = os.path.join(static_dir, "img", "login_img.png")
    if os.path.exists(image_path):
        return FileResponse(image_path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Image not found")


@app.get("/api/images/{category}/{filename}")
async def get_image(category: str, filename: str):
    image_path = os.path.join(static_dir, "img", category, filename)
    if os.path.exists(image_path):
        return FileResponse(image_path)
    raise HTTPException(status_code=404, detail="Image not found")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8010))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.DEBUG
    )
