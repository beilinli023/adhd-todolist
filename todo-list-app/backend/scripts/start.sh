#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 MongoDB 是否运行
check_mongodb() {
    echo -e "${YELLOW}检查 MongoDB 状态...${NC}"
    if ! docker ps | grep -q todo-list-mongodb; then
        echo -e "${YELLOW}MongoDB 未运行，正在启动...${NC}"
        docker start todo-list-mongodb || docker run -d --name todo-list-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo
    fi
    echo -e "${GREEN}MongoDB 已就绪${NC}"
}

# 清理旧进程
cleanup_processes() {
    echo -e "${YELLOW}清理旧进程...${NC}"
    # 查找并终止所有 ts-node-dev 进程
    if pgrep -f "ts-node-dev" > /dev/null; then
        echo -e "${YELLOW}发现旧进程，正在终止...${NC}"
        pkill -f "ts-node-dev"
        sleep 2
    else
        echo -e "${GREEN}没有发现旧进程${NC}"
    fi
}

# 检查端口占用
check_port() {
    local port=$1
    echo -e "${YELLOW}检查端口 $port...${NC}"
    if lsof -i :$port > /dev/null; then
        echo -e "${RED}端口 $port 已被占用${NC}"
        return 1
    else
        echo -e "${GREEN}端口 $port 可用${NC}"
        return 0
    fi
}

# 主函数
main() {
    echo -e "${GREEN}=== 启动服务器 ===${NC}"
    
    # 检查 MongoDB
    check_mongodb
    
    # 清理旧进程
    cleanup_processes
    
    # 检查默认端口
    if ! check_port 3001; then
        echo -e "${RED}警告: 端口 3001 被占用，应用程序将尝试使用其他端口${NC}"
    fi
    
    # 启动服务
    echo -e "${GREEN}启动后端服务...${NC}"
    npm run dev
}

# 执行主函数
main 