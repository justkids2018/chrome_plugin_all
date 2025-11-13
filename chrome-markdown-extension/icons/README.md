# Icons

This directory should contain the following icon files:

- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels  
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Quick Icon Generation

You can generate simple placeholder icons using ImageMagick:

```bash
# Install ImageMagick if not available
# Then run these commands:

convert -size 16x16 xc:#007bff icon16.png
convert -size 32x32 xc:#007bff icon32.png
convert -size 48x48 xc:#007bff icon48.png
convert -size 128x128 xc:#007bff icon128.png
```

Or use this online tool: https://iconifier.net/

## Icon Design Suggestions

Consider using:
- Markdown logo with arrows
- Document icon with MD badge
- Down arrow with text MD
- Blue gradient background with white text

Recommended format: PNG with transparency