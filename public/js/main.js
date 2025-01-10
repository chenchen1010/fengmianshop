// 在文件顶部添加变量声明
let hotCovers = [];
let qrcodePath = '';

// 在文件顶部添加
const DEBUG = true;

// 确保在 DOM 加载完成后执行初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 加载完成，开始初始化...');
    initializeResources();
});

// 修改渲染热门封面函数
function renderHotCovers() {
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    if (!swiperWrapper) {
        console.error('找不到 swiper-wrapper 元素');
        return;
    }
    
    console.log('开始渲染视频，数量:', hotCovers.length);
    swiperWrapper.innerHTML = ''; // 清空现有内容

    hotCovers.forEach((cover, index) => {
        console.log(`渲染第 ${index + 1} 个视频:`, cover);
        
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        
        // 创建视频容器
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        // 创建视频元素
        const video = document.createElement('video');
        video.className = 'video-player';
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.controls = true;
        video.preload = 'metadata';
        
        // 设置视频源
        video.src = cover.video;
        
        // 添加视频事件监听
        video.addEventListener('loadstart', () => {
            console.log(`视频 ${index + 1} 开始加载`);
        });
        
        video.addEventListener('loadedmetadata', () => {
            console.log(`视频 ${index + 1} 元数据加载完成`);
        });
        
        video.addEventListener('loadeddata', () => {
            console.log(`视频 ${index + 1} 加载完成`);
            videoContainer.classList.add('loaded');
            video.play().catch(error => {
                console.error(`视频 ${index + 1} 播放失败:`, error);
            });
        });
        
        video.addEventListener('error', (e) => {
            console.error(`视频 ${index + 1} 加载失败:`, e.target.error);
            videoContainer.classList.add('error');
        });

        video.addEventListener('playing', () => {
            console.log(`视频 ${index + 1} 开始播放`);
        });
        
        videoContainer.appendChild(video);
        
        // 添加错误提示
        const errorMessage = document.createElement('div');
        errorMessage.className = 'video-error';
        errorMessage.textContent = '视频加载失败';
        videoContainer.appendChild(errorMessage);
        
        // 添加标题
        const title = document.createElement('div');
        title.className = 'video-title';
        title.textContent = cover.title;
        
        // 添加销售数据
        const salesCount = document.createElement('div');
        salesCount.className = 'sales-count';
        salesCount.textContent = `已售 ${cover.sales}`;
        
        slide.appendChild(videoContainer);
        slide.appendChild(title);
        slide.appendChild(salesCount);
        swiperWrapper.appendChild(slide);
    });
}

// 添加视频播放控制
function handleVideoPlayback() {
    const videos = document.querySelectorAll('.swiper-slide video');
    videos.forEach(video => {
        video.addEventListener('loadeddata', () => {
            video.play().catch(error => {
                console.log('视频加载后播放失败:', error);
            });
        });
    });
}

// 修改初始化资源函数
async function initializeResources() {
    try {
        // 获取视频文件列表
        const videos = await scanVideoFiles();
        console.log('初始化视频列表:', videos);
        
        hotCovers = videos.map((video, index) => ({
            id: index + 1,
            video: video.path,
            sales: Math.floor(Math.random() * 2000) + 500,
            title: decodeURIComponent(video.name.replace(/\.[^/.]+$/, '')) // 解码文件名并移除扩展名
        }));

        // 初始化Swiper
        const swiper = new Swiper('.hot-swiper', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                init: function() {
                    console.log('Swiper 初始化完成');
                },
                slideChange: function () {
                    console.log('切换到新的 slide');
                    // 暂停所有视频
                    const videos = document.querySelectorAll('.swiper-slide video');
                    videos.forEach(video => {
                        try {
                            video.pause();
                        } catch (e) {
                            console.error('暂停视频失败:', e);
                        }
                    });
                    
                    // 播放当前视频
                    const activeSlide = this.slides[this.activeIndex];
                    if (activeSlide) {
                        const activeVideo = activeSlide.querySelector('video');
                        if (activeVideo) {
                            try {
                                activeVideo.play().catch(error => {
                                    console.error('播放当前视频失败:', error);
                                });
                            } catch (e) {
                                console.error('播放视频时出错:', e);
                            }
                        }
                    }
                }
            }
        });

        // 渲染热门封面
        renderHotCovers();
        
        // 获取二维码图片
        qrcodePath = await getQRCode();
        if (qrcodePath) {
            const qrcodeImg = document.querySelector('.qrcode-wrapper img');
            if (qrcodeImg) {
                qrcodeImg.src = qrcodePath;
            }
        }

    } catch (error) {
        console.error('初始化资源失败:', error);
    }
}

// 在 renderHotCovers 函数中添加调试信息更新
function updateDebugInfo(message) {
    if (!DEBUG) return;
    
    const debugInfo = document.getElementById('debug-info');
    const videoStatus = document.getElementById('video-status');
    const currentVideo = document.getElementById('current-video');
    
    if (debugInfo) {
        debugInfo.style.display = 'block';
    }
    if (videoStatus) {
        videoStatus.textContent = message;
    }
    if (currentVideo) {
        const activeVideo = document.querySelector('.swiper-slide-active video');
        currentVideo.textContent = activeVideo ? activeVideo.src.split('/').pop() : '无';
    }
}
