// 获取视频文件列表
async function scanVideoFiles() {
    try {
        console.log('开始扫描视频文件');
        const response = await fetch('/api/scan-videos');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const videos = await response.json();
        console.log('获取到的视频列表:', videos);
        
        // 验证视频文件是否可访问
        const validVideos = [];
        for (const video of videos) {
            try {
                const testResponse = await fetch(video.path, { method: 'HEAD' });
                console.log(`视频文件 ${video.name} 状态:`, testResponse.status);
                if (testResponse.ok) {
                    validVideos.push(video);
                }
            } catch (error) {
                console.error(`视频文件 ${video.name} 访问失败:`, error);
            }
        }
        
        console.log('有效的视频列表:', validVideos);
        return validVideos;
    } catch (error) {
        console.error('获取视频文件失败:', error);
        return [];
    }
}

// 获取二维码图片
async function getQRCode() {
    try {
        const response = await fetch('/api/get-qrcode');
        const qrcode = await response.json();
        return qrcode.path;
    } catch (error) {
        console.error('获取二维码图片失败:', error);
        return null;
    }
} 