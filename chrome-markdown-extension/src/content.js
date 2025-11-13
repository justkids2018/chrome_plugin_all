// ==EMBEDDED_TURNDOWN_BEGIN==
/*!
 * Turndown Service - Embedded Version
 * Simplified for Chrome Extension
 */
class TurndownService {
  constructor() {
    this.rules = new Rules();
    this.options = {
      headingStyle: 'atx', hr: '---', bulletListMarker: '-',
      codeBlockStyle: 'fenced', fence: '```', emDelimiter: '_',
      strongDelimiter: '**', linkStyle: 'inlined',
      linkReferenceStyle: 'full', br: '  \n'
    };
  }
  turndown(input) {
    if (typeof input === 'string') {
      const doc = (new DOMParser()).parseFromString(input, 'text/html');
      return this.processDocument(doc);
    } else if (input?.nodeType) {
      return this.processDocument(input);
    }
    return '';
  }
  processDocument(doc) {
    const root = doc.body || doc.documentElement;
    root.normalize();
    root.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    return this.processNode(root);
  }
  processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return this.escapeMarkdown(node.textContent || '');
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const rule = this.rules.findRule(node);
      let content = '';
      for (const child of node.childNodes) content += this.processNode(child);
      if (rule?.replacement) return rule.replacement.call(this, content, node);
      const display = window.getComputedStyle(node).display;
      if (display === 'block' || display === 'list-item') return '\n\n' + content + '\n\n';
      return content;
    }
    return '';
  }
  escapeMarkdown(text) {
    return text.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
  }
}

class Rules {
  constructor() {
    this.array = [];
    this.initDefaultRules();
  }
  initDefaultRules() {
    const rules = [
      {filter: 'h1', replacement: c => '\n\n# ' + c + '\n\n'},
      {filter: 'h2', replacement: c => '\n\n## ' + c + '\n\n'},
      {filter: 'h3', replacement: c => '\n\n### ' + c + '\n\n'},
      {filter: 'h4', replacement: c => '\n\n#### ' + c + '\n\n'},
      {filter: 'h5', replacement: c => '\n\n##### ' + c + '\n\n'},
      {filter: 'h6', replacement: c => '\n\n###### ' + c + '\n\n'},
      {filter: 'p', replacement: c => '\n\n' + c + '\n\n'},
      {filter: 'br', replacement: () => '  \n'},
      {filter: 'hr', replacement: () => '\n\n---\n\n'},
      {filter: ['strong', 'b'], replacement: c => '**' + c + '**'},
      {filter: ['em', 'i'], replacement: c => '_' + c + '_'},
      {filter: 'a', replacement: (c, node) => {
        const href = node.getAttribute('href');
        const title = node.getAttribute('title');
        if (!href) return c;
        return title ? '[' + c + '](' + href + ' "' + title + '")' : '[' + c + '](' + href + ')';
      }},
      {filter: 'img', replacement: (c, node) => {
        const alt = node.getAttribute('alt') || '';
        const src = node.getAttribute('src') || '';
        const title = node.getAttribute('title') || '';
        if (!src) return '';
        return title ? '![' + alt + '](' + src + ' "' + title + '")' : '![' + alt + '](' + src + ')';
      }},
      {filter: 'code', replacement: (c, node) => {
        const parent = node.parentNode;
        if (parent?.nodeName.toLowerCase() === 'pre') {
          const langClass = node.getAttribute('class') || '';
          const lang = langClass.match(/language-(\w+)/)?.[1] || '';
          return '\n\n```' + lang + '\n' + c + '\n```\n\n';
        }
        return '`' + c + '`';
      }},
      {filter: 'pre', replacement: (c, node) => {
        const code = node.querySelector('code');
        if (code) {
          const langClass = code.getAttribute('class') || '';
          const lang = langClass.match(/language-(\w+)/)?.[1] || '';
          return '\n\n```' + lang + '\n' + code.textContent + '\n```\n\n';
        }
        return '\n\n```\n' + c + '\n```\n\n';
      }},
      {filter: 'ul', replacement: c => '\n\n' + c + '\n\n'},
      {filter: 'ol', replacement: c => '\n\n' + c + '\n\n'},
      {filter: 'li', replacement: (c, node) => {
        c = c.replace(/^\s+/, '').replace(/\n\n(?!\n)/g, '\n');
        const parent = node.parentNode; const index = Array.from(parent.childNodes).indexOf(node);
        const prefix = parent.nodeName.toLowerCase() === 'ol' ? (index + 1) + '. ' : '- ';
        return prefix + c.replace(/^/gm, '  ') + '\n';
      }},
      {filter: 'blockquote', replacement: c => '\n\n' + c.replace(/^/gm, '> ') + '\n\n'},
      {filter: ['script', 'style', 'noscript', 'iframe', 'object', 'embed'], replacement: () => ''}
    ];
    rules.forEach((rule, i) => {this.array.push({...rule, name: 'rule' + i});});
  }
  findRule(node) {
    for (const rule of this.array) {
      if (typeof rule.filter === 'string' && rule.filter === node.nodeName.toLowerCase()) return rule;
      if (Array.isArray(rule.filter) && rule.filter.includes(node.nodeName.toLowerCase())) return rule;
    }
    return this.array[this.array.length - 1]; // default
  }
}
// ==EMBEDDED_TURNDOWN_END==

// Content script for the Markdown converter
console.log('✅ Content script loaded:', new Date().toISOString());

let turndownService = null;

// Initialize Turndown service
function initializeTurndown() {
  try {
    turndownService = new TurndownService();
    console.log('✅ Turndown service initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Turndown:', error);
    return false;
  }
}

// Convert page to Markdown
function convertToMarkdown(options = {}) {
  if (!turndownService && !initializeTurndown()) {
    throw new Error('Turndown initialization failed');
  }

  let markdown = '';
  
  // Add metadata
  const metadata = {
    title: document.title || '',
    url: window.location.href,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    author: document.querySelector('meta[name="author"]')?.getAttribute('content') || '',
    date: new Date().toISOString()
  };
  
  if (options.includeMeta) {
    markdown += '---\n';
    if (options.includeTitle) markdown += `title: "${metadata.title}"\n`;
    if (options.includeUrl) markdown += `source: "${metadata.url}"\n`;
    if (metadata.description) markdown += `description: "${metadata.description}"\n`;
    if (metadata.author) markdown += `author: "${metadata.author}"\n`;
    markdown += `date: "${metadata.date}"\n`;
    markdown += '---\n\n';
  } else {
    if (options.includeTitle && metadata.title) markdown += `# ${metadata.title}\n\n`;
    if (options.includeUrl) markdown += `Source: [${metadata.url}](${metadata.url})\n\n`;
  }
  
  // Find content element
  let contentElement = document.body;
  if (options.contentSelector) {
    try {
      contentElement = document.querySelector(options.contentSelector) || document.body;
    } catch (e) {
      console.error('Invalid selector:', options.contentSelector);
    }
  }
  
  // Clean and convert
  const cleanedContent = contentElement.cloneNode(true);
  cleanedContent.querySelectorAll('script, style, noscript, iframe, object, embed').forEach(el => el.remove());
  
  if (options.filterAds) {
    const adPatterns = ['ad-', 'ads-', 'advert', 'banner', 'sidebar', 'nav-', 'navigation', 'menu', 'footer', 'header'];
    cleanedContent.querySelectorAll('*').forEach(el => {
      const classId = ((el.className || '') + ' ' + (el.id || '')).toLowerCase();
      if (adPatterns.some(p => classId.includes(p))) el.remove();
    });
  }
  
  const contentMarkdown = turndownService.turndown(cleanedContent);
  markdown += contentMarkdown;
  
  // Clean up
  return markdown.replace(/\n\n\n+/g, '\n\n').replace(/^\n+/, '').replace(/\n+$/, '\n');
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Received message:', request.action);
  
  if (request.action === 'convertToMarkdown') {
    try {
      const markdown = convertToMarkdown(request.options || {});
      console.log('✅ Conversion success, length:', markdown.length);
      sendResponse({ success: true, markdown });
    } catch (error) {
      console.error('❌ Conversion error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  return true;
});

console.log('📡 Message listener registered');