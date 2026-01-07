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

    // 更新年份显示
    const countdownYearElement = document.getElementById('countdownYear');
    if (countdownYearElement) {
        countdownYearElement.textContent = `${currentYear}年倒计时`;
    }

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

// ==================== 每日任务功能 ====================

// 获取今天的日期字符串 (YYYY-MM-DD)
function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 获取今天的存储键名
function getTodayStorageKey() {
    return `dailyTasks_${getTodayDateString()}`;
}

// 加载每日任务
function loadDailyTasks() {
    const storageKey = getTodayStorageKey();
    chrome.storage.local.get([storageKey], (result) => {
        const tasks = result[storageKey] || [];
        renderDailyTasks(tasks);
    });
}

// 渲染每日任务列表
function renderDailyTasks(tasks) {
    const dailyTasksList = document.getElementById('dailyTasksList');
    if (!dailyTasksList) return;

    if (tasks.length === 0) {
        dailyTasksList.innerHTML = '<div class="no-tasks">暂无任务，点击上方添加新任务</div>';
        return;
    }

    // 按时间排序：有时间的在前，无时间的在后
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.startTime && !b.startTime) return -1;
        if (!a.startTime && b.startTime) return 1;
        if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        return a.createdAt - b.createdAt;
    });

    // 获取当前时间
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    dailyTasksList.innerHTML = sortedTasks.map(task => {
        let itemClass = 'daily-task-item';

        // 判断任务状态
        if (task.completed) {
            itemClass += ' completed';
        } else if (task.startTime) {
            const [startHour, startMinute] = task.startTime.split(':').map(Number);
            const startTimeInMinutes = startHour * 60 + startMinute;

            let endTimeInMinutes = startTimeInMinutes + 60; // 默认1小时
            if (task.endTime) {
                const [endHour, endMinute] = task.endTime.split(':').map(Number);
                endTimeInMinutes = endHour * 60 + endMinute;
            }

            // 当前时间在任务时间范围内
            if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
                itemClass += ' current';
            } else if (currentTimeInMinutes >= endTimeInMinutes) {
                itemClass += ' overdue';
            }
        }

        // 显示时间
        let timeDisplay = '';
        if (task.startTime) {
            if (task.endTime && task.endTime !== task.startTime) {
                timeDisplay = `<div class="daily-task-time" data-action="edit-time" data-start="${task.startTime}" data-end="${task.endTime}">${task.startTime}-${task.endTime}</div>`;
            } else {
                timeDisplay = `<div class="daily-task-time" data-action="edit-time" data-start="${task.startTime}" data-end="">${task.startTime}</div>`;
            }
        }

        return `
            <div class="${itemClass}" data-task-id="${task.id}">
                <div class="daily-task-checkbox ${task.completed ? 'checked' : ''}"
                     data-action="toggle"></div>
                <div class="daily-task-content-wrapper">
                    ${timeDisplay}
                    <div class="daily-task-text"
                         contenteditable="false"
                         data-action="edit"
                         data-original-text="${escapeHtml(task.text)}">${escapeHtml(task.text)}</div>
                </div>
                <button class="daily-task-edit" data-action="edit-btn" title="编辑">✎</button>
                <button class="daily-task-delete" data-action="delete" title="删除">×</button>
            </div>
        `;
    }).join('');

    // 添加事件委托
    dailyTasksList.querySelectorAll('.daily-task-item').forEach(item => {
        const taskId = item.getAttribute('data-task-id');

        const checkbox = item.querySelector('[data-action="toggle"]');
        if (checkbox) {
            checkbox.addEventListener('click', () => toggleTaskComplete(taskId));
        }

        const timeEl = item.querySelector('[data-action="edit-time"]');
        if (timeEl) {
            timeEl.addEventListener('click', () => {
                const currentStartTime = timeEl.getAttribute('data-start') || '';
                const currentEndTime = timeEl.getAttribute('data-end') || '';

                // 创建时间编辑容器
                const timeEditContainer = document.createElement('div');
                timeEditContainer.style.display = 'flex';
                timeEditContainer.style.gap = '4px';
                timeEditContainer.style.alignItems = 'center';
                timeEditContainer.className = 'daily-task-time editing';

                const startInput = document.createElement('input');
                startInput.type = 'time';
                startInput.value = currentStartTime;
                startInput.style.width = '70px';
                startInput.style.fontSize = '0.85em';
                startInput.style.border = '1px solid #667eea';
                startInput.style.borderRadius = '4px';
                startInput.style.padding = '2px 4px';

                const separator = document.createElement('span');
                separator.textContent = '-';
                separator.style.color = '#999';

                const endInput = document.createElement('input');
                endInput.type = 'time';
                endInput.value = currentEndTime;
                endInput.style.width = '70px';
                endInput.style.fontSize = '0.85em';
                endInput.style.border = '1px solid #667eea';
                endInput.style.borderRadius = '4px';
                endInput.style.padding = '2px 4px';

                timeEditContainer.appendChild(startInput);
                timeEditContainer.appendChild(separator);
                timeEditContainer.appendChild(endInput);

                const saveTime = () => {
                    const newStartTime = startInput.value;
                    const newEndTime = endInput.value;
                    if (newStartTime && (newStartTime !== currentStartTime || newEndTime !== currentEndTime)) {
                        updateTaskTime(taskId, newStartTime, newEndTime);
                    } else {
                        timeEl.style.display = '';
                        timeEditContainer.remove();
                    }
                };

                startInput.addEventListener('blur', (e) => {
                    if (!timeEditContainer.contains(e.relatedTarget)) {
                        setTimeout(saveTime, 100);
                    }
                });

                endInput.addEventListener('blur', (e) => {
                    if (!timeEditContainer.contains(e.relatedTarget)) {
                        setTimeout(saveTime, 100);
                    }
                });

                startInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        endInput.focus();
                    }
                    if (e.key === 'Escape') {
                        timeEl.style.display = '';
                        timeEditContainer.remove();
                    }
                });

                endInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        saveTime();
                    }
                    if (e.key === 'Escape') {
                        timeEl.style.display = '';
                        timeEditContainer.remove();
                    }
                });

                timeEl.style.display = 'none';
                timeEl.parentNode.insertBefore(timeEditContainer, timeEl);
                startInput.focus();
            });
        }

        const textEl = item.querySelector('[data-action="edit"]');
        const editBtn = item.querySelector('[data-action="edit-btn"]');

        // 点击编辑按钮或文本进入编辑模式
        const enableEdit = () => {
            textEl.contentEditable = 'true';
            textEl.classList.add('editing');
            textEl.focus();
            // 选中所有文本
            const range = document.createRange();
            range.selectNodeContents(textEl);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        };

        if (editBtn) {
            editBtn.addEventListener('click', enableEdit);
        }

        if (textEl) {
            textEl.addEventListener('dblclick', enableEdit);

            // 按回车保存
            textEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    textEl.blur();
                }
                if (e.key === 'Escape') {
                    textEl.textContent = textEl.getAttribute('data-original-text');
                    textEl.blur();
                }
            });

            // 失去焦点时保存
            textEl.addEventListener('blur', () => {
                const newText = textEl.textContent.trim();
                if (newText && newText !== textEl.getAttribute('data-original-text')) {
                    updateTaskText(taskId, newText);
                } else if (!newText) {
                    textEl.textContent = textEl.getAttribute('data-original-text');
                }
                textEl.contentEditable = 'false';
                textEl.classList.remove('editing');
            });
        }

        const deleteBtn = item.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteDailyTask(taskId));
        }
    });
}

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 添加新任务
function addDailyTask() {
    const input = document.getElementById('newTaskInput');
    const startTimeInput = document.getElementById('newTaskTime');
    const endTimeInput = document.getElementById('newTaskEndTime');
    const taskText = input.value.trim();

    if (!taskText) return;

    const storageKey = getTodayStorageKey();
    chrome.storage.local.get([storageKey], (result) => {
        const tasks = result[storageKey] || [];
        const newTask = {
            id: `task_${Date.now()}`,
            text: taskText,
            startTime: startTimeInput.value || null,
            endTime: endTimeInput.value || null,
            completed: false,
            createdAt: Date.now()
        };

        tasks.push(newTask);

        chrome.storage.local.set({ [storageKey]: tasks }, () => {
            renderDailyTasks(tasks);
            input.value = '';
            startTimeInput.value = '';
            endTimeInput.value = '';
            input.focus();
        });
    });
}

// 切换任务完成状态
function toggleTaskComplete(taskId) {
    const storageKey = getTodayStorageKey();
    chrome.storage.local.get([storageKey], (result) => {
        const tasks = result[storageKey] || [];
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            task.completed = !task.completed;
            chrome.storage.local.set({ [storageKey]: tasks }, () => {
                renderDailyTasks(tasks);
            });
        }
    });
}

// 更新任务文本
function updateTaskText(taskId, newText) {
    const storageKey = getTodayStorageKey();
    chrome.storage.local.get([storageKey], (result) => {
        const tasks = result[storageKey] || [];
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            task.text = newText;
            chrome.storage.local.set({ [storageKey]: tasks }, () => {
                renderDailyTasks(tasks);
            });
        }
    });
}

// 更新任务时间
function updateTaskTime(taskId, newStartTime, newEndTime) {
    const storageKey = getTodayStorageKey();
    chrome.storage.local.get([storageKey], (result) => {
        const tasks = result[storageKey] || [];
        const task = tasks.find(t => t.id === taskId);

        if (task) {
            task.startTime = newStartTime;
            task.endTime = newEndTime || null;
            chrome.storage.local.set({ [storageKey]: tasks }, () => {
                renderDailyTasks(tasks);
            });
        }
    });
}

// 删除每日任务
function deleteDailyTask(taskId) {
    const storageKey = getTodayStorageKey();
    chrome.storage.local.get([storageKey], (result) => {
        const tasks = result[storageKey] || [];
        const filteredTasks = tasks.filter(t => t.id !== taskId);

        chrome.storage.local.set({ [storageKey]: filteredTasks }, () => {
            renderDailyTasks(filteredTasks);
        });
    });
}

// 初始化每日任务功能
function initDailyTasks() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const newTaskInput = document.getElementById('newTaskInput');

    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addDailyTask);
    }

    if (newTaskInput) {
        newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addDailyTask();
            }
        });
    }

    // 加载今天的任务
    loadDailyTasks();
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
                if (forceScroll || !hasScrolledToActive) {
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

// 加载保存的日程数据
function loadScheduleData() {
    chrome.storage.local.get(['allScheduleData'], (result) => {
        document.querySelectorAll('.card').forEach(card => {
            const cardClass = card.className.split(' ').find(c => ['morning', 'noon', 'afternoon', 'evening'].includes(c));
            const cardContent = card.querySelector('.card-content');

            if (result.allScheduleData && result.allScheduleData[cardClass]) {
                // 有保存的数据，清空并重建
                cardContent.innerHTML = '';

                // 按开始时间排序任务
                const sortedTasks = [...result.allScheduleData[cardClass]].sort((a, b) => {
                    return a.startTime.localeCompare(b.startTime);
                });

                // 添加排序后的任务
                sortedTasks.forEach(task => {
                    const newItem = createScheduleTaskItem(task, cardClass);
                    cardContent.appendChild(newItem);
                });
            } else {
                // 没有保存的数据，为HTML中的静态元素添加事件监听器
                cardContent.querySelectorAll('.time-item').forEach(item => {
                    const startTime = item.getAttribute('data-start');
                    const endTime = item.getAttribute('data-end');
                    const timeEl = item.querySelector('.time');
                    const activityEl = item.querySelector('.activity');

                    if (timeEl && activityEl && startTime && endTime) {
                        // 添加editable类
                        timeEl.classList.add('editable');
                        activityEl.classList.add('editable');

                        // 添加删除按钮（如果不存在）
                        if (!item.querySelector('.schedule-task-delete')) {
                            const deleteBtn = document.createElement('button');
                            deleteBtn.className = 'schedule-task-delete';
                            deleteBtn.title = '删除';
                            deleteBtn.textContent = '×';
                            deleteBtn.addEventListener('click', () => {
                                deleteScheduleTask(item, cardClass);
                            });
                            item.appendChild(deleteBtn);
                        }

                        // 时间点击编辑
                        timeEl.addEventListener('click', () => {
                            editScheduleTaskTime(item, cardClass);
                        });

                        // 活动双击编辑
                        activityEl.addEventListener('dblclick', () => {
                            editScheduleTaskActivity(item, cardClass);
                        });
                    }
                });
            }
        });
    });
}

// 创建日程表任务项元素
function createScheduleTaskItem(task, cardClass) {
    const timeText = task.startTime === task.endTime
        ? task.startTime
        : `${task.startTime} - ${task.endTime}`;

    const newItem = document.createElement('div');
    newItem.className = 'time-item';
    newItem.setAttribute('data-start', task.startTime);
    newItem.setAttribute('data-end', task.endTime);
    newItem.innerHTML = `
        <span class="time editable">${timeText}</span>
        <span class="activity editable">${task.activity}</span>
        <button class="schedule-task-delete" title="删除">×</button>
    `;

    // 时间点击编辑
    const timeEl = newItem.querySelector('.time');
    timeEl.addEventListener('click', () => {
        editScheduleTaskTime(newItem, cardClass);
    });

    // 活动双击编辑
    const activityEl = newItem.querySelector('.activity');
    activityEl.addEventListener('dblclick', () => {
        editScheduleTaskActivity(newItem, cardClass);
    });

    // 删除按钮
    const deleteBtn = newItem.querySelector('.schedule-task-delete');
    deleteBtn.addEventListener('click', () => {
        deleteScheduleTask(newItem, cardClass);
    });

    return newItem;
}

// 编辑日程表任务时间
function editScheduleTaskTime(item, cardClass) {
    const timeEl = item.querySelector('.time');
    const currentStartTime = item.getAttribute('data-start') || '09:00';
    const currentEndTime = item.getAttribute('data-end') || '10:00';

    // 创建时间编辑容器
    const timeEditContainer = document.createElement('div');
    timeEditContainer.style.display = 'flex';
    timeEditContainer.style.gap = '4px';
    timeEditContainer.style.alignItems = 'center';

    const startInput = document.createElement('input');
    startInput.type = 'time';
    startInput.value = currentStartTime;
    startInput.style.fontSize = '0.85em';
    startInput.style.border = '1px solid #667eea';
    startInput.style.borderRadius = '4px';
    startInput.style.padding = '2px 4px';

    const separator = document.createElement('span');
    separator.textContent = '-';
    separator.style.color = '#999';
    separator.className = 'time-separator';

    const endInput = document.createElement('input');
    endInput.type = 'time';
    endInput.value = currentEndTime;
    endInput.style.fontSize = '0.85em';
    endInput.style.border = '1px solid #667eea';
    endInput.style.borderRadius = '4px';
    endInput.style.padding = '2px 4px';

    timeEditContainer.appendChild(startInput);
    timeEditContainer.appendChild(separator);
    timeEditContainer.appendChild(endInput);

    const saveTime = () => {
        const newStartTime = startInput.value || currentStartTime;
        const newEndTime = endInput.value || currentEndTime;

        // 更新显示
        const timeText = newStartTime === newEndTime ? newStartTime : `${newStartTime} - ${newEndTime}`;
        timeEl.textContent = timeText;

        // 更新数据属性
        item.setAttribute('data-start', newStartTime);
        item.setAttribute('data-end', newEndTime);

        // 恢复时间显示
        timeEl.style.display = '';
        timeEditContainer.remove();

        // 保存到存储
        saveScheduleData(cardClass);
    };

    startInput.addEventListener('blur', (e) => {
        if (!timeEditContainer.contains(e.relatedTarget)) {
            setTimeout(saveTime, 100);
        }
    });

    endInput.addEventListener('blur', (e) => {
        if (!timeEditContainer.contains(e.relatedTarget)) {
            setTimeout(saveTime, 100);
        }
    });

    startInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            endInput.focus();
        }
        if (e.key === 'Escape') {
            timeEl.style.display = '';
            timeEditContainer.remove();
        }
    });

    endInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveTime();
        }
        if (e.key === 'Escape') {
            timeEl.style.display = '';
            timeEditContainer.remove();
        }
    });

    timeEl.style.display = 'none';
    timeEl.parentNode.insertBefore(timeEditContainer, timeEl);
    startInput.focus();
}

// 编辑日程表任务活动
function editScheduleTaskActivity(item, cardClass) {
    const activityEl = item.querySelector('.activity');
    const originalContent = activityEl.innerHTML;

    activityEl.contentEditable = 'true';
    activityEl.classList.add('editing');
    activityEl.focus();

    // 选中所有文本
    const range = document.createRange();
    range.selectNodeContents(activityEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    const saveActivity = () => {
        const newContent = activityEl.innerHTML.trim();
        if (!newContent) {
            activityEl.innerHTML = originalContent;
        }
        activityEl.contentEditable = 'false';
        activityEl.classList.remove('editing');

        // 保存到存储
        saveScheduleData(cardClass);
    };

    activityEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            activityEl.blur();
        }
        if (e.key === 'Escape') {
            activityEl.innerHTML = originalContent;
            activityEl.blur();
        }
    });

    activityEl.addEventListener('blur', saveActivity, { once: true });
}

// 删除日程表任务
function deleteScheduleTask(item, cardClass) {
    if (confirm('确定要删除这个任务吗？')) {
        item.remove();
        saveScheduleData(cardClass);
    }
}

// 保存日程表数据
function saveScheduleData(cardClass) {
    chrome.storage.local.get(['allScheduleData'], (result) => {
        const allScheduleData = result.allScheduleData || {};

        // 获取该卡片的所有任务
        const card = document.querySelector(`.card.${cardClass}`);
        if (!card) return;

        const tasks = [];
        card.querySelectorAll('.time-item').forEach(item => {
            const startTime = item.getAttribute('data-start');
            const endTime = item.getAttribute('data-end');
            const activityEl = item.querySelector('.activity');

            if (startTime && endTime && activityEl) {
                tasks.push({
                    startTime,
                    endTime,
                    activity: activityEl.innerHTML
                });
            }
        });

        allScheduleData[cardClass] = tasks;

        chrome.storage.local.set({ allScheduleData }, () => {
            console.log('日程已保存', allScheduleData);
        });
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
            } else if (targetTab === 'history') {
                document.getElementById('historyTab').classList.add('active');
                // 切换到历史标签时加载数据
                loadHistoryData();
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

// 初始化每日任务
initDailyTasks();

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

// ==================== 历史任务功能 ====================

let currentFilter = 'week'; // 当前过滤器: week, month, all

// 初始化历史任务功能
function initHistory() {
    // 绑定过滤按钮事件
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.getAttribute('data-filter');

            // 更新按钮状态
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 重新加载历史数据
            loadHistoryData();
        });
    });
}

// 获取所有历史任务数据
function loadHistoryData() {
    chrome.storage.local.get(null, (result) => {
        const historyData = [];
        const today = getTodayDateString();

        // 遍历所有存储的键，找出所有dailyTasks_开头的
        for (const key in result) {
            if (key.startsWith('dailyTasks_')) {
                const dateStr = key.replace('dailyTasks_', '');
                const tasks = result[key] || [];

                if (tasks.length > 0) {
                    historyData.push({
                        date: dateStr,
                        tasks: tasks
                    });
                }
            }
        }

        // 按日期降序排序（最新的在前）
        historyData.sort((a, b) => b.date.localeCompare(a.date));

        // 根据当前过滤器过滤数据
        const filteredData = filterHistoryData(historyData);

        // 计算统计信息
        updateStatistics(filteredData);

        // 渲染历史列表
        renderHistoryList(filteredData);
    });
}

// 根据过滤器过滤历史数据
function filterHistoryData(historyData) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (currentFilter === 'all') {
        return historyData;
    } else if (currentFilter === 'week') {
        // 本周（从周一开始）
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - mondayOffset);

        return historyData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= monday;
        });
    } else if (currentFilter === 'month') {
        // 本月
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return historyData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= firstDayOfMonth;
        });
    }

    return historyData;
}

// 更新统计信息
function updateStatistics(historyData) {
    let totalTasks = 0;
    let completedTasks = 0;

    historyData.forEach(day => {
        totalTasks += day.tasks.length;
        completedTasks += day.tasks.filter(task => task.completed).length;
    });

    // 更新UI
    document.getElementById('totalDays').textContent = historyData.length;
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
}

// 渲染历史任务列表
function renderHistoryList(historyData) {
    const historyList = document.getElementById('historyList');

    if (historyData.length === 0) {
        historyList.innerHTML = `
            <div class="no-history">
                <div class="no-history-icon">📭</div>
                <div>暂无历史任务数据</div>
            </div>
        `;
        return;
    }

    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    historyList.innerHTML = historyData.map((day, index) => {
        const totalTasks = day.tasks.length;
        const completedTasks = day.tasks.filter(task => task.completed).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // 确定完成率等级
        let rateClass = '';
        if (completionRate >= 80) {
            rateClass = 'high';
        } else if (completionRate >= 50) {
            rateClass = 'medium';
        } else {
            rateClass = 'low';
        }

        // 日期显示
        let dateLabel = formatDate(day.date);
        let dateClass = '';
        if (day.date === today) {
            dateLabel = `今天 (${dateLabel})`;
            dateClass = 'today';
        } else if (day.date === yesterday) {
            dateLabel = `昨天 (${dateLabel})`;
            dateClass = 'yesterday';
        }

        // 生成任务详情HTML
        const tasksDetailHTML = day.tasks.map(task => {
            const timeDisplay = task.startTime
                ? (task.endTime && task.endTime !== task.startTime
                    ? `${task.startTime}-${task.endTime}`
                    : task.startTime)
                : '';

            return `
                <div class="history-task-item ${task.completed ? 'completed' : ''}">
                    <div class="history-task-checkbox ${task.completed ? 'completed' : ''}"></div>
                    ${timeDisplay ? `<div class="history-task-time">${timeDisplay}</div>` : ''}
                    <div class="history-task-text">${escapeHtml(task.text)}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="history-day-card" data-index="${index}">
                <div class="history-day-header">
                    <div class="history-date ${dateClass}">${dateLabel}</div>
                    <div class="history-completion">
                        <span class="completion-badge ${rateClass}">${completionRate}%</span>
                    </div>
                </div>

                <div class="progress-bar-container">
                    <div class="progress-bar-fill ${rateClass}" style="width: ${completionRate}%"></div>
                </div>

                <div class="history-tasks-summary">
                    <div class="task-count">
                        <span class="task-count-icon">📝</span>
                        <span>总计 ${totalTasks}</span>
                    </div>
                    <div class="task-count">
                        <span class="task-count-icon">✅</span>
                        <span>完成 ${completedTasks}</span>
                    </div>
                    <div class="task-count">
                        <span class="task-count-icon">⏱️</span>
                        <span>剩余 ${totalTasks - completedTasks}</span>
                    </div>
                </div>

                <button class="expand-btn" onclick="toggleHistoryDetail(${index})">
                    查看详情 ▼
                </button>

                <div class="history-tasks-detail">
                    ${tasksDetailHTML}
                </div>
            </div>
        `;
    }).join('');
}

// 切换历史详情展开/收起
function toggleHistoryDetail(index) {
    const card = document.querySelector(`.history-day-card[data-index="${index}"]`);
    const btn = card.querySelector('.expand-btn');

    if (card.classList.contains('expanded')) {
        card.classList.remove('expanded');
        btn.textContent = '查看详情 ▼';
    } else {
        card.classList.add('expanded');
        btn.textContent = '收起详情 ▲';
    }
}

// 格式化日期显示
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];

    return `${month}月${day}日 ${weekDay}`;
}

// 获取昨天的日期字符串
function getYesterdayDateString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 初始化历史任务功能
initHistory();

// 将toggleHistoryDetail设为全局函数，以便HTML中的onclick可以调用
window.toggleHistoryDetail = toggleHistoryDetail;
