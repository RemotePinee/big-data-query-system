@echo off
echo 启动生产环境服务...

echo.
echo [1/4] 检查Node.js版本...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js
    pause
    exit /b 1
)

echo.
echo [2/4] 构建后端...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo 错误: 后端构建失败
    pause
    exit /b 1
)

echo.
echo [3/4] 构建前端...
cd ../frontend
call npm run build
if %errorlevel% neq 0 (
    echo 错误: 前端构建失败
    pause
    exit /b 1
)

echo.
echo [4/4] 启动后端服务...
cd ../backend
call npm start

pause
