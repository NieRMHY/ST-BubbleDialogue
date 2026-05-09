import fs from 'node:fs';
import path from 'node:path';

export const info = {
    id: 'bubble-dialogue',
    name: 'Bubble Dialogue Sync',
    description: '对话渲染系统数据同步 API — 多设备头像/字体/CG 图片同步'
};

const DATA_DIR = path.resolve(import.meta.dirname, '../../data/bubble-sync');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function getSyncPath(handle) {
    const safe = handle.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(DATA_DIR, safe, 'sync.json');
}

function readSync(handle) {
    const filePath = getSyncPath(handle);
    if (!fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return null;
    }
}

function writeSync(handle, data) {
    const filePath = getSyncPath(handle);
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { filePath, size: Buffer.byteLength(JSON.stringify(data), 'utf-8') };
}

export function init(router) {
    // POST /api/plugins/bubble-dialogue/sync/upload — 上传同步数据
    router.post('/sync/upload', (req, res) => {
        try {
            const { handle, data } = req.body;
            if (!handle || !data) {
                return res.status(400).json({ error: '缺少 handle 或 data 参数' });
            }
            if (!data.version || !data.avatars) {
                return res.status(400).json({ error: '无效的同步数据格式' });
            }
            const result = writeSync(handle, {
                ...data,
                uploadedAt: new Date().toISOString(),
                handle,
            });
            console.log(`[BubbleSync] ${handle} 上传成功, ${(result.size / 1024).toFixed(1)}KB → ${result.filePath}`);
            res.json({ success: true, size: result.size });
        } catch (err) {
            console.error('[BubbleSync] 上传失败:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // GET /api/plugins/bubble-dialogue/sync/download — 下载同步数据
    router.get('/sync/download', (req, res) => {
        try {
            const handle = req.query.handle;
            if (!handle) {
                return res.status(400).json({ error: '缺少 handle 参数' });
            }
            const sync = readSync(handle);
            if (!sync) {
                return res.status(404).json({ error: '服务端没有备份数据' });
            }
            res.json(sync);
        } catch (err) {
            console.error('[BubbleSync] 下载失败:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // GET /api/plugins/bubble-dialogue/sync/status — 检查服务端是否有数据
    router.get('/sync/status', (req, res) => {
        try {
            const handle = req.query.handle;
            if (!handle) {
                return res.status(400).json({ error: '缺少 handle 参数' });
            }
            const sync = readSync(handle);
            if (!sync) {
                return res.json({ exists: false });
            }
            res.json({
                exists: true,
                version: sync.version,
                uploadedAt: sync.uploadedAt,
                exportedAt: sync.exportedAt,
                avatars: sync.avatars?.length || 0,
                moodAvatars: sync.moodAvatars?.length || 0,
                fonts: sync.fonts?.length || 0,
                cgImages: sync.cgImages?.length || 0,
            });
        } catch (err) {
            console.error('[BubbleSync] 状态查询失败:', err);
            res.status(500).json({ error: err.message });
        }
    });

    console.log('[BubbleSync] 服务端同步 API 已注册: /api/plugins/bubble-dialogue/sync/*');
    console.log('[BubbleSync] 数据目录:', DATA_DIR);
}

export function exit() {
    console.log('[BubbleSync] 插件已卸载');
}
