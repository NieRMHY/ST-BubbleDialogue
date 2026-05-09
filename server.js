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

function safeName(s) {
    return s.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getSyncPath(handle, charId) {
    const h = safeName(handle);
    const c = safeName(charId || '_global_');
    return path.join(DATA_DIR, h, c + '.json');
}

function readSync(handle, charId) {
    const filePath = getSyncPath(handle, charId);
    if (!fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return null;
    }
}

function writeSync(handle, charId, data) {
    const filePath = getSyncPath(handle, charId);
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { filePath, size: Buffer.byteLength(JSON.stringify(data), 'utf-8') };
}

export function init(router) {
    // POST /api/plugins/bubble-dialogue/sync/upload — 上传同步数据
    router.post('/sync/upload', (req, res) => {
        try {
            const { handle, charId, data } = req.body;
            if (!handle || !data) {
                return res.status(400).json({ error: '缺少 handle 或 data 参数' });
            }
            const result = writeSync(handle, charId || '_global_', {
                ...data,
                uploadedAt: new Date().toISOString(),
                timestamp: Date.now(),
                handle,
                charId: charId || '_global_',
            });
            console.log(`[BubbleSync] ${handle}/${charId || '_global_'} 上传成功, ${(result.size / 1024).toFixed(1)}KB → ${result.filePath}`);
            res.json({ success: true, size: result.size, timestamp: Date.now() });
        } catch (err) {
            console.error('[BubbleSync] 上传失败:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // GET /api/plugins/bubble-dialogue/sync/download — 下载同步数据
    router.get('/sync/download', (req, res) => {
        try {
            const handle = req.query.handle;
            const charId = req.query.charId || '_global_';
            if (!handle) {
                return res.status(400).json({ error: '缺少 handle 参数' });
            }
            const sync = readSync(handle, charId);
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
            const charId = req.query.charId || '_global_';
            if (!handle) {
                return res.status(400).json({ error: '缺少 handle 参数' });
            }
            if (handle === '__ping__') {
                return res.json({ exists: false, timestamp: 0 });
            }
            const sync = readSync(handle, charId);
            if (!sync) {
                return res.json({ exists: false, timestamp: 0 });
            }
            res.json({
                exists: true,
                timestamp: sync.timestamp || 0,
                uploadedAt: sync.uploadedAt,
                avatars: sync.avatars?.length || 0,
                moodAvatars: sync.moodAvatars?.length || 0,
                fonts: sync.fonts?.length || 0,
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
