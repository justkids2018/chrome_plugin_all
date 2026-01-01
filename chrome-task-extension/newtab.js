// 显示当前时间和日期
function updateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const timeString = now.toLocaleString('zh-CN', options);
    document.getElementById('currentTime').textContent = timeString;
}

// 初始化
updateTime();
setInterval(updateTime, 1000);
