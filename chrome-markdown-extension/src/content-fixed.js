// Content script for the Markdown converter - Fixed version
// Runs in the context of web pages

console.log('Content script loaded at:', new Date().toISOString());

// Force initialization of TurndownService if available
if (typeof TurndownService !== 'undefined') {
  console.log('TurndownService is available globally');
} else if (window.TurndownService) {
  console.log('TurndownService is on window object');
  var TurndownService = window.TurndownService;
} else {
  console.error('TurndownService is NOT available');
}

let turndownService = null;

// Initialize Turndown service when script loads
function initializeTurndown() {
  try {
    console.log('Initializing Turndown service...');
    
    if (typeof TurndownService !== 'undefined' && TurndownService) {
      turndownService = new TurndownService();
      
      // Add custom rules for better conversion
      addCustomRules();
      
      console.log('✓ Turndown service initialized successfully');
      return true;
    } else {
      console.error('✗ TurndownService not available. Defined?', typeof TurndownService);
      console.error('Window objects:', Object.keys(window).filter(k => k.toLowerCase().includes('turndown')));
      return false;
    }
  } catch (error) {
    console.error('✗ Error initializing Turndown:', error);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Add custom conversion rules
function addCustomRules() {
  if (!turndownService) return;
  
  console.log('Adding custom rules...');
  
  // Remove hidden elements
  turndownService.remove(node => {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    
    const style = window.getComputedStyle(node);
    return style.display === 'none' || 
           style.visibility === 'hidden' || 
           style.opacity === '0' ||
           node.hasAttribute('hidden') ||
           (node.offsetHeight === 0 && node.offsetWidth === 0 && 
            !['script', 'style', 'link'].includes(node.tagName.toLowerCase()));
  });
  
  // Try to identify and remove ads/navigation elements
  turndownService.remove(node => {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    
    const className = node.className || '';
    const id = node.id || '';
    const role = node.getAttribute('role') || '';
    
    // Common ad/navigation patterns
    const adPatterns = [
      'ad-', 'ads-', 'advert', 'advertisement', 'banner', 'sidebar',
      'nav-', 'navigation', 'menu', 'footer', 'header', 'cookie'
    ];
    
    const classId = (className + ' ' + id).toLowerCase();
    
    return adPatterns.some(pattern => 
      classId.includes(pattern) || role.toLowerCase().includes(pattern)
    );
  });
  
  // Clean up excessive whitespace
  turndownService.addRule('cleanWhitespace', {
    filter: node => node.nodeType === Node.TEXT_NODE,
    replacement: (content, node) => {
      if (!node.parentNode || node.parentNode.tagName === 'SCRIPT' || 
          node.parentNode.tagName === 'STYLE') {
        return '';
      }
      
      // Normalize whitespace but preserve single newlines in code blocks
      return content.replace(/[\t\r\n]/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
    }
  });
  
  console.log('✓ Custom rules added');
}

// Extract page metadata
function extractMetadata() {
  const metadata = {
    title: document.title || '',
    url: window.location.href,
    description: '',
    author: '',
    date: new Date().toISOString()
  };
  
  // Try to get meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metadata.description = metaDesc.getAttribute('content') || '';
  }
  
  // Try to get meta author
  const metaAuthor = document.querySelector('meta[name="author"]');
  if (metaAuthor) {
    metadata.author = metaAuthor.getAttribute('content') || '';
  }
  
  // Try to get article published date
  const metaDate = document.querySelector('meta[property="article:published_time"]');
  if (metaDate) {
    metadata.date = metaDate.getAttribute('content') || metadata.date;
  }
  
  return metadata;
}

// Find the main content area
function findMainContent() {
  // Try common content selectors
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '.main-content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.page-content',
    '#content',
    '#main-content',
    '#post-content',
    '.markdown-body',
    '.readme'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent && element.textContent.trim().length > 100) {
      return { element, selector };
    }
  }
  
  // If no specific content area found, use body but try to filter out navigation and ads
  return { element: document.body, selector: 'body' };
}

// Clean content by removing unwanted elements
function cleanContent(element, options = {}) {
  const clone = element.cloneNode(true);
  
  // Remove script tags completely
  const scripts = clone.querySelectorAll('script, style, noscript, iframe, object, embed');
  scripts.forEach(script => script.remove());
  
  if (options.filterAds) {
    // Remove elements with ad-related class/ID patterns
    const adPatterns = [
      'ad-', 'ads-', 'advert', 'advertisement', 'banner', 'sidebar',
      'nav-', 'navigation', 'menu', 'footer', 'header', 'cookie',
      'social', 'share', 'comment-', 'related-', 'recommended-'
    ];
    
    const allElements = clone.getElementsByTagName('*');
    const toRemove = [];
    
    for (const element of allElements) {
      const className = element.className || '';
      const id = element.id || '';
      const role = element.getAttribute('role') || '';
      
      const classId = (className + ' ' + id + ' ' + role).toLowerCase();
      
      if (adPatterns.some(pattern => classId.includes(pattern))) {
        toRemove.push(element);
      }
    }
    
    toRemove.forEach(el => el.remove());
  }
  
  // If specific selector is provided, try to use it
  if (options.contentSelector) {
    try {
      const selected = clone.querySelector(options.contentSelector);
      if (selected) {
        return selected;
      }
    } catch (e) {
      console.error('Invalid CSS selector:', options.contentSelector);
    }
  }
  
  return clone;
}

// Convert page to Markdown
function convertToMarkdown(options = {}) {
  console.log('Starting conversion with options:', options);
  
  if (!turndownService) {
    throw new Error('Turndown service not initialized');
  }
  
  let markdown = '';
  
  // Add metadata if requested
  if (options.includeMeta || options.includeTitle || options.includeUrl) {
    const metadata = extractMetadata();
    
    if (options.includeMeta) {
      markdown += '---\n';
      if (options.includeTitle) {
        markdown += `title: "${metadata.title}"\n`;
      }
      if (options.includeUrl) {
        markdown += `source: "${metadata.url}"\n`;
      }
      if (metadata.description) {
        markdown += `description: "${metadata.description}"\n`;
      }
      if (metadata.author) {
        markdown += `author: "${metadata.author}"\n`;
      }
      markdown += `date: "${metadata.date}"\n`;
      markdown += '---\n\n';
    } else {
      // Minimal metadata
      if (options.includeTitle && metadata.title) {
        markdown += `# ${metadata.title}\n\n`;
      }
      if (options.includeUrl) {
        markdown += `Source: [${metadata.url}](${metadata.url})\n\n`;
      }
    }
  }
  
  // Find and clean content
  let contentElement;
  if (options.contentSelector) {
    try {
      contentElement = document.querySelector(options.contentSelector) || document.body;
    } catch (e) {
      console.error('Invalid CSS selector:', options.contentSelector);
      contentElement = findMainContent().element;
    }
  } else {
    contentElement = findMainContent().element;
  }
  
  console.log('Selected content element:', contentElement.tagName, contentElement.className);
  
  const cleanedContent = cleanContent(contentElement, options);
  console.log('Content cleaned, starting Turndown conversion...');
  
  // Convert to Markdown
  const contentMarkdown = turndownService.turndown(cleanedContent);
  
  console.log('Turndown conversion complete, length:', contentMarkdown.length);
  
  markdown += contentMarkdown;
  
  // Clean up the markdown
  markdown = markdown
    .replace(/\n\n\n+/g, '\n\n')  // Remove excessive newlines
    .replace(/^\n+/, '')           // Remove leading newlines
    .replace(/\n+$/, '\n');       // Ensure single trailing newline
  
  console.log('Final markdown length:', markdown.length);
  return markdown;
}

// Message handler for communication with popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request.action, 'from:', sender);
  
  if (request.action === 'convertToMarkdown') {
    try {
      if (!turndownService) {
        console.log('Turndown not initialized, initializing...');
        const initialized = initializeTurndown();
        if (!initialized) {
          throw new Error('Failed to initialize Turndown service');
        }
      }
      
      if (!turndownService) {
        throw new Error('Turndown service is still null after initialization');
      }
      
      console.log('Starting conversion...');
      const markdown = convertToMarkdown(request.options);
      console.log('Conversion successful, length:', markdown.length);
      sendResponse({ success: true, markdown });
    } catch (error) {
      console.error('Conversion error in content script:', error);
      console.error('Stack trace:', error.stack);
      sendResponse({ success: false, error: error.message });
    }
  } else {
    console.log('Unknown action:', request.action);
  }
  
  return true; // Keep message channel open for async response
});

// Initialize immediately when script loads
console.log('Content script initializing...');
try {
  initializeTurndown();
} catch (error) {
  console.error('Failed to initialize content script:', error);
}

console.log('Content script setup complete.');