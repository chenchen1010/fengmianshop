// OSS 配置
const OSS_BUCKET = 'hongbao-videos';
const OSS_REGION = 'oss-cn-hangzhou';
const OSS_PATH = 'videos';

// 免费序列号数据
const FREE_SERIAL_NUMBERS = [
    {
        title: "2025新春快乐",
        code: "WXHB2025_NYE_001",
        expireDate: "2025-12-31",
        description: "喜庆红色主题，金色福字装饰"
    },
    {
        title: "2025福兔贺岁",
        code: "WXHB2025_LUCK_002",
        expireDate: "2025-12-31",
        description: "可爱兔子形象，新年祝福语"
    },
    {
        title: "2025金运亨通",
        code: "WXHB2025_GOLD_003",
        expireDate: "2025-12-31",
        description: "金色主题，招财进宝图案"
    }
];

// 视频获取逻辑
async function scanVideoFiles() {
    try {
        console.log('开始加载 OSS 视频列表');
        
        // 获取文件列表
        const listUrl = `https://${OSS_BUCKET}.${OSS_REGION}.aliyuncs.com/?prefix=${OSS_PATH}/&delimiter=/`;
        console.log('请求文件列表:', listUrl);
        
        const response = await fetch(listUrl);
        console.log('列表响应状态:', response.status);
        
        const xmlText = await response.text();
        console.log('列表响应内容:', xmlText);
        
        // 解析 XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const contents = xmlDoc.getElementsByTagName('Contents');
        
        // 处理视频文件
        const videos = [];
        for (let i = 0; i < contents.length; i++) {
            const key = contents[i].getElementsByTagName('Key')[0].textContent;
            if (key.endsWith('.mp4')) {
                const name = key.split('/').pop();
                const title = name.replace('.mp4', '')
                    .replace(/_/g, ' ')
                    .replace(/-/g, ' ');
                
                videos.push({
                    path: `https://${OSS_BUCKET}.${OSS_REGION}.aliyuncs.com/${key}`,
                    title: title,
                    sales: `已售 ${Math.floor(Math.random() * 2000) + 500}`,
                    name: name
                });
            }
        }
        
        console.log('找到的视频列表:', videos);
        return videos;
        
    } catch (error) {
        console.error('获取视频列表失败:', error);
        // 出错时返回默认视频
        return [{
            path: `https://${OSS_BUCKET}.${OSS_REGION}.aliyuncs.com/${OSS_PATH}/spring_festival_2024.mp4`,
            title: '2024春节红包封面',
            sales: '已售 12,345',
            name: 'spring_festival_2024.mp4'
        }];
    }
}

// 获取免费序列号
function getFreeSerialNumbers() {
    return FREE_SERIAL_NUMBERS;
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
window.getFreeSerialNumbers = getFreeSerialNumbers; 