@echo off

REM 启动后端服务

REM 检查并安装依赖
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)

echo 激活虚拟环境...
call venv\Scripts\activate.bat

echo 安装依赖...
pip install -r requirements.txt

echo 初始化数据库...
python init_db_with_user.py

echo 启动服务...
python main.py
