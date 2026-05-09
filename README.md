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

### 方式一：官方扩展商店安装（推荐）

在 SillyTavern 的 **扩展 → 管理扩展 → 安装扩展** 中粘贴以下 URL：

```
https://github.com/NieRMHY/ST-BubbleDialogue
```

<details>
<summary>官方安装对服务端同步的限制</summary>

官方安装只安装前端扩展部分。如需**服务端同步**功能，需要额外执行：

```bash
# ST 根目录下执行
mkdir -p plugins/ST-BubbleDialogue
ln -sf ../../../public/scripts/extensions/third-party/ST-BubbleDialogue/server.js \
  plugins/ST-BubbleDialogue/index.js
```

并在 `config.yaml` 中设置 `enableServerPlugins: true`，然后重启 ST。

</details>

### 方式二：本地手动安装

> [!NOTE]
> 以下路径均以 **SillyTavern 根目录**（`SillyTavern/`）为当前目录。

```bash
# SillyTavern 根目录下执行
# 1. 克隆前端扩展
git clone https://github.com/NieRMHY/ST-BubbleDialogue.git \
  public/scripts/extensions/third-party/ST-BubbleDialogue

# 2. 运行安装脚本（完成服务端插件链接和配置检查）
bash public/scripts/extensions/third-party/ST-BubbleDialogue/install.sh

# 3. 重启 SillyTavern
```

### 方式三：使用安装脚本（离线和本地）

如果已经将仓库下载到本地任意位置，运行：

```bash
# 指定 ST 根目录
bash /path/to/ST-BubbleDialogue/install.sh /path/to/SillyTavern
```

## 使用

1. 在 ST 扩展菜单中找到 **对话气泡** 并点击
2. 在「头像管理」标签上传头像和情绪差分
3. 在「样式设置」标签调整对话气泡外观
4. 在「CG 图片」标签管理 CG 图片库
5. 点击 **☁ 同步** 按钮将数据备份到服务端

## 目录结构

```
SillyTavern/                                        ← ST 根目录
├── public/scripts/extensions/third-party/
│   └── ST-BubbleDialogue/                          ← 前端扩展（本仓库）
│       ├── manifest.json
│       ├── index.js
│       ├── style.css
│       └── server.js
├── plugins/
│   └── ST-BubbleDialogue/
│       └── index.js → ../../public/scripts/...     ← 软链到 server.js
└── data/
    └── bubble-sync/                                ← 同步数据存储
        └── <user>/
            └── sync.json
```

## 依赖

- SillyTavern >= 1.12.0
- 服务端同步功能需要 `enableServerPlugins: true`（`config.yaml`）

## 从酒馆助手迁移

本扩展是「酒馆助手脚本-对话渲染系统 v7.1」的 ST 原生扩展版本（v8.0）。

- 不再依赖酒馆助手插件
- 使用 ST 原生事件系统和 API
- 同步数据存储到 `data/bubble-sync/` 目录（而非 `settings.json`）

旧脚本保留在 `old_json/` 目录供参考。

## 许可

MIT License
