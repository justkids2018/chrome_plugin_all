class MarkdownConverter {
  constructor() {
    this.markdownContent = '';
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.loadOptions();
  }
  
  bindEvents() {
    document.getElementById('convertBtn').addEventListener('click', () => this.convertToMarkdown());
    document.getElementById('copyBtn').addEventListener('click', () => this.copyToClipboard());
    document.getElementById('downloadBtn').addEventListener('click', () => this.downloadMarkdown());
    
    // Auto-save options
    ['includeTitle', 'includeUrl', 'includeMeta', 'filterAds', 'contentSelector'].forEach(id => {
      const element = document.getElementById(id);
      element.addEventListener('change', () => this.saveOptions());
    });
  }
  
  async loadOptions() {
    const options = await chrome.storage.sync.get({
      includeTitle: true,
      includeUrl: true,
      includeMeta: true,
      filterAds: false,
      contentSelector: ''
    });
    
    document.getElementById('includeTitle').checked = options.includeTitle;
    document.getElementById('includeUrl').checked = options.includeUrl;
    document.getElementById('includeMeta').checked = options.includeMeta;
    document.getElementById('filterAds').checked = options.filterAds;
    document.getElementById('contentSelector').value = options.contentSelector;
  }
  
  async saveOptions() {
    const options = {
      includeTitle: document.getElementById('includeTitle').checked,
      includeUrl: document.getElementById('includeUrl').checked,
      includeMeta: document.getElementById('includeMeta').checked,
      filterAds: document.getElementById('filterAds').checked,
      contentSelector: document.getElementById('contentSelector').value
    };
    
    await chrome.storage.sync.set(options);
  }
  
  async convertToMarkdown() {
    const convertBtn = document.getElementById('convertBtn');
    convertBtn.textContent = 'Converting...';
    convertBtn.disabled = true;
    
    try {
      const options = {
        includeTitle: document.getElementById('includeTitle').checked,
        includeUrl: document.getElementById('includeUrl').checked,
        includeMeta: document.getElementById('includeMeta').checked,
        filterAds: document.getElementById('filterAds').checked,
        contentSelector: document.getElementById('contentSelector').value
      };
      
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      // 注入简化的内容脚本
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['src/simple-content.js']
        });
        
        // 等待一小段时间确保脚本加载完成
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (injectError) {
        console.log('Script injection info:', injectError.message);
        // 如果脚本已经注入，继续执行
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'convertToMarkdown',
        options: options
      });
      
      console.log('Response from content script:', response);
      
      if (response && response.success && response.markdown) {
        this.markdownContent = response.markdown;
        this.showMarkdown();
        this.showStatus('Conversion successful!', 'success');
      } else if (response && response.error) {
        throw new Error(response.error);
      } else if (response) {
        console.error('Unexpected response format:', response);
        throw new Error('Unexpected response format from content script');
      } else {
        throw new Error('No response from content script - check console for errors');
      }
    } catch (error) {
      this.showStatus(`Error: ${error.message}`, 'error');
      console.error('Conversion error:', error);
      console.error('Stack trace:', error.stack);
    } finally {
      convertBtn.textContent = 'Convert to Markdown';
      convertBtn.disabled = false;
    }
  }
  
  showMarkdown() {
    const output = document.getElementById('markdownOutput');
    output.value = this.markdownContent;
    output.style.display = 'block';
    output.style.marginTop = '15px';
  }
  
  async copyToClipboard() {
    if (!this.markdownContent) {
      this.showStatus('No content to copy. Please convert first.', 'error');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(this.markdownContent);
      this.showStatus('Copied to clipboard!', 'success');
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.getElementById('markdownOutput');
      textarea.select();
      document.execCommand('copy');
      this.showStatus('Copied to clipboard!', 'success');
    }
  }
  
  downloadMarkdown() {
    if (!this.markdownContent) {
      this.showStatus('No content to download. Please convert first.', 'error');
      return;
    }
    
    const blob = new Blob([this.markdownContent], {type: 'text/markdown'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const date = new Date().toISOString().slice(0, 10);
    const filename = `web-content-${date}.md`;
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    this.showStatus(`Downloaded as ${filename}`, 'success');
  }
  
  showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MarkdownConverter();
});