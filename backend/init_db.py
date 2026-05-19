"""初始化数据库，创建所有表结构"""
from app.models.database import engine, Base
from app.models.user import User

print("正在初始化数据库...")

# 创建所有表
Base.metadata.create_all(bind=engine)

print("数据库初始化完成！")
print("表结构已创建成功。")
