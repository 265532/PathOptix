import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# 使用绝对路径，避免 CWD 变化导致找不到数据库文件
_db_url = settings.DATABASE_URL
if _db_url.startswith("sqlite:///") and not os.path.isabs(_db_url.replace("sqlite:///", "")):
    _backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    _rel = _db_url.replace("sqlite:///", "")
    _db_url = "sqlite:///" + os.path.join(_backend_dir, _rel)

engine = create_engine(
    _db_url,
    connect_args={"check_same_thread": False} if "sqlite" in _db_url else {}
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()

# 依赖项：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
