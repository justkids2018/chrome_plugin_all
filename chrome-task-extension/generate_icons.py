#!/usr/bin/env python3
"""
生成 Chrome 插件图标
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_gradient(width, height):
    """创建渐变背景"""
    image = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(image)

    # 创建紫色到粉色的渐变
    for y in range(height):
        ratio = y / height
        # 从 #667eea 到 #764ba2 到 #f093fb
        if ratio < 0.5:
            r1 = int(0x66 + (0x76 - 0x66) * (ratio * 2))
            g1 = int(0x7e + (0x4b - 0x7e) * (ratio * 2))
            b1 = int(0xea + (0xa2 - 0xea) * (ratio * 2))
        else:
            r1 = int(0x76 + (0xf0 - 0x76) * ((ratio - 0.5) * 2))
            g1 = int(0x4b + (0x93 - 0x4b) * ((ratio - 0.5) * 2))
            b1 = int(0xa2 + (0xfb - 0xa2) * ((ratio - 0.5) * 2))

        draw.line([(0, y), (width, y)], fill=(r1, g1, b1))

    return image

def create_icon(size):
    """创建指定尺寸的图标"""
    # 创建渐变背景
    img = create_gradient(size, size)
    draw = ImageDraw.Draw(img)

    # 计算图标元素的尺寸
    padding = size // 8
    calendar_size = size - padding * 2
    calendar_x = padding
    calendar_y = padding

    # 绘制白色圆角矩形（日历）
    corner_radius = size // 8
    draw.rounded_rectangle(
        [calendar_x, calendar_y, calendar_x + calendar_size, calendar_y + calendar_size],
        radius=corner_radius,
        fill='white',
        outline=None
    )

    # 绘制日历顶部（深色条）
    header_height = calendar_size // 4
    draw.rounded_rectangle(
        [calendar_x, calendar_y, calendar_x + calendar_size, calendar_y + header_height],
        radius=corner_radius,
        fill=(102, 126, 234)
    )
    # 填充底部，使其不是圆角
    draw.rectangle(
        [calendar_x, calendar_y + header_height - corner_radius,
         calendar_x + calendar_size, calendar_y + header_height],
        fill=(102, 126, 234)
    )

    # 绘制日历网格线
    line_color = (118, 75, 162)
    line_width = max(1, size // 32)

    # 绘制横线
    for i in range(1, 4):
        y = calendar_y + header_height + (calendar_size - header_height) * i // 4
        draw.line(
            [(calendar_x + padding // 2, y),
             (calendar_x + calendar_size - padding // 2, y)],
            fill=line_color,
            width=line_width
        )

    # 绘制对勾
    check_size = calendar_size // 3
    check_x = calendar_x + calendar_size // 2 - check_size // 4
    check_y = calendar_y + header_height + calendar_size // 5
    check_width = max(2, size // 20)

    # 绘制对勾的两条线
    draw.line(
        [(check_x, check_y + check_size // 2),
         (check_x + check_size // 3, check_y + check_size)],
        fill=(240, 147, 251),
        width=check_width
    )
    draw.line(
        [(check_x + check_size // 3, check_y + check_size),
         (check_x + check_size, check_y)],
        fill=(240, 147, 251),
        width=check_width
    )

    return img

def main():
    """生成所有尺寸的图标"""
    sizes = [16, 48, 128]

    for size in sizes:
        icon = create_icon(size)
        filename = f'icon{size}.png'
        icon.save(filename, 'PNG')
        print(f'✓ 已生成 {filename}')

if __name__ == '__main__':
    main()
    print('\n所有图标生成完成！')
