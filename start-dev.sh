#!/bin/bash

# 健康提醒助手 - 开发启动脚本

cd "$(dirname "$0")"

echo "🔨 编译主进程..."
./node_modules/.bin/tsc -p tsconfig.main.json

if [ $? -ne 0 ]; then
  echo "❌ 主进程编译失败"
  exit 1
fi

echo "✅ 主进程编译成功"
echo "🚀 启动开发服务器..."

# 启动 Vite
./node_modules/.bin/vite &
VITE_PID=$!

# 等待 Vite 启动
sleep 3

# 启动 Electron
ELECTRON_RUN_AS_NODE= VITE_DEV_SERVER_URL=http://localhost:5173 ./node_modules/.bin/electron . &
ELECTRON_PID=$!

echo "✅ 应用已启动"
echo "   Vite PID: $VITE_PID"
echo "   Electron PID: $ELECTRON_PID"
echo ""
echo "按 Ctrl+C 停止..."

# 捕获 Ctrl+C
trap "kill $VITE_PID $ELECTRON_PID 2>/dev/null; exit" INT TERM

# 等待
wait
