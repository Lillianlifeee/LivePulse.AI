#!/bin/bash

# 确保脚本退出时清理所有子进程
cleanup() {
    echo "正在关闭所有进程..."
    pkill -f "react-scripts start"
    pkill -f "python app.py"
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 进入项目根目录
cd "$(dirname "$0")"

# 检查并杀死已存在的进程
kill_port() {
    lsof -i :"$1" | awk 'NR!=1 {print $2}' | xargs -r kill -9
}

# 杀死可能占用的端口
kill_port 8200
kill_port 3000

# 激活虚拟环境（如果存在）
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# 安装后端依赖
cd backend
pip install -r requirements.txt
pip install python-socketio fastapi uvicorn python-dotenv deepseek-ai

# 启动后端
python -m uvicorn main:application --reload --port 8200 --host 0.0.0.0 &

# 等待后端启动
sleep 2

# 启动前端
cd ../frontend
npm install  # 安装前端依赖
npm start &

# 等待任意子进程退出
wait

# 清理进程
cleanup

echo "LivePulse 2.AI 已启动!"
echo "后端运行在 http://localhost:8200"
echo "前端运行在 http://localhost:3000" 