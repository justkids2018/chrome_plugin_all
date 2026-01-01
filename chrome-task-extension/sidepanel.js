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
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }

    // 更新高亮
    highlightCurrentTask();

    // 更新倒计时（每分钟更新一次就够了）
    updateCountdown();

    // 更新今日任务列表
    updateTodayTasks();
}

// 更新年度倒计时
function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1); // 1月1日
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59); // 12月31日

    const totalDays = Math.ceil((endOfYear - startOfYear) / (1000 * 60 * 60 * 24));
    const diff = endOfYear - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    // 更新倒计时数字
    const daysLeftElement = document.getElementById('daysLeft');
    const daysLeftTextElement = document.getElementById('daysLeftText');
    if (daysLeftElement) {
        daysLeftElement.textContent = daysLeft;
    }
    if (daysLeftTextElement) {
        daysLeftTextElement.textContent = daysLeft;
    }

    // 更新圆形进度
    const progressCircle = document.getElementById('progressCircle');
    if (progressCircle) {
        const radius = 27;
        const circumference = 2 * Math.PI * radius; // 169.646
        const progress = daysLeft / totalDays;
        const offset = circumference * (1 - progress);
        progressCircle.style.strokeDashoffset = offset;
    }
}

// 更新今日任务列表
function updateTodayTasks() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayTasksList = document.getElementById('todayTasksList');

    if (!todayTasksList) return;

    // 收集所有任务
    const allTasks = [];
    document.querySelectorAll('.time-item[data-start]').forEach(item => {
        const startTime = item.getAttribute('data-start');
        const endTime = item.getAttribute('data-end');
        const activityEl = item.querySelector('.activity');

        if (startTime && endTime && activityEl) {
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);

            allTasks.push({
                startTime,
                endTime,
                startMinutes,
                endMinutes,
                activity: activityEl.textContent,
                isPast: currentMinutes >= endMinutes,
                isCurrent: currentMinutes >= startMinutes && currentMinutes < endMinutes,
                isFuture: currentMinutes < startMinutes
            });
        }
    });

    // 按时间排序
    allTasks.sort((a, b) => a.startMinutes - b.startMinutes);

    // 生成任务列表 HTML
    if (allTasks.length === 0) {
        todayTasksList.innerHTML = '<div class="no-tasks">暂无任务安排</div>';
        return;
    }

    todayTasksList.innerHTML = allTasks.map(task => {
        const timeText = task.startTime === task.endTime
            ? task.startTime
            : `${task.startTime} - ${task.endTime}`;

        let statusIcon = '';
        let opacity = '';

        if (task.isPast) {
            statusIcon = '✅';
            opacity = 'opacity: 0.5;';
        } else if (task.isCurrent) {
            statusIcon = '⏰';
        } else {
            statusIcon = '📌';
        }

        return `
            <div class="today-task-item" style="${opacity}">
                <div class="today-task-time">${statusIcon} ${timeText}</div>
                <div class="today-task-content">${task.activity}</div>
            </div>
        `;
    }).join('');
}

// 将时间字符串转换为分钟数（从00:00开始）
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// 标记是否已经初次滚动过
let hasScrolledToActive = false;

// 根据当前时间高亮对应的任务
function highlightCurrentTask(forceScroll = false) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // 移除所有已有的高亮
    document.querySelectorAll('.time-item.active').forEach(item => {
        item.classList.remove('active');
    });

    // 查找当前时间对应的任务
    document.querySelectorAll('.time-item[data-start]').forEach(item => {
        const startTime = item.getAttribute('data-start');
        const endTime = item.getAttribute('data-end');

        if (startTime && endTime) {
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);

            // 如果当前时间在任务时间范围内，添加高亮
            if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                item.classList.add('active');
                // 只在初次加载或强制滚动时才滚动到高亮任务
                if ((forceScroll || !hasScrolledToActive) && !isEditMode) {
                    setTimeout(() => {
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        hasScrolledToActive = true;
                    }, 100);
                }
            }
        }
    });
}

// 监听来自 background 的关闭消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'closeSidePanel') {
        window.close();
    }
});

// 监听窗口关闭事件，通知 background
window.addEventListener('beforeunload', () => {
    chrome.tabs.getCurrent((tab) => {
        if (tab && tab.windowId) {
            chrome.runtime.sendMessage({
                action: 'sidePanelClosed',
                windowId: tab.windowId
            });
        }
    });
});

// 编辑模式管理
let isEditMode = false;
const originalContents = new Map(); // 保存原始内容

function toggleEditMode() {
    const editBtn = document.getElementById('editBtn');
    const editBtnText = document.getElementById('editBtnText');
    isEditMode = !isEditMode;

    if (isEditMode) {
        // 进入编辑模式
        editBtn.classList.add('save-mode');
        editBtnText.textContent = '保存';
        editBtn.querySelector('span:first-child').textContent = '💾';

        // 给所有卡片添加编辑模式类
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('editing');
        });

        // 让所有时间和活动内容可编辑
        document.querySelectorAll('.time-item').forEach(item => {
            const timeEl = item.querySelector('.time');
            const activityEl = item.querySelector('.activity');

            if (timeEl && activityEl) {
                const startTime = item.getAttribute('data-start');
                const endTime = item.getAttribute('data-end');

                // 保存原始内容
                originalContents.set(item, {
                    startTime,
                    endTime,
                    activity: activityEl.innerHTML
                });

                // 设置可编辑
                item.classList.add('editing');

                // 创建时间选择器
                const timeInputs = document.createElement('div');
                timeInputs.className = 'time-inputs';
                timeInputs.innerHTML = `
                    <input type="time" class="start-time" value="${startTime}">
                    <span class="time-separator">-</span>
                    <input type="time" class="end-time" value="${endTime}">
                `;
                timeEl.replaceWith(timeInputs);

                // 检查是否包含链接
                const linkElement = activityEl.querySelector('a');
                if (linkElement) {
                    // 提取链接信息
                    const linkUrl = linkElement.getAttribute('href');
                    const linkText = linkElement.textContent;
                    const beforeLink = activityEl.childNodes[0]?.textContent || '';
                    const afterLink = activityEl.childNodes[activityEl.childNodes.length - 1]?.textContent || '';

                    // 保存链接信息
                    item.setAttribute('data-link-url', linkUrl);
                    item.setAttribute('data-link-text', linkText);
                    item.setAttribute('data-before-link', beforeLink);
                    item.setAttribute('data-after-link', afterLink);

                    // 创建链接编辑界面
                    const linkEditContainer = document.createElement('div');
                    linkEditContainer.className = 'link-edit-container';
                    linkEditContainer.innerHTML = `
                        <input type="text" class="activity-text" value="${activityEl.textContent}" placeholder="活动描述">
                        <div class="link-edit-fields">
                            <label class="link-label">链接名称:</label>
                            <input type="text" class="link-text-input" value="${linkText}" placeholder="链接显示文字">
                            <label class="link-label">链接地址:</label>
                            <input type="url" class="link-url-input" value="${linkUrl}" placeholder="https://...">
                        </div>
                    `;

                    activityEl.replaceWith(linkEditContainer);
                } else {
                    // 没有链接的普通活动内容可编辑
                    activityEl.contentEditable = 'true';
                }

                // 添加删除按钮
                if (!item.querySelector('.delete-btn')) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.textContent = '删除';
                    deleteBtn.onclick = () => deleteTask(item);
                    item.appendChild(deleteBtn);
                }
            }
        });

        // 添加"新增任务"按钮
        document.querySelectorAll('.card-content').forEach(content => {
            if (!content.querySelector('.add-task-btn')) {
                const addBtn = document.createElement('button');
                addBtn.className = 'add-task-btn';
                addBtn.textContent = '+ 新增任务';
                addBtn.onclick = () => addNewTask(content);
                content.appendChild(addBtn);
            }
        });
    } else {
        // 保存并退出编辑模式
        editBtn.classList.remove('save-mode');
        editBtnText.textContent = '编辑';
        editBtn.querySelector('span:first-child').textContent = '✏️';

        // 移除所有卡片的编辑模式类
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('editing');
        });

        // 收集所有数据并保存
        const allScheduleData = {};

        document.querySelectorAll('.card').forEach(card => {
            const cardClass = card.className.split(' ').find(c => ['morning', 'noon', 'afternoon', 'evening'].includes(c));
            const tasks = [];

            card.querySelectorAll('.time-item').forEach(item => {
                const timeInputs = item.querySelector('.time-inputs');
                let activityEl = item.querySelector('.activity');
                const linkEditContainer = item.querySelector('.link-edit-container');

                let startTime, endTime;

                if (timeInputs) {
                    // 从时间选择器读取
                    const startInput = timeInputs.querySelector('.start-time');
                    const endInput = timeInputs.querySelector('.end-time');
                    startTime = startInput ? startInput.value : '00:00';
                    endTime = endInput ? endInput.value : '00:00';

                    // 恢复为文本显示
                    const timeText = startTime === endTime ? startTime : `${startTime} - ${endTime}`;
                    const timeSpan = document.createElement('span');
                    timeSpan.className = 'time';
                    timeSpan.textContent = timeText;
                    timeInputs.replaceWith(timeSpan);
                } else {
                    // 如果没有时间输入器，从 data 属性读取
                    startTime = item.getAttribute('data-start') || '00:00';
                    endTime = item.getAttribute('data-end') || '00:00';
                }

                // 处理链接编辑容器
                if (linkEditContainer) {
                    const activityTextInput = linkEditContainer.querySelector('.activity-text');
                    const linkTextInput = linkEditContainer.querySelector('.link-text-input');
                    const linkUrlInput = linkEditContainer.querySelector('.link-url-input');

                    const activityText = activityTextInput ? activityTextInput.value : '';
                    const linkText = linkTextInput ? linkTextInput.value : '';
                    const linkUrl = linkUrlInput ? linkUrlInput.value : '';

                    // 重新创建活动元素，包含更新后的链接
                    const newActivityEl = document.createElement('span');
                    newActivityEl.className = 'activity';

                    // 解析活动文本，找到链接文本的位置并重新构建HTML
                    const linkIndex = activityText.indexOf(linkText);
                    if (linkIndex !== -1 && linkUrl && linkText) {
                        const beforeLink = activityText.substring(0, linkIndex);
                        const afterLink = activityText.substring(linkIndex + linkText.length);
                        newActivityEl.innerHTML = `${beforeLink}<a href="${linkUrl}" target="_blank">${linkText}</a>${afterLink}`;
                    } else {
                        newActivityEl.textContent = activityText;
                    }

                    linkEditContainer.replaceWith(newActivityEl);
                    activityEl = newActivityEl;
                }

                if (activityEl) {
                    tasks.push({
                        startTime,
                        endTime,
                        activity: activityEl.innerHTML
                    });

                    // 更新 data 属性
                    item.setAttribute('data-start', startTime);
                    item.setAttribute('data-end', endTime);

                    // 取消可编辑
                    item.classList.remove('editing');
                    activityEl.contentEditable = 'false';

                    // 移除删除按钮
                    const deleteBtn = item.querySelector('.delete-btn');
                    if (deleteBtn) deleteBtn.remove();
                }
            });

            allScheduleData[cardClass] = tasks;
        });

        // 移除"新增任务"按钮
        document.querySelectorAll('.add-task-btn').forEach(btn => btn.remove());

        // 保存到 Chrome Storage
        chrome.storage.local.set({ allScheduleData: allScheduleData }, () => {
            console.log('日程已保存', allScheduleData);
        });

        originalContents.clear();
    }
}

// 删除任务
function deleteTask(item) {
    if (confirm('确定要删除这个任务吗？')) {
        item.remove();
    }
}

// 添加新任务
function addNewTask(cardContent) {
    const newItem = document.createElement('div');
    newItem.className = 'time-item editing';
    newItem.setAttribute('data-start', '09:00');
    newItem.setAttribute('data-end', '10:00');
    newItem.innerHTML = `
        <div class="time-inputs">
            <input type="time" class="start-time" value="09:00">
            <span class="time-separator">-</span>
            <input type="time" class="end-time" value="10:00">
        </div>
        <span class="activity" contenteditable="true">新任务</span>
        <button class="delete-btn" onclick="this.parentElement.remove()">删除</button>
    `;

    // 在"新增任务"按钮前插入
    const addBtn = cardContent.querySelector('.add-task-btn');
    cardContent.insertBefore(newItem, addBtn);

    // 自动聚焦到活动输入框
    const activityEl = newItem.querySelector('.activity');
    activityEl.focus();
    // 选中所有文本
    const range = document.createRange();
    range.selectNodeContents(activityEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

// 加载保存的日程数据
function loadScheduleData() {
    chrome.storage.local.get(['allScheduleData'], (result) => {
        if (result.allScheduleData) {
            // 清空并重建所有任务
            document.querySelectorAll('.card').forEach(card => {
                const cardClass = card.className.split(' ').find(c => ['morning', 'noon', 'afternoon', 'evening'].includes(c));
                const cardContent = card.querySelector('.card-content');

                if (result.allScheduleData[cardClass]) {
                    // 清空现有内容
                    cardContent.innerHTML = '';

                    // 添加保存的任务
                    result.allScheduleData[cardClass].forEach(task => {
                        const timeText = task.startTime === task.endTime
                            ? task.startTime
                            : `${task.startTime} - ${task.endTime}`;

                        const newItem = document.createElement('div');
                        newItem.className = 'time-item';
                        newItem.setAttribute('data-start', task.startTime);
                        newItem.setAttribute('data-end', task.endTime);
                        newItem.innerHTML = `
                            <span class="time">${timeText}</span>
                            <span class="activity">${task.activity}</span>
                        `;
                        cardContent.appendChild(newItem);
                    });
                }
            });
        }
    });
}

// 每日一句名言
const dailyQuotes = [
    "投资最重要的是避免重大损失。 —— 查理·芒格",
    "在别人贪婪时恐惧，在别人恐惧时贪婪。 —— 沃伦·巴菲特",
    "我们无法改变生命的长度，但可以改变生命的宽度。 —— 苏格拉底",
    "知之为知之，不知为不知，是知也。 —— 孔子",
    "复利是世界第八大奇迹。 —— 阿尔伯特·爱因斯坦",
    "时间是最好的投资，也是最公平的资源。 —— 本杰明·富兰克林",
    "人生就像滚雪球，最重要的是找到很湿的雪和很长的坡。 —— 沃伦·巴菲特",
    "认识自己是一切智慧的开端。 —— 亚里士多德",
    "长期来看，我们都是死人。 —— 凯恩斯",
    "投资不是关于击败别人，而是关于控制自己。 —— 本杰明·格雷厄姆",
    "真正的知识是知道自己无知的程度。 —— 苏格拉底",
    "时间和耐心是最强有力的战士。 —— 列夫·托尔斯泰",
    "价格是你付出的，价值是你得到的。 —— 沃伦·巴菲特",
    "活在当下，但为未来储蓄。 —— 查理·芒格",
    "最好的投资是投资自己。 —— 沃伦·巴菲特"
];

// 显示每日一句
function showDailyQuote() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const quoteIndex = dayOfYear % dailyQuotes.length;
    const quoteElement = document.getElementById('dailyQuote');
    if (quoteElement) {
        quoteElement.textContent = `"${dailyQuotes[quoteIndex]}"`;
    }
}

// 标签切换功能
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // 移除所有激活状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 激活当前标签
            btn.classList.add('active');
            if (targetTab === 'today') {
                document.getElementById('todayTab').classList.add('active');
            } else if (targetTab === 'schedule') {
                document.getElementById('scheduleTab').classList.add('active');
            }
        });
    });
}

// 初始化
updateTime();
setInterval(updateTime, 1000);

// 加载保存的数据
loadScheduleData();

// 显示每日一句
showDailyQuote();

// 初始化标签切换
initTabs();

// 绑定编辑按钮事件
document.getElementById('editBtn').addEventListener('click', toggleEditMode);

// ============ 番茄钟倒计时功能 ============
let pomodoroTimer = null;
let pomodoroSeconds = 35 * 60; // 默认35分钟
let pomodoroTotalSeconds = 35 * 60;
let pomodoroIsRunning = false;
let pomodoroIsBreak = false;

// 更新倒计时显示
function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroSeconds / 60);
    const seconds = pomodoroSeconds % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const timeElement = document.getElementById('pomodoroTime');
    const progressBar = document.getElementById('pomodoroProgress');

    if (timeElement) {
        timeElement.textContent = timeString;

        if (pomodoroIsRunning) {
            timeElement.classList.add(pomodoroIsBreak ? 'break' : 'running');
            timeElement.classList.remove(pomodoroIsBreak ? 'running' : 'break');
        } else {
            timeElement.classList.remove('running', 'break');
        }
    }

    if (progressBar) {
        const progress = ((pomodoroTotalSeconds - pomodoroSeconds) / pomodoroTotalSeconds) * 100;
        progressBar.style.width = `${progress}%`;

        if (pomodoroIsBreak) {
            progressBar.classList.add('break');
        } else {
            progressBar.classList.remove('break');
        }
    }
}

// 开始倒计时
function startPomodoro() {
    if (pomodoroIsRunning) return;

    pomodoroIsRunning = true;
    document.getElementById('pomodoroStart').style.display = 'none';
    document.getElementById('pomodoroPause').style.display = 'block';

    pomodoroTimer = setInterval(() => {
        if (pomodoroSeconds > 0) {
            pomodoroSeconds--;
            updatePomodoroDisplay();
        } else {
            // 倒计时结束
            clearInterval(pomodoroTimer);
            pomodoroIsRunning = false;
            playAlarm();

            if (!pomodoroIsBreak) {
                // 工作时间结束，开始5分钟休息
                setTimeout(() => {
                    pomodoroIsBreak = true;
                    pomodoroSeconds = 5 * 60;
                    pomodoroTotalSeconds = 5 * 60;
                    updatePomodoroDisplay();
                    startPomodoro();
                }, 2000);
            } else {
                // 休息结束，重置为工作模式
                setTimeout(() => {
                    pomodoroIsBreak = false;
                    const activePreset = document.querySelector('.preset-btn.active');
                    const minutes = activePreset ? parseInt(activePreset.getAttribute('data-minutes')) : 35;
                    pomodoroSeconds = minutes * 60;
                    pomodoroTotalSeconds = minutes * 60;
                    updatePomodoroDisplay();
                    startPomodoro();
                }, 2000);
            }
        }
    }, 1000);

    updatePomodoroDisplay();
}

// 暂停倒计时
function pausePomodoro() {
    if (!pomodoroIsRunning) return;

    clearInterval(pomodoroTimer);
    pomodoroIsRunning = false;
    document.getElementById('pomodoroStart').style.display = 'block';
    document.getElementById('pomodoroPause').style.display = 'none';
    updatePomodoroDisplay();
}

// 重置倒计时
function resetPomodoro() {
    clearInterval(pomodoroTimer);
    pomodoroIsRunning = false;
    pomodoroIsBreak = false;

    const activePreset = document.querySelector('.preset-btn.active');
    const minutes = activePreset ? parseInt(activePreset.getAttribute('data-minutes')) : 35;
    pomodoroSeconds = minutes * 60;
    pomodoroTotalSeconds = minutes * 60;

    document.getElementById('pomodoroStart').style.display = 'block';
    document.getElementById('pomodoroPause').style.display = 'none';
    updatePomodoroDisplay();
}

// 播放闹铃
function playAlarm() {
    // 使用浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(pomodoroIsBreak ? '休息时间到！' : '专注时间结束！', {
            body: pomodoroIsBreak ? '休息结束，准备开始下一轮专注' : '做得好！休息5分钟吧',
            icon: '/icons/icon48.png',
            requireInteraction: false
        });
    }

    // 播放系统提示音（使用 Web Audio API）
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

        // 三声提示
        setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 800;
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc2.start(audioContext.currentTime);
            osc2.stop(audioContext.currentTime + 0.5);
        }, 300);

        setTimeout(() => {
            const osc3 = audioContext.createOscillator();
            const gain3 = audioContext.createGain();
            osc3.connect(gain3);
            gain3.connect(audioContext.destination);
            osc3.frequency.value = 800;
            osc3.type = 'sine';
            gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            osc3.start(audioContext.currentTime);
            osc3.stop(audioContext.currentTime + 0.5);
        }, 600);
    } catch (error) {
        console.log('无法播放提示音:', error);
    }
}

// 预设时间按钮事件
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (pomodoroIsRunning) {
            if (!confirm('正在进行中，确定要切换时间吗？')) {
                return;
            }
            pausePomodoro();
        }

        // 更新激活状态
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 重置倒计时
        const minutes = parseInt(btn.getAttribute('data-minutes'));
        pomodoroSeconds = minutes * 60;
        pomodoroTotalSeconds = minutes * 60;
        pomodoroIsBreak = false;
        updatePomodoroDisplay();
    });
});

// 控制按钮事件
document.getElementById('pomodoroStart').addEventListener('click', startPomodoro);
document.getElementById('pomodoroPause').addEventListener('click', pausePomodoro);
document.getElementById('pomodoroReset').addEventListener('click', resetPomodoro);

// 请求通知权限
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// 初始化番茄钟显示
updatePomodoroDisplay();
