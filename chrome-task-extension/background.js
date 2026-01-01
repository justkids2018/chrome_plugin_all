// 追踪每个窗口的侧边栏状态
const sidePanelStates = new Map();

// 点击扩展图标时切换侧边栏
chrome.action.onClicked.addListener(async (tab) => {
  const windowId = tab.windowId;
  const isOpen = sidePanelStates.get(windowId) || false;

  if (!isOpen) {
    // 打开侧边栏
    await chrome.sidePanel.open({ windowId });
    sidePanelStates.set(windowId, true);
  } else {
    // 关闭侧边栏（通过发送消息给侧边栏页面）
    try {
      chrome.runtime.sendMessage({ action: 'closeSidePanel', windowId });
      sidePanelStates.set(windowId, false);
    } catch (error) {
      console.log('Error closing side panel:', error);
    }
  }
});

// 监听侧边栏关闭事件（通过 X 按钮关闭时）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sidePanelClosed') {
    sidePanelStates.set(message.windowId, false);
  }
});
