# Footer Component

一个可复用的React Footer组件，支持响应式布局和自定义配置。

## 特性

- 🎨 与网站整体设计风格保持一致
- 📱 完全响应式布局，适配各种设备
- ⚙️ 灵活的props接口，支持动态内容更新
- 🔗 内置社交媒体链接支持
- 🌙 支持深色/浅色主题切换
- ♿ 良好的可访问性支持

## 基本用法

```tsx
import Footer from '@/components/Footer';

// 使用默认配置
<Footer />
```

## 自定义配置

```tsx
import Footer from '@/components/Footer';

<Footer 
  companyName="Your Company"
  email="contact@yourcompany.com"
  socialLinks={{
    github: "https://github.com/yourcompany",
    twitter: "https://twitter.com/yourcompany",
    linkedin: "https://linkedin.com/company/yourcompany"
  }}
  customLinks={[
    { href: "/blog", label: "Blog" },
    { href: "https://docs.yourcompany.com", label: "Documentation", external: true }
  ]}
  showSocialLinks={true}
/>
```

## Props API

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `companyName` | `string` | `"TimeGuessr Team"` | 公司/团队名称 |
| `email` | `string` | `"contact@timeguessr.com"` | 联系邮箱 |
| `socialLinks` | `object` | 见下方 | 社交媒体链接配置 |
| `showSocialLinks` | `boolean` | `true` | 是否显示社交媒体链接 |
| `customLinks` | `array` | `[]` | 自定义链接列表 |

### socialLinks 对象结构

```tsx
{
  github?: string;
  twitter?: string;
  linkedin?: string;
}
```

### customLinks 数组结构

```tsx
[
  {
    href: string;        // 链接地址
    label: string;       // 显示文本
    external?: boolean;  // 是否为外部链接（新窗口打开）
  }
]
```

## 样式说明

组件使用Tailwind CSS进行样式设计，主要特点：

- 浅色主题：白色背景，深蓝色文字
- 深色主题：深蓝色背景，白色文字
- 悬停效果：链接悬停时变为红色主题色
- 响应式网格：移动端单列，桌面端四列布局

## 可访问性

- 所有链接都包含适当的`aria-label`属性
- 外部链接自动添加`rel="noopener noreferrer"`
- 键盘导航友好
- 语义化HTML结构

## 注意事项

1. 组件使用了`memo`进行性能优化
2. 自动获取当前年份用于版权信息
3. 支持Next.js的Link组件进行内部导航
4. 图标使用lucide-react库