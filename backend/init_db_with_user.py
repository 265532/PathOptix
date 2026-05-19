"""初始化数据库，创建所有表结构并添加测试用户"""
from app.models.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.order import Order
from app.services.auth import get_password_hash

print("正在初始化数据库...")

# 创建所有表
Base.metadata.create_all(bind=engine)

print("表结构已创建成功。")

# 创建数据库会话
db = SessionLocal()

try:
    # 检查是否已存在lorry用户
    existing_user = db.query(User).filter(User.username == "lorry").first()
    
    if existing_user:
        print("用户 'lorry' 已存在，跳过创建。")
    else:
        # 创建测试用户
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
        print("测试用户 'lorry' 已创建成功！")
        print("用户名: lorry")
        print("密码: 123456")
        print("密码已加密存储。")
finally:
    db.close()

print("数据库初始化完成！")
