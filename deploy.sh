#!/bin/bash

# ================ Hexo 自动化部署脚本（hexo01 分支） ================
# 使用方法：在博客根目录下执行 ./deploy.sh "提交信息"
# 如果不提供提交信息，将使用默认的时间戳信息
# ================================================================

# 定义颜色输出
COLOR_RED="\033[31m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_RESET="\033[0m"

# 检查是否提供了提交信息，否则使用默认信息
COMMIT_MSG=${1:-"Auto deploy at $(date +'%Y-%m-%d %H:%M:%S')"}

echo -e "${COLOR_YELLOW}==== 开始 Hexo 博客部署 ====${COLOR_RESET}"

# 步骤0：拉取最新源码（hexo01 分支）
echo -e "${COLOR_GREEN}[0/4] 拉取最新源码...${COLOR_RESET}"
git pull origin hexo01
if [ $? -ne 0 ]; then
    echo -e "${COLOR_RED}拉取源码失败！请手动处理冲突后重试。${COLOR_RESET}"
    exit 1
fi

# 步骤1：清理并生成静态文件
echo -e "${COLOR_GREEN}[1/4] 清理并生成静态文件...${COLOR_RESET}"
hexo clean && hexo generate
if [ $? -ne 0 ]; then
    echo -e "${COLOR_RED}生成静态文件失败！${COLOR_RESET}"
    exit 1
fi

# 步骤2：部署到 GitHub Pages
echo -e "${COLOR_GREEN}[2/4] 部署到 GitHub Pages...${COLOR_RESET}"
hexo deploy
if [ $? -ne 0 ]; then
    echo -e "${COLOR_RED}部署到 GitHub Pages 失败！${COLOR_RESET}"
    exit 1
fi

# 步骤3：提交源码变更到 hexo01 分支
echo -e "${COLOR_GREEN}[3/4] 提交源码变更...${COLOR_RESET}"
git add .
git commit -m "$COMMIT_MSG"
if [ $? -ne 0 ]; then
    echo -e "${COLOR_YELLOW}没有变更需要提交。${COLOR_RESET}"
else
    # 步骤4：推送源码到 GitHub
    echo -e "${COLOR_GREEN}[4/4] 推送源码到 GitHub (hexo01 分支)...${COLOR_RESET}"
    git push origin hexo01
    if [ $? -ne 0 ]; then
        echo -e "${COLOR_RED}推送源码到 GitHub 失败！${COLOR_RESET}"
        exit 1
    fi
fi

echo -e "${COLOR_YELLOW}==== Hexo 博客部署完成 ====${COLOR_RESET}"
echo -e "${COLOR_GREEN}查看博客: https://bodysuperman.github.io${COLOR_RESET}"
echo -e "${COLOR_GREEN}查看源码: https://github.com/BODYsuperman/bodysuperman.github.io/tree/hexo01${COLOR_RESET}"
