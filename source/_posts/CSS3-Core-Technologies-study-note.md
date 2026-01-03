---
title: CSS3 Core Technologies study note
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
- [1. Introduction to CSS3](#introduction)
  - [1.1 What is CSS3?](#what)
  - [1.2 Core Roles of CSS3](#role)
  - [1.3 CSS Classification by Location](#classify)
- [2. CSS3 Selectors: Target Elements Precisely](#css3selector)
  - [2.1 Basic Selectors](#basic)
  - [2.2 Relationship Selectors](#re)
  - [2.3 Pseudo-Classes & Pseudo-Elements](#pse)
  - [2.3 Attribute Selectors](#attr)
- [3. Text Styling & Layout](#text)
  - [3.1 Font Styles](#fonts)
  - [3.2 Text Layout](#textly)
  - [3.3 Font Shorthand](#fontshort)
- [4. CSS Specificity (Priority)](#csssp)
- [5. Box Model](#box-model)
  - [5.1 Box Model Components](#box-model-c)
  - [5.2 Key Properties](#key-p)
  - [5.3 Box Sizing](#box-s)
  - [5.4 Box Model Components](#box-model-c)
  - [5.5 Margin Collapse & Collapse Fix](#mccf)
- [6. CSS Backgrounds](#css-b)
  - [6.1 Background Properties](#b-p)
  - [6.2 Background Gradients](#b-g)
<!--more-->
- [7. Box Shadows and Transitions](#b-s-a-t)
  - [7.1 Box Shadows](#b-shadow)
  - [7.2 Transitions](#trans)
- [8. Text Styling](#text-s)
  - [8.1 Font Properties](#font-p)
  - [8.2 Text Layout](#text-l)
  - [8.3 Text Overflow](#text-o)
- [9. CSS Sprites](#css-sp)
- [10. Font Icons](#font-i)
  - [10.1 Using Icon Fonts](#u-i-f)
  - [10.2 Popular Icon Libraries](#p-i-l)
- [11. CSS Best Practices](#css-b-p)
  - [11.1 Reset/Normalize CSS](#rn-c)
  - [11.2 CSS Organization](#css-o)
  - [11.3 Responsive Considerations](#res-c)
  - [11.4 Example 1: Product Card (Xiaomi Style)](#p-c)
- [12. CSS Performance Tips](#p-t)

## Introduction to CSS3:<a name="introduction"></a>
### What is CSS3?  <a name="what"></a>
CSS3 (Cascading Style Sheets Level 3) is the latest standard for styling web pages. It controls the visual presentation of HTML elements, including colors, layouts, animations, and interactions. Unlike HTML (which defines structure), CSS3 separates style from content—making code more maintainable and flexible.

### Core Roles of CSS3  <a name="role"></a>
- **Style Enhancement**: Customize fonts, colors, borders, and visual effects.
- **Layout Control**: Arrange elements, create responsive designs, and manage spacing.
- **Interactive Animations**: Add transitions, hover effects, and dynamic changes.

### CSS Classification by Location <a name="classify"></a>

- **Inline Styles** (Least Recommended)
```html
<p style="color: red; font-size: 14px;">Text content</p>
```
    - Styles written inside HTML tags
    - Controls only the current tag
    - Used in special situations

- **Internal Styles** (Useful for Single Pages)
```html
<head>
  <style>
    div { font-size: 18px; color: red; }
  </style>
</head>
```
    - Written in <head> section
    - Controls all elements on current page
    - Separates structure from style

- **External Styles** (Most Recommended)
```html
<link rel="stylesheet" href="./css/index.css">
```
    - Separate CSS file
    - Controls entire website
    - Best for maintainability

## CSS3 Selectors: Target Elements Precisely<a name="css3selector"></a>
Selectors are patterns to target HTML elements for styling. They are the foundation of effective CSS3 usage.

### Basic Selectors<a name="basic"></a>
|**Selector Type**|	**Syntax**|	**Matching Scope**|	**Reusability**|	**Example**|
| :----:        |    :----:       |    :----:|   :----:        |    :----:        |  
|Type Selector|	tagname|	All elements of the specified tag|	High (for global styles)|	div { color: pink; }|
|Class Selector	|.classname	|Elements with matching `class` attribute	|High (reusable)	|.btn { padding: 10px; }|
|ID Selector|	#idname|	Unique element with matching id|	Low (one-time use)	|#header { background: gray; }|
|Universal Selector	|*	|All elements on the page	Global	|* |{ margin: 0; padding: 0; box-sizing: border-box;}|

### Relationship Selectors<a name="re"></a>
Target elements based on their position relative to other elements:

- **Descendant Selector**: `A B` (all descendants of A, including nested levels)
```
ul li { list-style: none; }
```
- **Child Selector**: `A > B` (only direct children of A)
```
div > p { color: green; }
```
- **Adjacent Sibling Selector**: `A + B` (immediately following sibling of A)
```h2 + p { font-weight: bold; }
```
- **General Sibling Selector**: `A ~ B` (all siblings of A that come after)
```h2 ~ p { line-height: 1.5; }```
### Pseudo-Classes & Pseudo-Elements<a name="pse"></a>
- **Pseudo-Classes**: Target element states (e.g., hover, focus)
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
- **Structural Pseudo-Classes**: Target elements by position
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
- **Pseudo-Elements**: Target specific parts of elements
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
### Attribute Selectors<a name="attr"></a>
Target elements by attribute values:
```css
/* Match elements with "type=text" */
input[type="text"] { padding: 8px; }
/* Match elements with class containing "icon" */
[class*="icon"] { font-size: 18px; }
/* Match elements with href starting with "https" */
a[href^="https"] { color: green; }
```

##  Text Styling & Layout<a name="text"></a>
Control the appearance and arrangement of text with these core properties.
### **Font Styles**<a name="fonts"></a>
|**Property**|**Description**|**Common Values**|**Example**|
| :----:        |    :----:       |    :----:|   :----:        |  
|color|Text color|	Keyword, Hex, RGB/RGBA|	color: #333;|
|font-family|	Font type|	System fonts, web fonts|font-family: "Microsoft YaHei", sans-serif;|
|font-size	|Text size	|`px, em, rem`	|font-size: 16px;|
|font-weight|	Text boldness|normal (400), bold (700)|	`font-weight: 600;`|
|font-style	|Text style	|`normal, italic`	|font-style: italic;|
|text-decoration	|Text decoration	|`none, underline, line-through`|	`text-decoration: none; (remove link underlines)`|
### Text Layout<a name="textly"></a>
|**Property**|**	Description**|**Common Values**|**Example**|
| :----:        |    :----:       |    :----:|   :----:        |  
|`text-align`|	Horizontal alignment|`	left, center, right, justify`|	`text-align: center;`|
|`text-indent`|	First-line indent|`	em, px`|	`text-indent: 2em;` (2 characters indent)|
|`letter-spacing`	|Space between characters	|`px` (positive/negative)	|`letter-spacing: 1px;`|
|`line-height`|	Line spacing|	`px`, multiplier|	`line-height: 1.5;` (1.5x font size)|

### Font Shorthand<a name="fontshort"></a>
Combine multiple font properties into one declaration (order: `style → weight → size/line-height → family`):
```css
body {
  font: normal 400 16px/1.5 "Helvetica Neue", sans-serif;
}
```

## CSS Specificity (Priority)<a name="csssp"></a>

|**Selector Type**|	**Specificity**|**Example**|
| :----:        |    :----:       |    :----:|
|!important|	∞ (infinity)|	`color: red !important;`|
|Inline Styles|	(1,0,0,0)|	`<div style="color: red"`>|
|ID Selector	|(0,1,0,0)	|#header |`{ color: red; }`|
|Class/Attribute/Pseudo-class|	(0,0,1,0)|	`.nav, [type="text"], :hover`|
|Type Selector/Pseudo-element	|(0,0,0,1)	|`div, ::before`|
|Universal Selector|	(0,0,0,0)|	* |`{ margin: 0; }`|

**Specificity Calculation**:
`#nav .item a` = 0,1,0,0 + 0,0,1,0 + 0,0,0,1 = 0,1,1,1

## Box Model <a name="box-model"></a>
### Box Model Components<a name="box-model-c"></a>
A box consists of four parts (from inside out):
- **Content**: The actual content (text, images)
- **Padding**: Space between content and border
- **Border**: Line surrounding the padding
- **Margin**: Space between the box and other elements

![pic](web1.png)
### Key Properties<a name="key-p"></a>
**Padding (Inner Spacing)**

```css
/* Shorthand: top → right → bottom → left (clockwise) */
.box {
  padding: 10px 20px 10px 20px;
  padding: 10px 20px; /* top/bottom → left/right */
  padding: 10px; /* all sides */
}
```

**Border**
```css
/* Shorthand: width → style → color */
.box {
  border: 1px solid #ddd;
  border-radius: 8px; /* rounded corners */
  border-top: 2px dashed red; /* single-side border */
}
```
**Margin (Outer Spacing)**
```css
/* Center a block element horizontally */
.container {
  width: 1200px;
  margin: 0 auto; /* top/bottom: 0, left/right: auto */
}
```
### Box Sizing <a name="box-s"></a>
By default, width/height only apply to the content. Use box-sizing to include padding and border:
```css
/* Recommended for all projects */
* {
  box-sizing: border-box; /* width = content + padding + border */
}
```
### Margin Collapse & Collapse Fix<a name="mccf"></a>
- **Sibling Collapse**: Vertical margins between block siblings merge (use only one margin)
- **Parent-Child Collapse**: Child margin affects parent， fix with:
```css
.parent::after {
    content: '';
    display: block;
    clear: both;
}
```
or 
```css
overflow: hidden
```

## CSS Backgrounds<a name="css-b"></a>
### Background Properties<a name="b-p"></a>
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
### Background Gradients<a name="b-g"></a>
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

## Box Shadows and Transitions<a name="b-s-a-t"></a>
### Box Shadows<a name="b-shadow"></a>
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
### Transitions<a name="trans"></a>
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

## Text Styling<a name="text-s"></a>
### Font Properties<a name="font-p"></a>
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
### Text Layout<a name="text-l"></a>
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
### Text Overflow<a name="text-o"></a>
Usually we write it in `common.css` and then consume it like `class="single-line"`
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

## CSS Sprites<a name="css-sp"></a>
CSS Sprites combine multiple small images into one large image to reduce HTTP requests.

Implementation
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
## Font Icons<a name="font-i"></a>
Font icons use icon fonts instead of images for scalable, styleable icons.
### Using Icon Fonts<a name="u-i-f"></a>
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

### Popular Icon Libraries<a name="p-i-l"></a>
- **Font Awesome**: Comprehensive icon set
- **Bootstrap Icons**: Simple and clean
- **Ionicons**: Modern icons
- **Material Icons**: Google's design system
- **IconFont (Alibaba)**: Chinese market favorite

## CSS Best Practices<a name="css-b-p"></a>
### Reset/Normalize CSS<a name="rn-c"></a>
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

### CSS Organization<a name="css-o"></a>
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

### Responsive Considerations<a name="res-c"></a>
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

### Example 1: Product Card (Xiaomi Style)<a name="p-c"></a>
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
## CSS Performance Tips<a name="p-t"></a>
- **Reset Default Styles**: Use * { margin: 0; padding: 0; box-sizing: border-box; } or Normalize.css for cross-browser consistency.
- **Reuse Classes**: Prefer class selectors over IDs for reusability.
- **Mobile-First**: Design for mobile first, then use media queries for larger screens.
- **Avoid `!important`**: Overuse breaks specificity—use only for emergencies.
- **Optimize Performance**: Use icon fonts/sprites instead of multiple images; minimize selectors complexity.