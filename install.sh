#!/usr/bin/env bash
# ST-BubbleDialogue 安装脚本
# 用法:
#   bash install.sh                  # 自动检测 ST 根目录（要求扩展已在 ST 扩展目录内）
#   bash install.sh /path/to/ST      # 指定 ST 根目录
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -n "$1" ]; then
    ST_ROOT="$(cd "$1" && pwd)"
else
    # 自动检测：从脚本位置向上找 4 层（third-party/ST-BubbleDialogue → extensions → scripts → public → ST）
    ST_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
fi

echo "========================================="
echo " ST-BubbleDialogue 安装脚本"
echo "========================================="
echo " 扩展路径: $SCRIPT_DIR"
echo " ST 根目录: $ST_ROOT"
echo ""

# ---- 前端扩展 ----
EXT_PATH="$ST_ROOT/public/scripts/extensions/third-party/ST-BubbleDialogue"

if [ "$SCRIPT_DIR" = "$EXT_PATH" ]; then
    echo "[✓] 前端扩展已在标准位置"
else
    echo "[!] 扩展未安装在标准位置"
    echo "    当前: $SCRIPT_DIR"
    echo "    期望: $EXT_PATH"
    echo ""
    read -p "    是否创建软链接？[y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p "$(dirname "$EXT_PATH")"
        ln -sf "$SCRIPT_DIR" "$EXT_PATH"
        echo "    [✓] 已创建: $EXT_PATH → $SCRIPT_DIR"
    fi
fi

# ---- 服务端同步插件 ----
echo ""
echo "[ ] 安装服务端同步插件..."
PLUGIN_DIR="$ST_ROOT/plugins/ST-BubbleDialogue"

if [ -d "$PLUGIN_DIR" ]; then
    echo "    插件目录已存在: $PLUGIN_DIR"
else
    mkdir -p "$PLUGIN_DIR"
    echo "    已创建: $PLUGIN_DIR"
fi

SERVER_SRC="$SCRIPT_DIR/server.js"
PLUGIN_DST="$PLUGIN_DIR/index.js"

if [ -f "$SERVER_SRC" ]; then
    if [ -L "$PLUGIN_DST" ] || [ -f "$PLUGIN_DST" ]; then
        rm -f "$PLUGIN_DST"
    fi
    ln -sf "$SERVER_SRC" "$PLUGIN_DST"
    echo "    [✓] 服务端插件已链接:"
    echo "        $PLUGIN_DST"
    echo "        → $SERVER_SRC"
else
    echo "    [!] 警告: 找不到 server.js"
fi

# ---- config.yaml ----
CONFIG_FILE="$ST_ROOT/config.yaml"
if [ -f "$CONFIG_FILE" ]; then
    if grep -q "enableServerPlugins: true" "$CONFIG_FILE" 2>/dev/null; then
        echo "    [✓] enableServerPlugins 已启用"
    else
        echo "    [!] 请在 config.yaml 中设置 enableServerPlugins: true"
    fi
else
    echo "    [!] 找不到 config.yaml，请手动设置 enableServerPlugins: true"
fi

# ---- 完成 ----
echo ""
echo "========================================="
echo " 安装完成！请重启 SillyTavern。"
echo "========================================="
echo ""
echo "同步数据将存储到: $ST_ROOT/data/bubble-sync/"
