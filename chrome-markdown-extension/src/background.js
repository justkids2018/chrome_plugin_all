// Background service worker for the Markdown converter extension

// Install event - runs when extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Markdown Converter installed');
    // Set default options
    chrome.storage.sync.set({
      includeTitle: true,
      includeUrl: true,
      includeMeta: true,
      filterAds: false,
      contentSelector: ''
    });
  } else if (details.reason === 'update') {
    console.log('Markdown Converter updated');
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'convertToMarkdown') {
    // This message is forwarded to the content script
    // The actual conversion happens in the content script
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getTabInfo') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        sendResponse({
          url: tabs[0].url,
          title: tabs[0].title
        });
      }
    });
    return true; // Keep message channel open for async response
  }
});

// Handle extension icon click (optional additional functionality)
chrome.action.onClicked.addListener((tab) => {
  // Could add quick convert functionality here if needed
  console.log('Extension icon clicked');
});

// Keep service worker alive for longer operations
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
});

// Handle context menu creation (optional feature for future)
chrome.runtime.onInstalled.addListener(() => {
  // Context menu could be added here for right-click conversion
  /*
  chrome.contextMenus.create({
    id: 'convertPage',
    title: 'Convert page to Markdown',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'convertSelection',
    title: 'Convert selection to Markdown',
    contexts: ['selection']
  });
  */
});

/* Example context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'convertPage' || info.menuItemId === 'convertSelection') {
    const action = info.menuItemId === 'convertPage' ? 'convertPage' : 'convertSelection';
    chrome.tabs.sendMessage(tab.id, {action: action});
  }
});
*/