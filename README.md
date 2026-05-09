# ST-BubbleDialogue (对话渲染系统)

SillyTavern 对话气泡渲染扩展，提供头像管理、对话气泡美化、情绪差分头像、CG 图片库和多设备数据同步功能。

## 功能

- **头像管理** — 上传自定义头像，支持角色卡隔离、全局头像和情绪差分头像
- **对话气泡美化** — 自定义对话样式（字体、颜色、间距、旁白样式等）
- **CG 图片库** — 按组管理网络图片，支持 GitHub / JSON / 直链
- **格式规则注入** — 可编辑的对话格式规则 + 情绪词自动注入
- **本地字体** — 上传自定义字体用于对话渲染
- **服务端同步** — 头像/字体/CG 数据同步到服务端，多设备自动恢复

## 安装

```bash
cd SillyTavern

# 1. 安装前端扩展
git clone https://github.com/NieRMHY/ST-BubbleDialogue.git \
  public/scripts/extensions/third-party/ST-BubbleDialogue

# 2. 安装服务端同步插件（可选，用于多设备同步）
mkdir -p plugins/ST-BubbleDialogue
ln -s ../../../public/scripts/extensions/third-party/ST-BubbleDialogue/server.js \
  plugins/ST-BubbleDialogue/index.js

# 3. 启用服务端插件
# 编辑 config.yaml，设置 enableServerPlugins: true

# 4. 重启 SillyTavern
```

或使用安装脚本：

```bash
bash public/scripts/extensions/third-party/ST-BubbleDialogue/install.sh
```

## 使用

1. 在 ST 扩展菜单中找到 **对话气泡** 并点击
2. 在「头像管理」标签上传头像和情绪差分
3. 在「样式设置」标签调整对话气泡外观
4. 在「CG 图片」标签管理 CG 图片库
5. 点击 **☁ 同步** 按钮将数据备份到服务端

## 依赖

- SillyTavern >= 1.12.0
- 服务端同步功能需要 `enableServerPlugins: true`（config.yaml）

## 从酒馆助手迁移

本扩展是「酒馆助手脚本-对话渲染系统 v7.1」的 ST 原生扩展版本（v8.0）。

- 不再依赖酒馆助手插件
- 使用 ST 原生事件系统和 API
- 同步数据存储到 `data/bubble-sync/` 目录（而非 settings.json）

旧脚本保留在 `old_json/` 目录供参考。

## 许可

MIT License
