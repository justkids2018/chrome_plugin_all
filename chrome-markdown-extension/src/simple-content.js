// Simple Markdown Converter - No dependencies
console.log('🔌 Simple Markdown Converter loaded');

// Simple HTML to Markdown converter
function simpleHtmlToMarkdown(element) {
  if (!element) return '';
  
  let html = element.innerHTML || element.textContent || '';
  
  // Basic conversions
  markdown = html
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n\n#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n\n##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n\n###### $1\n\n')
    
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1\n\n')
    
    // Line breaks
    .replace(/<br\s*\/?>/gi, '  \n')
    
    // Bold
    .replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**')
    
    // Italic
    .replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '_$2_')
    
    // Links
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    
    // Images
    .replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '!$2')
    
    // Unordered lists
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, '\n\n$1\n\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gis, (match, p1) => '- ' + p1.trim() + '\n')
    
    // Code blocks
    .replace(/<(pre|code)[^>]*>(.*?)<\/\1>/gis, '\n\n```\n$2\n```\n\n')
    
    // Horizontal rule
    .replace(/<hr\s*\/?>/gi, '\n\n---\n\n')
    
    // Blockquote
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '\n\n> $1\n\n')
    
    // Remove any remaining HTML tags but keep content
    .replace(/<[^>]*>/g, '')
    
    // Clean up excessive whitespace
    .replace(/\n\n\n+/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/[ ]+/g, ' ')
    .replace(/\n[ ]+/g, '\n')
    .replace(/[ ]+\n/g, '\n')
    .trim();
    
  return html;
}

// Convert page to Markdown
function convertPageToMarkdown(options = {}) {
  console.log('📄 Starting conversion...');
  
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
  
  // Try to find main content area
  const selectors = [
    'article', 'main', '[role="main"]',
    '.content', '.main-content', '.post-content',
    '.entry-content', '.article-content', '.page-content',
    '#content', '#main-content', '#post-content',
    '.markdown-body', '.readme'
  ];
  
  if (options.contentSelector) {
    try {
      const selected = document.querySelector(options.contentSelector);
      if (selected) contentElement = selected;
    } catch (e) {
      console.error('Invalid selector:', options.contentSelector);
    }
  } else {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent && element.textContent.length > 100) {
        contentElement = element;
        break;
      }
    }
  }
  
  console.log('🎯 Content element:', contentElement.tagName, contentElement.className);
  
  // Clean and convert
  const cleanedContent = contentElement.cloneNode(true);
  
  // Remove unwanted elements
  cleanedContent.querySelectorAll('script, style, noscript, iframe, object, embed').forEach(el => el.remove());
  
  if (options.filterAds) {
    // Remove ad/navigation elements
    const adPatterns = ['ad-', 'ads-', 'advert', 'banner', 'sidebar', 'nav-', 'navigation', 'menu', 'footer', 'header', 'cookie'];
    cleanedContent.querySelectorAll('*').forEach(el => {
      const classId = ((el.className || '') + ' ' + (el.id || '')).toLowerCase();
      if (adPatterns.some(p => classId.includes(p))) el.remove();
    });
  }
  
  // Convert to markdown
  const contentMarkdown = simpleHtmlToMarkdown(cleanedContent);
  markdown += contentMarkdown;
  
  console.log('✅ Conversion complete. Length:', markdown.length);
  return markdown;
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Received message:', request.action);
  
  if (request.action === 'convertToMarkdown') {
    try {
      const markdown = convertPageToMarkdown(request.options || {});
      console.log('✅ Success! Length:', markdown.length);
      sendResponse({ success: true, markdown });
    } catch (error) {
      console.error('❌ Error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  return true;
});

console.log('👂 Message listener registered, ready to convert!');