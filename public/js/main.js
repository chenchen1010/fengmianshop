// 在文件顶部添加变量声明
let hotCovers = [];
let qrcodePath = '';
let isMuted = true; // 默认静音
const volumeStates = new Map(); // 存储每个视频的音量状态

// 在文件顶部添加
const DEBUG = true;

// 添加免费序列号数据
const freeSerialNumbers = [
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
    },
    {
        title: "2025平安喜乐",
        code: "WXHB2025_PEACE_004",
        expireDate: "2025-12-31",
        description: "传统中国风，祥云纹样"
    },
    {
        title: "2025新年大吉",
        code: "WXHB2025_LUCKY_005",
        expireDate: "2025-12-31",
        description: "红金配色，福字与灯笼"
    }
];

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
        
        // 添加音量控制按钮
        const volumeTemplate = document.getElementById('volume-control-template');
        if (volumeTemplate) {
            const volumeClone = volumeTemplate.content.cloneNode(true);
            const volumeButton = volumeClone.querySelector('.volume-button');
            const volumeIcon = volumeClone.querySelector('.volume-icon');
            
            if (volumeButton) {
                volumeButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    isMuted = !isMuted;
                    
                    // 更新所有音量控制按钮的状态
                    document.querySelectorAll('.volume-icon').forEach(icon => {
                        if (isMuted) {
                            icon.classList.add('muted');
                        } else {
                            icon.classList.remove('muted');
                        }
                    });
                    
                    // 更新所有视频的音量状态
                    const videos = document.querySelectorAll('.video-player');
                    videos.forEach(video => {
                        video.muted = isMuted;
                        volumeStates.set(video, !isMuted);
                    });
                    
                    // 更新本地存储
                    localStorage.setItem('videoMuted', isMuted.toString());
                });
            }
            
            videoContainer.appendChild(volumeClone);
        }
        
        // 创建视频元素
        const video = document.createElement('video');
        video.className = 'video-player';
        video.autoplay = true;
        video.loop = true;
        video.muted = isMuted; // 使用全局音量状态
        video.playsInline = true;
        video.controls = true;
        video.preload = 'metadata';
        
        // 设置视频源
        video.src = cover.video;
        
        // 存储初始音量状态
        volumeStates.set(video, !isMuted);
        
        // 添加音量变化监听
        video.addEventListener('volumechange', () => {
            volumeStates.set(video, !video.muted);
        });
        
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
        
        // 创建视频信息容器
        const videoInfo = document.createElement('div');
        videoInfo.className = 'video-info';
        
        // 添加标题
        const title = document.createElement('div');
        title.className = 'video-title';
        title.textContent = cover.title;
        
        // 添加销售数据
        const salesCount = document.createElement('div');
        salesCount.className = 'sales-count';
        salesCount.textContent = `🔥已售 ${cover.sales}`;
        
        // 将标题和销售数据添加到信息容器
        videoInfo.appendChild(title);
        videoInfo.appendChild(salesCount);
        
        // 将信息容器添加到幻灯片
        slide.appendChild(videoContainer);
        slide.appendChild(videoInfo);
        
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

// 添加音量控制初始化函数
function initVolumeControl() {
    const volumeButton = document.querySelector('.volume-button');
    const volumeIcon = document.querySelector('.volume-icon');
    
    if (volumeButton) {
        volumeButton.addEventListener('click', () => {
            isMuted = !isMuted;
            volumeIcon.classList.toggle('muted', isMuted);
            
            // 更新所有视频的音量状态
            const videos = document.querySelectorAll('.video-player');
            videos.forEach(video => {
                video.muted = isMuted;
                volumeStates.set(video, !isMuted);
            });
            
            // 更新本地存储
            localStorage.setItem('videoMuted', isMuted.toString());
        });
        
        // 从本地存储恢复音量状态
        const savedMuted = localStorage.getItem('videoMuted');
        if (savedMuted !== null) {
            isMuted = savedMuted === 'true';
            volumeIcon.classList.toggle('muted', isMuted);
        }
    }
}

// 添加渲染免费序列号的函数
function renderFreeSerialNumbers() {
    const freeCodesContainer = document.querySelector('.free-codes');
    if (!freeCodesContainer) return;

    freeCodesContainer.innerHTML = freeSerialNumbers.map(serial => `
        <div class="serial-card">
            <div class="serial-header">
                <h3>${serial.title}</h3>
                <span class="expire-date">有效期至：${serial.expireDate}</span>
            </div>
            <div class="serial-content">
                <p class="description">${serial.description}</p>
                <div class="code-wrapper">
                    <code class="serial-code">${serial.code}</code>
                    <button class="copy-btn" data-code="${serial.code}">
                        <span class="copy-text">复制</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // 添加复制功能
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const code = btn.dataset.code;
            try {
                await navigator.clipboard.writeText(code);
                const copyText = btn.querySelector('.copy-text');
                copyText.textContent = '已复制';
                btn.classList.add('copied');
                setTimeout(() => {
                    copyText.textContent = '复制';
                    btn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('复制失败:', err);
            }
        });
    });
}

// 修改初始化资源函数
async function initializeResources() {
    try {
        // 初始化音量控制
        initVolumeControl();
        
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
                    handleSlideChange(this);
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

        // 渲染免费序列号
        renderFreeSerialNumbers();

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

// 修改 Swiper 的 slideChange 事件处理
function handleSlideChange(swiper) {
    // 暂停所有视频
    const videos = document.querySelectorAll('.swiper-slide video');
    videos.forEach(video => {
        try {
            video.pause();
            // 保持音量状态
            video.muted = isMuted;
        } catch (e) {
            console.error('暂停视频失败:', e);
        }
    });
    
    // 播放当前视频
    const activeSlide = swiper.slides[swiper.activeIndex];
    if (activeSlide) {
        const activeVideo = activeSlide.querySelector('video');
        if (activeVideo) {
            try {
                // 应用存储的音量状态
                activeVideo.muted = isMuted;
                activeVideo.play().catch(error => {
                    console.error('播放当前视频失败:', error);
                });
            } catch (e) {
                console.error('播放视频时出错:', e);
            }
        }
    }
}
