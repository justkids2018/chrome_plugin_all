# Chrome Markdown Converter

A powerful Chrome extension that converts web content to Markdown format with one click.

## Features

🚀 **One-click conversion** - Convert any webpage to clean Markdown instantly  
🎯 **Smart content detection** - Automatically identifies main content areas  
🔧 **Customizable options** - Configure which parts to include in conversion  
📋 **Multiple export methods** - Copy to clipboard, download as .md file, or view inline  
🧹 **Ad filtering** - Optional removal of ads, navigation, and unwanted elements  
⚡ **Lightweight & fast** - Built with minimal dependencies

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar!

## Usage

1. Navigate to any webpage you want to convert
2. Click the extension icon in the toolbar
3. Configure conversion options:
   - **Include page title**: Adds the page title to the Markdown
   - **Include page URL**: Adds the source URL as metadata
   - **Include metadata**: Adds comprehensive metadata (author, description, etc.)
   - **Filter ads and navigation**: Removes common ad/nav patterns
   - **Content Selector**: Specify a CSS selector to target specific content
4. Click "Convert to Markdown"
5. Choose how to save/copy the result

## Examples

### Basic Article Conversion
```
---
title: "Article Title"
source: "https://example.com/article"
description: "Article description"
author: "Author Name"
date: "2024-01-01T00:00:00.000Z"
---

# Article Title

## Introduction

Article content here...
```

### With Custom Selector
Use `.main-content` or `#article` to target specific sections of the page.

## File Structure

```
chrome-markdown-extension/
├── manifest.json          # Extension manifest
├── src/
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic and controls
│   ├── content.js         # Content script for page conversion
│   └── background.js      # Background service worker
├── lib/
│   └── turndown.js        # HTML to Markdown converter
├── icons/                 # Extension icons
└── README.md             # This file
```

## Technical Details

### Core Technologies
- **Manifest V3**: Latest Chrome extension standard
- **Turndown.js**: HTML to Markdown conversion engine
- **Vanilla JavaScript**: No build process required
- **DOM API**: Direct manipulation and content extraction

### Conversion Process
1. Content script injects into the webpage
2. Extracts main content area based on heuristics or CSS selector
3. Cleans content by removing scripts, styles, and ads
4. Converts HTML to Markdown using Turndown
5. Returns result to popup for display/export

## Customization

### Adding Custom Rules
Edit `src/content.js` to add custom Turndown rules:

```javascript
turndownService.addRule('customRule', {
  filter: 'custom-element',
  replacement: (content, node) => {
    return `Custom: ${content}`;
  }
});
```

### Content Detection
Modify `findMainContent()` function to improve content detection for specific websites.

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ⚠️ Firefox (requires manifest conversion)
- ⚠️ Safari (requires manifest conversion)

## Limitations

- Works best on article-style content
- JavaScript-heavy sites may require specific selectors
- Dynamic content loaded after page load may not be captured
- Complex layouts might need manual content selection

## Future Enhancements

- [ ] Selection-based conversion (convert only selected text)
- [ ] Batch conversion of multiple tabs
- [ ] Cloud saving integration
- [ ] Custom CSS themes for the popup
- [ ] Advanced filtering options
- [ ] Support for tables and complex layouts

## License

MIT License - feel free to use and modify!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter any issues or have feature requests, please create an issue in the repository.

---

**Happy converting!** 🎉