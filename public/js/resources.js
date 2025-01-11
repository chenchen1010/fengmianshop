// 默认视频数据
const defaultVideos = [
    {
        path: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        title: '2024春节红包封面',
        sales: '已售 12,345',
        name: 'video1.mp4'
    },
    {
        path: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        title: '新年快乐红包封面',
        sales: '已售 8,976',
        name: 'video2.mp4'
    },
    {
        path: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        title: '2024福兔贺岁',
        sales: '已售 6,789',
        name: 'video3.mp4'
    }
];

// 视频获取逻辑
async function scanVideoFiles() {
    try {
        console.log('开始加载视频列表');
        // 验证视频文件是否可访问
        const validVideos = [];
        for (const video of defaultVideos) {
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
        return validVideos.length > 0 ? validVideos : defaultVideos;
    } catch (error) {
        console.error('获取视频文件失败:', error);
        return defaultVideos;
    }
}

// 获取二维码图片
async function getQRCodePath() {
    try {
        const response = await fetch('/api/get-qrcode');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.path;
    } catch (error) {
        console.error('获取二维码失败:', error);
        return null;
    }
}

// 将函数添加到全局作用域
window.scanVideoFiles = scanVideoFiles;
window.getQRCodePath = getQRCodePath; 