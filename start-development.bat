@echo off
echo 启动开发环境服务...

echo.
echo [1/3] 检查依赖...
cd backend
if not exist "node_modules" (
    echo 安装后端依赖...
    call npm install
)

cd ../frontend
if not exist "node_modules" (
    echo 安装前端依赖...
    call npm install
)

echo.
echo [2/3] 启动后端开发服务器...
cd ../backend
start "后端服务" cmd /k "npm run dev"

echo.
echo [3/3] 启动前端开发服务器...
cd ../frontend
start "前端服务" cmd /k "npm run dev"

echo.
echo 开发环境启动完成！
echo 前端地址: http://localhost:5176
echo 后端地址: http://localhost:3000
echo 健康检查: http://localhost:3000/api/health

pause
