const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const app = express();

// 添加错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('服务器错误！');
});

// 添加请求日志中间件（放在最前面）
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// 修改静态文件服务配置
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath, stat) => {
        if (filePath.endsWith('.mp4')) {
            res.set({
                'Content-Type': 'video/mp4',
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=31536000'
            });
        }
    }
}));

// 修改视频流处理路由
app.get('/assets/videos/:filename', async (req, res) => {
    const videoPath = path.join(__dirname, 'public/assets/videos', req.params.filename);
    
    try {
        // 使用同步版本检查文件是否存在
        if (!fsSync.existsSync(videoPath)) {
            console.error('视频文件不存在:', videoPath);
            return res.status(404).send('视频文件不存在');
        }

        const stat = fsSync.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const stream = fsSync.createReadStream(videoPath, {start, end});
            
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            
            res.writeHead(206, head);
            stream.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fsSync.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error('视频流处理错误:', error);
        res.status(500).send('视频加载失败');
    }
});

// 扫描视频文件API
app.get('/api/scan-videos', async (req, res) => {
    try {
        const videosDir = path.join(__dirname, 'public/assets/videos');
        console.log('[scan-videos] 扫描目录:', videosDir);
        
        const files = await fs.readdir(videosDir);
        console.log('[scan-videos] 找到文件:', files);
        
        const videos = files
            .filter(file => file.match(/\.(mp4|webm|ogg)$/))
            .map(file => ({
                path: `/assets/videos/${file}`,
                name: file
            }));
        console.log('[scan-videos] 处理后的视频列表:', videos);
        
        res.json(videos);
    } catch (error) {
        console.error('[scan-videos] 错误:', error);
        res.status(500).json({ 
            error: '获取视频文件失败', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// 获取二维码图片API
app.get('/api/get-qrcode', async (req, res) => {
    try {
        const qrcodeDir = path.join(__dirname, 'public/assets/images');
        const files = await fs.readdir(qrcodeDir);
        const qrcode = files.find(file => file.match(/qrcode\.(png|jpg|jpeg|gif)$/));
        if (qrcode) {
            res.json({ path: `/assets/images/${qrcode}` });
        } else {
            res.status(404).json({ error: '未找到二维码图片' });
        }
    } catch (error) {
        console.error('获取二维码图片失败:', error);
        res.status(500).json({ error: '获取二维码图片失败' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}); 