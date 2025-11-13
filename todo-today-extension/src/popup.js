class TodoManager {
  constructor() {
    this.tasks = [];
    this.reminderInterval = null;
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.loadData();
    this.updateDisplay();
    this.updateDateDisplay();
    this.checkReminders();
  }
  
  bindEvents() {
    // 添加任务
    document.getElementById('addBtn').addEventListener('click', () => this.addTask());
    document.getElementById('taskInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });
    
    // 自动提醒开关
    document.getElementById('autoReminder').addEventListener('change', (e) => {
      this.setAutoReminder(e.target.checked);
    });
    
    // 清除已完成
    document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
    
    // 每小时更新显示
    setInterval(() => this.updateDisplay(), 60000); // 每分钟检查一次
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  addTask() {
    const taskInput = document.getElementById('taskInput');
    const timeInput = document.getElementById('timeInput');
    
    const text = taskInput.value.trim();
    if (!text) {
      this.showNotification('请输入任务内容');
      return;
    }
    
    const task = {
      id: this.generateId(),
      text: text,
      time: timeInput.value || null,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    
    this.tasks.push(task);
    taskInput.value = '';
    timeInput.value = '';
    
    this.saveData();
    this.updateDisplay();
    this.showNotification('任务添加成功！');
    
    // 设置任务提醒
    if (task.time) {
      this.scheduleTaskReminder(task);
    }
  }
  
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      
      this.saveData();
      this.updateDisplay();
      
      if (task.completed) {
        this.showNotification(`✅ 完成任务: ${task.text}`);
      }
    }
  }
  
  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveData();
    this.updateDisplay();
    this.showNotification('任务已删除');
  }
  
  clearCompleted() {
    this.tasks = this.tasks.filter(t => !t.completed);
    this.saveData();
    this.updateDisplay();
    this.showNotification('已清除所有已完成任务');
  }
  
  updateDisplay() {
    this.renderTasks();
    this.updateProgress();
    this.updateStats();
  }
  
  renderTasks() {
    const taskList = document.getElementById('taskList');
    const clearBtn = document.getElementById('clearCompleted');
    
    if (this.tasks.length === 0) {
      taskList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无任务</div>
          <div class="empty-subtext">添加你的第一个今日任务吧！</div>
        </div>
      `;
      clearBtn.style.display = 'none';
      return;
    }
    
    const hasCompleted = this.tasks.some(t => t.completed);
    clearBtn.style.display = hasCompleted ? 'block' : 'none';
    
    // 按时间和完成状态排序
    const sortedTasks = [...this.tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });
    
    taskList.innerHTML = sortedTasks.map(task => {
      const isOverdue = task.time && !task.completed && this.isOverdue(task.time);
      return `
        <div class="task-item ${task.completed ? 'completed' : ''}">
          <input type="checkbox" class="task-checkbox" 
                 ${task.completed ? 'checked' : ''} 
                 data-id="${task.id}">
          <div class="task-content">
            <div class="task-text">${this.escapeHtml(task.text)}</div>
            ${task.time ? `
              <div class="task-time ${isOverdue ? 'overdue' : ''}">
                🕐 ${task.time} ${isOverdue ? '(已逾期)' : ''}
              </div>
            ` : ''}
          </div>
          <div class="task-actions">
            <button class="action-btn delete-btn" data-delete="${task.id}">删除</button>
          </div>
        </div>
      `;
    }).join('');
    
    // 绑定事件
    taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.toggleTask(e.target.dataset.id);
      });
    });
    
    taskList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (confirm('确定要删除这个任务吗？')) {
          this.deleteTask(e.target.dataset.delete);
        }
      });
    });
  }
  
  updateProgress() {
    const completed = this.tasks.filter(t => t.completed).length;
    const total = this.tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('progressPercentage').textContent = percentage + '%';
    document.getElementById('progressBar').style.width = percentage + '%';
    
    // 更新图标徽章
    this.updateBadge(completed, total);
  }
  
  updateStats() {
    const completed = this.tasks.filter(t => t.completed).length;
    const total = this.tasks.length;
    const remaining = total - completed;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('remainingTasks').textContent = remaining;
  }
  
  updateBadge(completed, total) {
    if (chrome.action) {
      if (total === 0) {
        chrome.action.setBadgeText({ text: '' });
      } else if (completed === total) {
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
      } else {
        chrome.action.setBadgeText({ text: remaining.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#FF9800' });
      }
    }
  }
  
  updateDateDisplay() {
    const now = new Date();
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    };
    document.getElementById('dateDisplay').textContent = 
      now.toLocaleDateString('zh-CN', options);
  }
  
  isOverdue(timeString) {
    const now = new Date();
    const [hours, minutes] = timeString.split(':');
    const taskTime = new Date();
    taskTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return now > taskTime;
  }
  
  scheduleTaskReminder(task) {
    if (!chrome.alarms) return;
    
    const [hours, minutes] = task.time.split(':');
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes) - 15, 0, 0); // 提前15分钟提醒
    
    if (reminderTime > now) {
      chrome.alarms.create(`task_${task.id}`, { when: reminderTime.getTime() });
    }
  }
  
  setAutoReminder(enabled) {
    if (enabled) {
      // 每小时提醒
      chrome.alarms.create('hourlyReminder', { periodInMinutes: 60 });
      this.showNotification('✅ 已开启每小时提醒');
    } else {
      chrome.alarms.clear('hourlyReminder');
      this.showNotification('❌ 已关闭每小时提醒');
    }
  }
  
  checkReminders() {
    chrome.storage.sync.get(['autoReminder'], (result) => {
      document.getElementById('autoReminder').checked = result.autoReminder || false;
    });
  }
  
  showNotification(message) {
    // 创建临时通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #667eea;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  saveData() {
    const data = {
      tasks: this.tasks,
      autoReminder: document.getElementById('autoReminder').checked
    };
    chrome.storage.sync.set(data);
  }
  
  loadData() {
    chrome.storage.sync.get(['tasks', 'autoReminder'], (result) => {
      this.tasks = result.tasks || [];
      
      // 清理过期任务（保留今天的）
      const today = new Date().toDateString();
      this.tasks = this.tasks.filter(task => {
        const taskDate = new Date(task.createdAt).toDateString();
        return taskDate === today || !task.completed;
      });
      
      if (result.autoReminder !== undefined) {
        document.getElementById('autoReminder').checked = result.autoReminder;
      }
    });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new TodoManager();
});