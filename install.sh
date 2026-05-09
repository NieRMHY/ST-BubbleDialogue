#!/usr/bin/env bash
# ST-BubbleDialogue 安装脚本
# 将扩展安装到 SillyTavern 的正确位置

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ST_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

echo "ST-BubbleDialogue 安装脚本"
echo "扩展路径: $SCRIPT_DIR"
echo "ST 根目录: $ST_ROOT"

# 检查是否已在正确位置
EXPECTED_PATH="$ST_ROOT/public/scripts/extensions/third-party/ST-BubbleDialogue"
if [ "$SCRIPT_DIR" != "$EXPECTED_PATH" ]; then
    echo ""
    echo "扩展未安装在标准位置。"
    echo "当前: $SCRIPT_DIR"
    echo "期望: $EXPECTED_PATH"
    echo ""
    read -p "是否创建软链接到标准位置？[y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p "$(dirname "$EXPECTED_PATH")"
        ln -sf "$SCRIPT_DIR" "$EXPECTED_PATH"
        echo "已创建软链接: $EXPECTED_PATH → $SCRIPT_DIR"
    fi
fi

# 安装服务端插件
echo ""
echo "安装服务端同步插件..."
PLUGIN_DIR="$ST_ROOT/plugins/ST-BubbleDialogue"
mkdir -p "$PLUGIN_DIR"
SERVER_SRC="$SCRIPT_DIR/server.js"
PLUGIN_DST="$PLUGIN_DIR/index.js"

if [ -f "$SERVER_SRC" ]; then
    ln -sf "$SERVER_SRC" "$PLUGIN_DST"
    echo "已创建服务端插件软链接: $PLUGIN_DST → $SERVER_SRC"
else
    echo "警告: 找不到 server.js"
fi

# 检查 config.yaml
CONFIG_FILE="$ST_ROOT/config.yaml"
if [ -f "$CONFIG_FILE" ]; then
    if grep -q "enableServerPlugins: true" "$CONFIG_FILE" 2>/dev/null; then
        echo "服务端插件已启用 ✓"
    else
        echo ""
        echo "⚠ 请在 config.yaml 中设置 enableServerPlugins: true 以启用同步功能"
    fi
else
    echo "⚠ 找不到 config.yaml，请手动设置 enableServerPlugins: true"
fi

echo ""
echo "安装完成！请重启 SillyTavern。"
