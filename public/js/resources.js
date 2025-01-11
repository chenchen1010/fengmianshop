// 默认视频数据，使用测试视频链接
const defaultVideos = [
    {
        path: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        title: '2024春节红包封面',
        sales: '已售 12,345'
    },
    {
        path: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        title: '新年快乐红包封面',
        sales: '已售 8,976'
    },
    {
        path: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        title: '2024福兔贺岁',
        sales: '已售 6,789'
    }
];

// 修改视频获取逻辑
async function scanVideoFiles() {
    try {
        console.log('开始加载视频列表');
        // 直接返回默认视频列表
        return defaultVideos;
    } catch (error) {
        console.error('获取视频文件失败:', error);
        return defaultVideos;
    }
}

// 将函数添加到全局作用域
window.scanVideoFiles = scanVideoFiles;

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

const videoUrls = [
    './assets/videos/video1.mp4',
    // ... 其他视频路径
]; 