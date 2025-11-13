/*!
 * Turndown minimal implementation for Chrome Extension
 * Basic HTML to Markdown conversion
 */

class TurndownService {
  constructor() {
    this.rules = new Rules();
    this.options = {
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '_',
      strongDelimiter: '**',
      linkStyle: 'inlined',
      linkReferenceStyle: 'full',
      br: '  \n',
      blankReplacement(content) {
        return content === '' ? '' : '\n\n';
      },
      keepReplacement(content, node) {
        return content;
      },
      defaultReplacement(content, node) {
        return node.isBlock ? '\n\n' + content + '\n\n' : content;
      }
    };
  }

  turndown(input) {
    if (typeof input === 'string') {
      const doc = this.createDocument(input);
      return this.processDocument(doc);
    } else if (input && input.nodeType) {
      return this.processDocument(input);
    }
    return '';
  }

  createDocument(html) {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  processDocument(doc) {
    const root = doc.body || doc.documentElement;
    root.normalize();
    
    // Remove script and style tags
    const scripts = root.querySelectorAll('script, style, noscript');
    scripts.forEach(el => el.remove());
    
    return this.processNode(root);
  }

  processNode(node) {
    let result = '';
    
    if (node.nodeType === Node.TEXT_NODE) {
      return this.escapeMarkdown(node.textContent || '');
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const rule = this.rules.findRule(node);
      let content = '';
      
      for (const child of node.childNodes) {
        content += this.processNode(child);
      }
      
      result = rule.replacement.call(this, content, node);
    }
    
    return result;
  }

  escapeMarkdown(text) {
    return text
      .replace(/\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/`/g, '\\`')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\#/g, '\\#')
      .replace(/\+/g, '\\+')
      .replace(/\-/g, '\\-')
      .replace(/\./g, '\\.')
      .replace(/\!/g, '\\!');
  }

  addRule(name, rule) {
    this.rules.addRule(name, rule);
  }

  keep(filter) {
    this.rules.keep(filter);
  }

  remove(filter) {
    this.rules.remove(filter);
  }

  use(plugin) {
    if (typeof plugin === 'function') {
      plugin.call(this, this);
    } else if (plugin && typeof plugin.install === 'function') {
      plugin.install(this, this.options);
    }
  }
}

class Rules {
  constructor() {
    this.array = [];
    this.initDefaultRules();
  }

  initDefaultRules() {
    // Headers
    this.addRule('h1', {
      filter: 'h1',
      replacement: (content) => '\n\n# ' + content + '\n\n'
    });
    
    this.addRule('h2', {
      filter: 'h2',
      replacement: (content) => '\n\n## ' + content + '\n\n'
    });
    
    this.addRule('h3', {
      filter: 'h3',
      replacement: (content) => '\n\n### ' + content + '\n\n'
    });
    
    this.addRule('h4', {
      filter: 'h4',
      replacement: (content) => '\n\n#### ' + content + '\n\n'
    });
    
    this.addRule('h5', {
      filter: 'h5',
      replacement: (content) => '\n\n##### ' + content + '\n\n'
    });
    
    this.addRule('h6', {
      filter: 'h6',
      replacement: (content) => '\n\n###### ' + content + '\n\n'
    });

    // Paragraphs
    this.addRule('p', {
      filter: 'p',
      replacement: (content) => '\n\n' + content + '\n\n'
    });

    // Line breaks
    this.addRule('br', {
      filter: 'br',
      replacement: () => '  \n'
    });

    // Horizontal rules
    this.addRule('hr', {
      filter: 'hr',
      replacement: () => '\n\n---\n\n'
    });

    // Strong/bold
    this.addRule('strong', {
      filter: ['strong', 'b'],
      replacement: (content) => '**' + content + '**'
    });

    // Emphasis/italic
    this.addRule('em', {
      filter: ['em', 'i'],
      replacement: (content) => '_' + content + '_'
    });

    // Links
    this.addRule('a', {
      filter: 'a',
      replacement: (content, node) => {
        const href = node.getAttribute('href');
        const title = node.getAttribute('title');
        const text = content || '';
        
        if (!href) return text;
        
        if (title) {
          return '[' + text + '](' + href + ' "' + title + '")';
        }
        return '[' + text + '](' + href + ')';
      }
    });

    // Images
    this.addRule('img', {
      filter: 'img',
      replacement: (content, node) => {
        const alt = node.getAttribute('alt') || '';
        const src = node.getAttribute('src') || '';
        const title = node.getAttribute('title') || '';
        
        if (!src) return '';
        
        if (title) {
          return '![[' + alt + ']](' + src + ' "' + title + '")';
        }
        return '![[' + alt + ']](' + src + ')';
      }
    });

    // Code blocks
    this.addRule('code', {
      filter: 'code',
      replacement: (content, node) => {
        if (node.childNodes.length === 0) {
          return '';
        }
        
        const parent = node.parentNode;
        if (parent && parent.nodeName.toLowerCase() === 'pre') {
          // Code block
          const language = node.getAttribute('class') || '';
          const langMatch = language.match(/language-(\w+)/);
          const lang = langMatch ? langMatch[1] : '';
          return '\n\n```' + lang + '\n' + content + '\n```\n\n';
        } else {
          // Inline code
          return '`' + content + '`';
        }
      }
    });

    this.addRule('pre', {
      filter: 'pre',
      replacement: (content, node) => {
        const code = node.querySelector('code');
        if (code) {
          const codeContent = code.textContent;
          const language = code.getAttribute('class') || '';
          const langMatch = language.match(/language-(\w+)/);
          const lang = langMatch ? langMatch[1] : '';
          return '\n\n```' + lang + '\n' + codeContent + '\n```\n\n';
        }
        return '\n\n```\n' + content + '\n```\n\n';
      }
    });

    // Lists
    this.addRule('ul', {
      filter: 'ul',
      replacement: (content) => '\n\n' + content + '\n\n'
    });

    this.addRule('ol', {
      filter: 'ol',
      replacement: (content) => '\n\n' + content + '\n\n'
    });

    this.addRule('li', {
      filter: 'li',
      replacement: (content, node) => {
        content = content.replace(/^\s+/, '').replace(/\n\n(?!\n)/g, '\n');
        const parent = node.parentNode;
        const index = Array.prototype.indexOf.call(parent.childNodes, node);
        
        let prefix;
        if (parent.nodeName.toLowerCase() === 'ol') {
          prefix = (index + 1) + '. ';
        } else {
          prefix = '- ';
        }
        
        return prefix + content.replace(/^/gm, '  ') + '\n';
      }
    });

    // Blockquotes
    this.addRule('blockquote', {
      filter: 'blockquote',
      replacement: (content) => {
        content = content.replace(/^/gm, '> ');
        return '\n\n' + content + '\n\n';
      }
    });

    // Divs
    this.addRule('div', {
      filter: 'div',
      replacement: (content) => '\n\n' + content + '\n\n'
    });

    // Remove these elements completely
    this.addRule('remove', {
      filter: ['script', 'style', 'noscript', 'iframe', 'object', 'embed', 'svg', 'canvas'],
      replacement: () => ''
    });

    // Ignored elements - keep content but lose container
    this.addRule('ignore', {
      filter: ['span', 'abbr', 'acronym', 'address', 'big', 'cite', 'code', 'dfn', 'font', 'ins', 'kbd', 'q', 's', 'samp', 'small', 'strike', 'sub', 'sup', 'tt', 'var'],
      replacement: (content) => content
    });

    // Default rule - handle any element not covered above
    this.addRule('default', {
      filter: () => true,
      replacement: (content, node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const display = window.getComputedStyle(node).display;
          if (display === 'block' || display === 'list-item' || 
              node.tagName.match(/^(DIV|P|H[1-6]|LI|OL|UL|BLOCKQUOTE|PRE)$/i)) {
            return '\n\n' + content + '\n\n';
          }
        }
        return content;
      }
    });
  }

  addRule(name, rule) {
    this.array.unshift(rule);
    rule.name = name;
  }

  findRule(node) {
    for (const rule of this.array) {
      if (typeof rule.filter === 'string') {
        if (rule.filter === node.nodeName.toLowerCase()) {
          return rule;
        }
      } else if (Array.isArray(rule.filter)) {
        if (rule.filter.includes(node.nodeName.toLowerCase())) {
          return rule;
        }
      } else if (typeof rule.filter === 'function') {
        if (rule.filter(node)) {
          return rule;
        }
      }
    }
    return null;
  }

  keep(filter) {
    this.addRule('keep', {
      filter: filter,
      replacement: (content) => content
    });
  }

  remove(filter) {
    this.addRule('remove', {
      filter: filter,
      replacement: () => ''
    });
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TurndownService;
} else if (typeof window !== 'undefined') {
  window.TurndownService = TurndownService;
}