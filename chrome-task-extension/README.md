# 每日工作生活计划表 Chrome 插件

一个简洁优美的每日计划表 Chrome 扩展，采用苹果风格设计和毛玻璃效果。

## ✨ 特性

- 🎨 **苹果风格设计** - 采用 Apple 设计语言
- 💎 **毛玻璃效果** - Glass Morphism 设计风格
- 🌈 **动态渐变背景** - 流动的渐变色彩
- ⏰ **实时时间显示** - 显示当前日期和时间
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🔗 **可点击链接** - 快速访问相关资源

## 📦 安装步骤

### 1. 准备图标文件

由于 Chrome 需要 PNG 格式的图标，你需要将 `icon.svg` 转换为 PNG 格式：

**方法一：使用在线工具**
- 访问 [CloudConvert](https://cloudconvert.com/svg-to-png) 或 [Convertio](https://convertio.co/zh/svg-png/)
- 上传 `icon.svg`
- 分别转换为 128x128、48x48 和 16x16 三个尺寸
- 重命名为 `icon128.png`、`icon48.png`、`icon16.png`

**方法二：使用命令行（需要安装 ImageMagick）**
```bash
# 安装 ImageMagick (macOS)
brew install imagemagick

# 转换图标
convert -background none icon.svg -resize 128x128 icon128.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 16x16 icon16.png
```

**方法三：临时跳过图标（快速测试）**
可以先注释掉 manifest.json 中的 icons 部分：
```json
{
  "manifest_version": 3,
  "name": "每日计划表",
  "version": "1.0.0",
  "description": "简洁优美的每日工作生活计划表，苹果风格设计",
  "chrome_url_overrides": {
    "newtab": "newtab.html"
  }
}
```

### 2. 加载扩展到 Chrome

1. 打开 Chrome 浏览器
2. 在地址栏输入 `chrome://extensions/` 并回车
3. 在右上角开启「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `chrome-extension` 文件夹
6. 完成！现在打开新标签页就能看到你的计划表了 🎉

## 🎯 使用方法

1. **查看计划** - 每次打开新标签页，自动显示计划表
2. **点击链接** - 点击 Englishposcod 链接可直接打开 B 站视频
3. **查看时间** - 页面顶部显示当前日期和时间

## 🛠️ 自定义

### 修改计划内容

编辑 `newtab.html` 文件，在对应的时间段中修改：

```html
<div class="time-item">
    <span class="time">你的时间</span>
    <span class="activity">你的活动</span>
</div>
```

### 修改颜色主题

在 `newtab.html` 的 `<style>` 标签中修改背景渐变：

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
```

可以访问 [uiGradients](https://uigradients.com/) 选择喜欢的渐变色。

### 调整透明度

修改 glass morphism 效果的透明度：

```css
background: rgba(255, 255, 255, 0.15); /* 调整最后的数值 0.15 */
```

## 📂 文件结构

```
chrome-extension/
├── manifest.json       # 扩展配置文件
├── newtab.html         # 新标签页 HTML
├── icon.svg            # SVG 图标（需转换）
├── icon16.png          # 16x16 图标
├── icon48.png          # 48x48 图标
├── icon128.png         # 128x128 图标
└── README.md           # 使用说明
```

## 💡 提示

- 每次修改文件后，需要在 `chrome://extensions/` 页面点击刷新按钮
- 如果新标签页没有变化，尝试完全关闭浏览器后重新打开
- 可以按 `Cmd+T` (Mac) 或 `Ctrl+T` (Windows) 快速打开新标签页查看计划表

## 🐛 常见问题

**Q: 新标签页没有显示我的计划表？**
A: 检查是否正确加载了扩展，并在 chrome://extensions/ 页面点击刷新按钮。

**Q: 图标不显示？**
A: 确保已将 SVG 转换为 PNG 格式，并放在正确的位置。

**Q: 想要恢复原来的新标签页？**
A: 在 chrome://extensions/ 中禁用或删除此扩展即可。

## 📝 更新日志

### v1.0.0 (2025-12-18)
- 初始版本发布
- 苹果风格设计
- Glass Morphism 效果
- 响应式布局
- 实时时钟显示

---

享受你的高效生活！✨
