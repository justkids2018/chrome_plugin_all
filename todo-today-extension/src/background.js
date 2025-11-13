// 后台服务 - 处理提醒和通知

// 扩展安装或更新时初始化
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Todo Today Extension installed/updated');
  
  if (details.reason === 'install') {
    // 设置默认值
    chrome.storage.sync.set({
      tasks: [],
      autoReminder: false
    });
  }
});

// 监听 alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered:', alarm.name);
  
  if (alarm.name === 'hourlyReminder') {
    handleHourlyReminder();
  } else if (alarm.name.startsWith('task_')) {
    handleTaskReminder(alarm.name);
  }
});

// 处理每小时提醒
async function handleHourlyReminder() {
  try {
    const result = await chrome.storage.sync.get(['tasks']);
    const tasks = result.tasks || [];
    
    if (tasks.length === 0) return;
    
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const remaining = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    let message = '';
    if (remaining === 0) {
      message = '🎉 恭喜！您已完成今日所有任务！';
    } else {
      message = `⏰ 任务提醒：今日还有 ${remaining} 个任务待完成 (${percentage}%已完成)`;
    }
    
    // 获取活跃标签页以显示通知
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 显示桌面通知
    chrome.notifications.create('hourlyReminder', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '今日任务提醒',
      message: message,
      priority: 2
    });
    
    console.log('Hourly reminder sent:', message);
  } catch (error) {
    console.error('Error in hourly reminder:', error);
  }
}

// 处理单个任务提醒
async function handleTaskReminder(alarmName) {
  try {
    const taskId = alarmName.replace('task_', '');
    const result = await chrome.storage.sync.get(['tasks']);
    const tasks = result.tasks || [];
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
    
    chrome.notifications.create(`task_${taskId}`, {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⏰ 任务即将到期',
      message: `任务 "${task.text}" 将在15分钟后到期！`,
      priority: 2
    });
    
    console.log('Task reminder sent for:', task.text);
  } catch (error) {
    console.error('Error in task reminder:', error);
  }
}

// 当扩展启动时检查是否需要设置提醒
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  checkAndSetupReminders();
});

// 检查并设置提醒
async function checkAndSetupReminders() {
  try {
    const result = await chrome.storage.sync.get(['autoReminder']);
    
    if (result.autoReminder) {
      // 设置每小时提醒
      await chrome.alarms.create('hourlyReminder', { periodInMinutes: 60 });
      console.log('Hourly reminder alarm set');
    } else {
      await chrome.alarms.clear('hourlyReminder');
    }
  } catch (error) {
    console.error('Error setting up reminders:', error);
  }
}

// 监听存储变化 - 当用户切换提醒设置时
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.autoReminder) {
    checkAndSetupReminders();
  }
});

// 通知点击处理
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'hourlyReminder' || notificationId.startsWith('task_')) {
    // 点击通知时打开扩展弹窗
    chrome.action.openPopup();
  }
});

// 处理来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTasks') {
    chrome.storage.sync.get(['tasks'], (result) => {
      sendResponse({ tasks: result.tasks || [] });
    });
    return true;
  }
  
  if (request.action === 'setupTaskReminder') {
    const { taskId, reminderTime } = request;
    chrome.alarms.create(`task_${taskId}`, { when: reminderTime });
    sendResponse({ success: true });
  }
});

// 定时清理过期任务（每天凌晨）
chrome.alarms.create('cleanupTasks', { periodInMinutes: 60 }); // 每小时检查

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupTasks') {
    cleanupOldTasks();
  }
});

// 清理过期任务
async function cleanupOldTasks() {
  try {
    const result = await chrome.storage.sync.get(['tasks']);
    let tasks = result.tasks || [];
    
    const today = new Date().toDateString();
    const originalLength = tasks.length;
    
    tasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt).toDateString();
      // 保留今天的任务或未完成的任务
      return taskDate === today || !task.completed;
    });
    
    if (tasks.length !== originalLength) {
      await chrome.storage.sync.set({ tasks });
      console.log(`Cleaned up ${originalLength - tasks.length} old tasks`);
    }
  } catch (error) {
    console.error('Error cleaning up tasks:', error);
  }
}