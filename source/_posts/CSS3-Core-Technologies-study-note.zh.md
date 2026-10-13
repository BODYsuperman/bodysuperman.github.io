---
title: CSS3 核心技术学习笔记
lang: zh-CN
date: 2025-10-26 13:53:06
updated: 2025-10-26 19:04:19
comments: true
categories: 
  - CSS3
  - HTML5
  - Front-End Development
  - Web Styling
  - Responsive Design

tags: 
  - Web Development
---
- [1. CSS3 简介](#introduction)
  - [1.1 什么是 CSS3？](#what)
  - [1.2 CSS3 的核心作用](#role)
  - [1.3 CSS 按位置分类](#classify)
- [2. CSS3 选择器：精准定位元素](#css3selector)
  - [2.1 基础选择器](#basic)
  - [2.2 关系选择器](#re)
  - [2.3 伪类与伪元素](#pse)
  - [2.4 属性选择器](#attr)
- [3. 文本样式与排版](#text)
  - [3.1 字体样式](#fonts)
  - [3.2 文本排版](#textly)
  - [3.3 font 简写](#fontshort)
- [4. CSS 优先级（权重）](#csssp)
- [5. 盒模型](#box-model)
  - [5.1 盒模型组成](#box-model-c)
  - [5.2 关键属性](#key-p)
  - [5.3 box-sizing](#box-s)
  - [5.4 盒模型组成](#box-model-c)
  - [5.5 外边距折叠与修复](#mccf)
- [6. CSS 背景](#css-b)
  - [6.1 背景属性](#b-p)
  - [6.2 背景渐变](#b-g)
<!--more-->
- [7. 盒阴影与过渡](#b-s-a-t)
  - [7.1 盒阴影](#b-shadow)
  - [7.2 过渡](#trans)
- [8. 文本样式](#text-s)
  - [8.1 字体属性](#font-p)
  - [8.2 文本排版](#text-l)
  - [8.3 文本溢出](#text-o)
- [9. CSS 雪碧图](#css-sp)
- [10. 字体图标](#font-i)
  - [10.1 使用字体图标](#u-i-f)
  - [10.2 常用图标库](#p-i-l)
- [11. CSS 最佳实践](#css-b-p)
  - [11.1 重置/规范化 CSS](#rn-c)
  - [11.2 CSS 组织](#css-o)
  - [11.3 响应式考量](#res-c)
  - [11.4 示例 1：产品卡片（小米风格）](#p-c)
- [12. CSS 性能优化建议](#p-t)

## CSS3 简介：<a name="introduction"></a>
### 什么是 CSS3？  <a name="what"></a>
CSS3（层叠样式表第 3 版）是网页样式的最新标准。它控制 HTML 元素的视觉呈现，包括颜色、布局、动画和交互。与 HTML（定义结构）不同，CSS3 将样式与内容分离——使代码更易维护和灵活。

### CSS3 的核心作用  <a name="role"></a>
- **样式增强**：自定义字体、颜色、边框和视觉效果。
- **布局控制**：排列元素、创建响应式设计、管理间距。
- **交互动画**：添加过渡、悬停效果和动态变化。

### CSS 按位置分类 <a name="classify"></a>

- **行内样式**（最不推荐）
```html
<p style="color: red; font-size: 14px;">Text content</p>
```
    - 样式写在 HTML 标签内部
    - 仅控制当前标签
    - 在特殊场景下使用

- **内部样式**（适用于单页面）
```html
<head>
  <style>
    div { font-size: 18px; color: red; }
  </style>
</head>
```
    - 写在 <head> 部分
    - 控制当前页面上的所有元素
    - 将结构与样式分离

- **外部样式**（最推荐）
```html
<link rel="stylesheet" href="./css/index.css">
```
    - 独立的 CSS 文件
    - 控制整个网站
    - 可维护性最佳

## CSS3 选择器：精准定位元素<a name="css3selector"></a>
选择器是用于定位 HTML 元素以应用样式的模式。它们是有效使用 CSS3 的基础。

### 基础选择器<a name="basic"></a>
|**选择器类型**|	**语法**|	**匹配范围**|	**可复用性**|	**示例**|
| :----:        |    :----:       |    :----:|   :----:        |    :----:        |  
|类型选择器|	tagname|	指定标签的所有元素|	高（用于全局样式）|	div { color: pink; }|
|类选择器	|.classname	|`class` 属性匹配的元素	|高（可复用）	|.btn { padding: 10px; }|
|ID 选择器|	#idname|	id 唯一的元素|	低（一次性使用）	|#header { background: gray; }|
|通配符选择器	|*	|页面上的所有元素	全局	|* |{ margin: 0; padding: 0; box-sizing: border-box;}|

### 关系选择器<a name="re"></a>
根据元素相对于其他元素的位置来定位：

- **后代选择器**：`A B`（A 的所有后代，包括嵌套层级）
```
ul li { list-style: none; }
```
- **子代选择器**：`A > B`（仅 A 的直接子元素）
```
div > p { color: green; }
```
- **相邻兄弟选择器**：`A + B`（紧跟在 A 后面的兄弟元素）
```h2 + p { font-weight: bold; }
```
- **通用兄弟选择器**：`A ~ B`（A 之后的所有兄弟元素）
```h2 ~ p { line-height: 1.5; }```
### 伪类与伪元素<a name="pse"></a>
- **伪类**：定位元素状态（如悬停、聚焦）
```css
/* Link States (LVHA order) */
a:link { color: blue; }      /* Unvisited */
a:visited { color: purple; } /* Visited */
a:hover { color: red; }      /* Mouse over */
a:active { color: green; }   /* Being clicked */

/* User Interaction */
div:hover { background: pink; }
input:focus { border-color: blue; }
```
- **结构性伪类**：按位置定位元素
```css
/* Select first/last child */
li:first-child { color: pink; }
li:last-child { color: green; }

/* Select nth child */
li:nth-child(3) { color: blue; }
li:nth-child(odd) { background: #f0f0f0; }  /* Odd elements */
li:nth-child(even) { background: #fff; }    /* Even elements */
li:nth-child(3n) { color: red; }            /* Every 3rd element */
li:nth-child(n+2) { margin-top: 10px; }     /* From 2nd element onward */
```
- **伪元素**：定位元素的特定部分
```css
/* Text selection */
::selection { background: pink; color: white; }

/* First line/letter */
p::first-line { font-weight: bold; }
p::first-letter { font-size: 2em; }

/* Input placeholder */
input::placeholder { color: #999; }

/* Insert content */
div::before { content: "Start: "; color: red; }
div::after { content: " - End"; color: blue; }

```
### 属性选择器<a name="attr"></a>
根据属性值定位元素：
```css
/* Match elements with "type=text" */
input[type="text"] { padding: 8px; }
/* Match elements with class containing "icon" */
[class*="icon"] { font-size: 18px; }
/* Match elements with href starting with "https" */
a[href^="https"] { color: green; }
```

##  文本样式与排版<a name="text"></a>
通过这些核心属性控制文本的外观和排列。
### **字体样式**<a name="fonts"></a>
|**属性**|**描述**|**常用值**|**示例**|
| :----:        |    :----:       |    :----:|   :----:        |  
|color|文本颜色|	关键字、十六进制、RGB/RGBA|	color: #333;|
|font-family|	字体类型|	系统字体、网络字体|font-family: "Microsoft YaHei", sans-serif;|
|font-size	|文本大小	|`px, em, rem`	|font-size: 16px;|
|font-weight|文本粗细|normal (400), bold (700)|	`font-weight: 600;`|
|font-style	|文本风格	|`normal, italic`	|font-style: italic;|
|text-decoration	|文本装饰	|`none, underline, line-through`|	`text-decoration: none;（去除链接下划线）`|
### 文本排版<a name="textly"></a>
|**属性**|**	描述**|**常用值**|**示例**|
| :----:        |    :----:       |    :----:|   :----:        |  
|`text-align`|	水平对齐|`	left, center, right, justify`|	`text-align: center;`|
|`text-indent`|	首行缩进|`	em, px`|	`text-indent: 2em;`（缩进 2 个字符）|
|`letter-spacing`	|字符间距	|`px`（正值/负值）	|`letter-spacing: 1px;`|
|`line-height`|	行高|	`px`、倍数|	`line-height: 1.5;`（1.5 倍字号）|

### font 简写<a name="fontshort"></a>
将多个字体属性合并为一条声明（顺序：`style → weight → size/line-height → family`）：
```css
body {
  font: normal 400 16px/1.5 "Helvetica Neue", sans-serif;
}
```

## CSS 优先级（权重）<a name="csssp"></a>

|**选择器类型**|	**权重**|**示例**|
| :----:        |    :----:       |    :----:|
|!important|	∞（无穷大）|	`color: red !important;`|
|行内样式|	(1,0,0,0)|	`<div style="color: red"`>|
|ID 选择器	|(0,1,0,0)	|#header |`{ color: red; }`|
|类/属性/伪类|	(0,0,1,0)|	`.nav, [type="text"], :hover`|
|类型选择器/伪元素	|(0,0,0,1)	|`div, ::before`|
|通配符选择器|	(0,0,0,0)|	* |`{ margin: 0; }`|

**权重计算**：
`#nav .item a` = 0,1,0,0 + 0,0,1,0 + 0,0,0,1 = 0,1,1,1

## 盒模型 <a name="box-model"></a>
### 盒模型组成<a name="box-model-c"></a>
一个盒子由四部分组成（从内到外）：
- **Content（内容）**：实际内容（文本、图片）
- **Padding（内边距）**：内容与边框之间的空间
- **Border（边框）**：围绕内边距的线条
- **Margin（外边距）**：盒子与其他元素之间的空间

![pic](web1.png)
### 关键属性<a name="key-p"></a>
**Padding（内边距）**

```css
/* Shorthand: top → right → bottom → left (clockwise) */
.box {
  padding: 10px 20px 10px 20px;
  padding: 10px 20px; /* top/bottom → left/right */
  padding: 10px; /* all sides */
}
```

**Border（边框）**
```css
/* Shorthand: width → style → color */
.box {
  border: 1px solid #ddd;
  border-radius: 8px; /* rounded corners */
  border-top: 2px dashed red; /* single-side border */
}
```
**Margin（外边距）**
```css
/* Center a block element horizontally */
.container {
  width: 1200px;
  margin: 0 auto; /* top/bottom: 0, left/right: auto */
}
```
### box-sizing <a name="box-s"></a>
默认情况下，width/height 仅作用于内容区域。使用 box-sizing 可以让 padding 和 border 包含在内：
```css
/* Recommended for all projects */
* {
  box-sizing: border-box; /* width = content + padding + border */
}
```
### 外边距折叠与修复<a name="mccf"></a>
- **兄弟折叠**：块级兄弟元素之间的垂直外边距会合并（只取较大的那个）
- **父子折叠**：子元素的外边距会影响父元素，修复方法：
```css
.parent::after {
    content: '';
    display: block;
    clear: both;
}
```
或
```css
overflow: hidden
```

## CSS 背景<a name="css-b"></a>
### 背景属性<a name="b-p"></a>
```css
div {
  /* Background color */
  background-color: #f0f0f0;
  
  /* Background image */
  background-image: url('image.jpg');
  
  /* Background repeat */
  background-repeat: no-repeat; /* no-repeat, repeat, repeat-x, repeat-y */
  
  /* Background position */
  background-position: center center; /* x-position y-position */
  /* Keywords: left, center, right, top, bottom */
  /* Values: 50% 50%, 20px 10px */
  
  /* Background size */
  background-size: cover; /* cover, contain, or specific values */
  
  /* Background attachment */
  background-attachment: fixed; /* fixed or scroll */
  
  /* Shorthand */
  background: #f0f0f0 url('image.jpg') no-repeat center center/cover fixed;
}
```
### 背景渐变<a name="b-g"></a>
```css
/* Linear Gradient */
div {
  background: linear-gradient(to right, #ff6b6b, #4ecdc4);
  background: linear-gradient(90deg, #ff6b6b 30%, #4ecdc4 70%);
}

/* Radial Gradient */
div {
  background: radial-gradient(circle, #ff9a9e, #fad0c4);
}

/* Gradient Text */
h1 {
  background: linear-gradient(to right, pink, red);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
```

## 盒阴影与过渡<a name="b-s-a-t"></a>
### 盒阴影<a name="b-shadow"></a>
```css
div {
  /* Basic shadow: x-offset y-offset blur-radius spread-radius color */
  box-shadow: 2px 2px 10px 0 rgba(0,0,0,0.3);
  
  /* Multiple shadows */
  box-shadow: 

 2px 4px rgba(0,0,0,0.1),
    0 8px 16px rgba(0,0,0,0.1);
  
  /* Inset shadow (inner shadow) */
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  
  /* Spread radius (positive expands, negative contracts) */
  box-shadow: 0 0 0 5px rgba(255,0,0,0.5);
}
```
### 过渡<a name="trans"></a>
```css
div {
  /* Shorthand: property duration timing-function delay */
  transition: all 0.3s ease-in-out;
  
  /* Multiple properties */
  transition: 
    background-color 0.3s ease,
    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s linear 0.1s;
  
  /* Individual properties */
  transition-property: width, height;
  transition-duration: 0.3s, 0.5s;
  transition-timing-function: ease-in, linear;
  transition-delay: 0.1s;
  
  /* Common with hover */
  div:hover {
    background-color: pink;
    transform: scale(1.05);
  }
}
```

## 文本样式<a name="text-s"></a>
### 字体属性<a name="font-p"></a>
```css
p {
  /* Font color */
  color: #333;
  color: rgb(51, 51, 51);
  color: rgba(51, 51, 51, 0.8);
  
  /* Font family */
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  
  /* Font size */
  font-size: 16px;      /* Absolute */
  font-size: 1rem;      /* Relative to root */
  font-size: 1.2em;     /* Relative to parent */
  
  /* Font style */
  font-style: normal;   /* Normal */
  font-style: italic;   /* Italic */
  font-style: oblique;  /* Oblique (less common) */
  
  /* Font weight */
  font-weight: 400;     /* Normal (400) */
  font-weight: 700;     /* Bold (700) */
  font-weight: normal;  /* Keyword */
  font-weight: bold;    /* Keyword */
  
  /* Text decoration */
  text-decoration: none;          /* None (common for links) */
  text-decoration: underline;     /* Underline */
  text-decoration: line-through;  /* Strike-through */
  text-decoration: overline;      /* Overline */
  
  /* Font shorthand */
  font: italic 700 16px/1.5 "Helvetica Neue", sans-serif;
  /* Order: style weight size/line-height family */
}
```
### 文本排版<a name="text-l"></a>
```css
p {
  /* Text alignment */
  text-align: left;     /* Default */
  text-align: right;
  text-align: center;
  text-align: justify;  /* Full justification */
  
  /* Text indent */
  text-indent: 2em;     /* First line indent */
  
  /* Letter spacing */
  letter-spacing: 1px;  /* Character spacing */
  letter-spacing: -0.5px; /* Negative for tight spacing */
  
  /* Line height */
  line-height: 1.5;     /* Unitless (recommended) */
  line-height: 24px;    /* Fixed value */
  
  /* Text transform */
  text-transform: none;       /* Default */
  text-transform: uppercase;  /* UPPERCASE */
  text-transform: lowercase;  /* lowercase */
  text-transform: capitalize; /* Capitalize Each Word */
}
```
### 文本溢出<a name="text-o"></a>
通常我们把它写在 `common.css` 中，然后以 `class="single-line"` 的方式使用
```css
/* Single line text overflow */
.single-line {
  white-space: nowrap;      /* Prevent wrapping */
  overflow: hidden;         /* Hide overflow */
  text-overflow: ellipsis;  /* Show ... */
}

/* Multi-line text overflow (WebKit only) */
.multi-line {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;    /* Number of lines */
  overflow: hidden;
  text-overflow: ellipsis;
}
```

## CSS 雪碧图<a name="css-sp"></a>
CSS 雪碧图（CSS Sprites）将多个小图片合并为一张大图，以减少 HTTP 请求数。

实现方式
```css
.icon {
  background-image: url('sprite.png');
  background-repeat: no-repeat;
  display: inline-block;
}

.icon-home {
  width: 32px;
  height: 32px;
  background-position: 0 0;  /* First icon */
}

.icon-search {
  width: 32px;
  height: 32px;
  background-position: -32px 0; /* Second icon (move left 32px) */
}

.icon-user {
  width: 32px;
  height: 32px;
  background-position: -64px 0; /* Third icon (move left 64px) */
}
```
## 字体图标<a name="font-i"></a>
字体图标使用图标字体代替图片，实现可缩放、可自定义样式的图标。
### 使用字体图标<a name="u-i-f"></a>
```html
<!-- Link font file -->
<link rel="stylesheet" href="font-awesome.css">

<!-- Use icons -->
<i class="fa fa-home"></i>
<i class="fa fa-search"></i>
<i class="fa fa-user"></i>

<!-- Style with CSS -->
<i class="fa fa-star" style="color: gold; font-size: 24px;"></i>
```

### 常用图标库<a name="p-i-l"></a>
- **Font Awesome**：全面的图标集
- **Bootstrap Icons**：简洁干净
- **Ionicons**：现代化图标
- **Material Icons**：Google 的设计系统
- **IconFont（阿里巴巴）**：中国市场首选

## CSS 最佳实践<a name="css-b-p"></a>
### 重置/规范化 CSS<a name="rn-c"></a>
```css
/* Simple Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

ul, ol {
  list-style: none;
}

a {
  text-decoration: none;
  color: inherit;
}

/* Or use Normalize.css (recommended for production) */
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css">
```

### CSS 组织<a name="css-o"></a>
```css
/* Group related properties */
/* 1. Layout Properties */
position: absolute;
top: 0;
right: 0;
z-index: 10;

/* 2. Box Model */
display: block;
width: 100%;
padding: 20px;
margin: 0 auto;

/* 3. Typography */
font-family: sans-serif;
font-size: 16px;
line-height: 1.5;
color: #333;

/* 4. Visual */
background-color: #fff;
border: 1px solid #ddd;
border-radius: 4px;

/* 5. Animation */
transition: all 0.3s ease;
```

### 响应式考量<a name="res-c"></a>
```css
/* Use relative units */
.container {
  width: 90%;          /* Percentage for fluid layouts */
  max-width: 1200px;   /* Maximum width */
  margin: 0 auto;      /* Center align */
}

/* Responsive typography */
body {
  font-size: 16px;
}

@media (min-width: 768px) {
  body {
    font-size: 18px;
  }
}

/* Flexible images */
img {
  max-width: 100%;
  height: auto;
}
```

### 示例 1：产品卡片（小米风格）<a name="p-c"></a>
```css
.product-card {
  width: 300px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}
.product-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}
.product-title {
  font-size: 16px;
  margin: 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Truncate long text */
}
.price {
  color: #ff6700;
  font-weight: bold;
}
```
## CSS 性能优化建议<a name="p-t"></a>
- **重置默认样式**：使用 * { margin: 0; padding: 0; box-sizing: border-box; } 或 Normalize.css 确保跨浏览器一致性。
- **复用类名**：优先使用类选择器而非 ID 选择器，提高可复用性。
- **移动优先**：先为移动端设计，再通过媒体查询适配大屏幕。
- **避免 `!important`**：过度使用会破坏优先级机制——仅在紧急情况下使用。
- **优化性能**：使用字体图标/雪碧图替代多张图片；尽量简化选择器复杂度。
