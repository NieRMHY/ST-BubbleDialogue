import fs from 'node:fs';
import path from 'node:path';

export const info = {
    id: 'bubble-dialogue',
    name: 'Bubble Dialogue Sync',
    description: '对话渲染系统数据同步 API — 多设备头像/字体/CG 图片同步'
};

// ---- 读取 ST 配置的 dataRoot ----
function getDataRoot() {
    const configPath = path.resolve(process.cwd(), 'config.yaml');
    let dataRoot = './data';
    try {
        const content = fs.readFileSync(configPath, 'utf-8');
        const m = content.match(/^dataRoot:\s*["']?(.+?)["']?\s*$/m);
        if (m) dataRoot = m[1].trim();
    } catch {}
    return path.resolve(process.cwd(), dataRoot);
}

const DATA_ROOT = getDataRoot();
const SYNC_DIR = path.join(DATA_ROOT, 'bubble-sync');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
}

function safeName(s) { return (s || '_').replace(/[^a-zA-Z0-9_-]/g, '_'); }

function getCharDir(handle, charId) {
    return path.join(SYNC_DIR, safeName(handle), safeName(charId || '_global_'));
}

// base64 data URL → Buffer
function base64ToBuffer(dataUrl) {
    if (!dataUrl) return null;
    const comma = dataUrl.indexOf(',');
    return Buffer.from(dataUrl.slice(comma + 1), 'base64');
}

// Buffer → base64 data URL
function bufferToBase64(buf, mimeType) {
    return `data:${mimeType || 'image/webp'};base64,${buf.toString('base64')}`;
}

// ---- 写入：拆分为 metadata.json + 图片/字体二进制文件 ----
function writeSync(handle, charId, data) {
    const dir = getCharDir(handle, charId);
    ensureDir(dir);

    // 写入头像
    const avatarDir = path.join(dir, 'avatars');
    ensureDir(avatarDir);
    if (data.avatars) {
        for (const a of data.avatars) {
            if (a.imageBase64) {
                const buf = base64ToBuffer(a.imageBase64);
                if (buf) fs.writeFileSync(path.join(avatarDir, safeName(a.alias || a.name)), buf);
            }
        }
    }

    // 写入情绪差分
    const moodDir = path.join(dir, 'moods');
    ensureDir(moodDir);
    if (data.moodAvatars) {
        for (const a of data.moodAvatars) {
            if (a.imageBase64) {
                const buf = base64ToBuffer(a.imageBase64);
                if (buf) fs.writeFileSync(path.join(moodDir, safeName(a.moodId || a.id)), buf);
            }
        }
    }

    // 写入字体
    const fontDir = path.join(dir, 'fonts');
    ensureDir(fontDir);
    if (data.fonts) {
        for (const f of data.fonts) {
            if (f.fontBase64) {
                const buf = base64ToBuffer(f.fontBase64);
                if (buf) fs.writeFileSync(path.join(fontDir, safeName(f.id || f.family)), buf);
            }
        }
    }

    // 写入 metadata.json（不含 base64 数据，只保留结构信息）
    const avatarMeta = (data.avatars || []).map(a => ({
        alias: a.alias || a.name,
        mimeType: a.mimeType, fileName: a.fileName,
        fileSize: a.fileSize, width: a.width, height: a.height,
        sourceUrl: a.sourceUrl, createdAt: a.createdAt, updatedAt: a.updatedAt,
    }));
    const moodMeta = (data.moodAvatars || []).map(a => ({
        id: a.id, charId: a.charId, alias: a.alias, moodId: a.moodId,
        mimeType: a.mimeType, fileName: a.fileName,
        fileSize: a.fileSize, width: a.width, height: a.height,
        sourceUrl: a.sourceUrl, createdAt: a.createdAt, updatedAt: a.updatedAt,
    }));
    const fontMeta = (data.fonts || []).map(f => ({
        id: f.id, family: f.family, name: f.name,
        mimeType: f.mimeType, fileName: f.fileName, fileSize: f.fileSize,
        format: f.format, createdAt: f.createdAt,
    }));

    const metadata = {
        version: data.version || '7.1-sync',
        exportedAt: data.exportedAt,
        uploadedAt: new Date().toISOString(),
        timestamp: Date.now(),
        handle, charId,
        avatars: avatarMeta,
        moodAvatars: moodMeta,
        fonts: fontMeta,
        cgGroups: data.cgGroups || [],
        config: data.config || {},
    };

    fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8');

    // 计算总大小
    let totalSize = Buffer.byteLength(JSON.stringify(metadata), 'utf-8');
    for (const f of fs.readdirSync(avatarDir)) totalSize += fs.statSync(path.join(avatarDir, f)).size;
    for (const f of fs.readdirSync(moodDir)) totalSize += fs.statSync(path.join(moodDir, f)).size;
    for (const f of fs.readdirSync(fontDir)) totalSize += fs.statSync(path.join(fontDir, f)).size;

    return { dir, size: totalSize };
}

// ---- 读取：从文件组装回 JSON（含 base64） ----
function readSync(handle, charId) {
    const dir = getCharDir(handle, charId);
    const metaPath = path.join(dir, 'metadata.json');
    if (!fs.existsSync(metaPath)) return null;

    try {
        const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

        // 读回头像 base64
        const avatarDir = path.join(dir, 'avatars');
        for (const a of metadata.avatars) {
            const fname = safeName(a.alias || a.name);
            const fpath = path.join(avatarDir, fname);
            if (fs.existsSync(fpath)) {
                a.imageBase64 = bufferToBase64(fs.readFileSync(fpath), a.mimeType || 'image/webp');
            }
        }

        // 读回情绪差分 base64
        const moodDir = path.join(dir, 'moods');
        for (const a of metadata.moodAvatars) {
            const fname = safeName(a.moodId || a.id);
            const fpath = path.join(moodDir, fname);
            if (fs.existsSync(fpath)) {
                a.imageBase64 = bufferToBase64(fs.readFileSync(fpath), a.mimeType || 'image/webp');
            }
        }

        // 读回字体 base64
        const fontDir = path.join(dir, 'fonts');
        for (const f of metadata.fonts) {
            const fname = safeName(f.id || f.family);
            const fpath = path.join(fontDir, fname);
            if (fs.existsSync(fpath)) {
                f.fontBase64 = bufferToBase64(fs.readFileSync(fpath), f.mimeType || 'application/octet-stream');
            }
        }

        return metadata;
    } catch (err) {
        console.error('[BubbleSync] 读取失败:', err);
        return null;
    }
}

export function init(router) {
    // POST /api/plugins/bubble-dialogue/sync/upload
    router.post('/sync/upload', (req, res) => {
        try {
            const { handle, charId, data } = req.body;
            if (!handle || !data) {
                return res.status(400).json({ error: '缺少 handle 或 data 参数' });
            }
            const result = writeSync(handle, charId || '_global_', data);
            console.log(`[BubbleSync] ${handle}/${charId || '_global_'} 上传成功, ${(result.size / 1024).toFixed(1)}KB → ${result.dir}`);
            res.json({ success: true, size: result.size, timestamp: Date.now() });
        } catch (err) {
            console.error('[BubbleSync] 上传失败:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // GET /api/plugins/bubble-dialogue/sync/download
    router.get('/sync/download', (req, res) => {
        try {
            const { handle, charId } = req.query;
            if (!handle) return res.status(400).json({ error: '缺少 handle 参数' });
            const data = readSync(handle, charId || '_global_');
            if (!data) return res.status(404).json({ error: '服务端没有备份数据' });
            res.json(data);
        } catch (err) {
            console.error('[BubbleSync] 下载失败:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // GET /api/plugins/bubble-dialogue/sync/status
    router.get('/sync/status', (req, res) => {
        try {
            const { handle, charId } = req.query;
            if (!handle || handle === '__ping__') {
                return res.json({ exists: false, timestamp: 0 });
            }
            const metaPath = path.join(getCharDir(handle, charId || '_global_'), 'metadata.json');
            if (!fs.existsSync(metaPath)) {
                return res.json({ exists: false, timestamp: 0 });
            }
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            res.json({
                exists: true,
                timestamp: meta.timestamp || 0,
                uploadedAt: meta.uploadedAt,
                avatars: meta.avatars?.length || 0,
                moodAvatars: meta.moodAvatars?.length || 0,
                fonts: meta.fonts?.length || 0,
            });
        } catch {
            res.json({ exists: false, timestamp: 0 });
        }
    });

    console.log('[BubbleSync] 服务端同步 API 已注册: /api/plugins/bubble-dialogue/sync/*');
    console.log('[BubbleSync] 数据目录:', SYNC_DIR, '(dataRoot:', DATA_ROOT + ')');
}

export function exit() {
    console.log('[BubbleSync] 插件已卸载');
}
