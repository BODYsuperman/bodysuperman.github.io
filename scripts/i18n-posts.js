'use strict';

/**
 * 双语支持（en / zh-CN）：
 * 1. frontmatter 中 lang: zh-CN 的文章，URL 自动加 /zh-CN/ 前缀，
 *    并去掉文件名中的 .zh 后缀（如 foo.zh.md 与 foo.md 路径配对），
 *    NexT 语言切换器（i18n_path）即可在中英文文章间互跳
 * 2. 首页 / 只显示默认语言（en）的文章
 * 3. /zh-CN/ 首页只显示 zh-CN 的文章（含分页链接前缀修正）
 *
 * 注意：Hexo 内置 post_permalink 过滤器优先级为 10，本过滤器用 9 抢先执行，
 * 此时入参是 post 文档；内置过滤器随后直接采用这里写入的 __permalink。
 */

const { Permalink } = require('hexo-util');
const { join } = require('path').posix;
const indexGenerator = require('hexo-generator-index/lib/generator');

const ZH = 'zh-CN';
const ZH_SUFFIX = '.zh';
// 注意：Hexo 核心（theme/index.js）会向 config.language 数组原地 push 'default'，
// 这里必须过滤掉，否则会多出一个 "default" 语言
const siteLangs = () =>
  (Array.isArray(hexo.config.language) ? hexo.config.language : [hexo.config.language]).filter(
    l => l && l !== 'default'
  );
const defaultLang = () => siteLangs()[0];
const postLang = post => post.lang || defaultLang();

// 1. zh-CN 文章：去掉 .zh 后缀、加 zh-CN/ 前缀
hexo.extend.filter.register(
  'post_permalink',
  post => {
    if (postLang(post) !== ZH || post.__permalink) return post;
    let slug = String(post.slug);
    if (slug.endsWith(ZH_SUFFIX)) slug = slug.slice(0, -ZH_SUFFIX.length);
    const permalink = new Permalink(hexo.config.permalink, {});
    const path = permalink.stringify({
      title: slug,
      year: post.date.format('YYYY'),
      month: post.date.format('MM'),
      day: post.date.format('DD')
    });
    post.__permalink = `${ZH}/${path}`;
    return post;
  },
  9
);

// 内置过滤器会给 __permalink 加前导斜杠（'/zh-CN/...'），导致页面内
// page.path 与语言前缀匹配失败，这里在其之后把前导斜杠去掉
hexo.extend.filter.register(
  'post_permalink',
  path => (typeof path === 'string' && path.startsWith('/') ? path.slice(1) : path),
  11
);

// 语言切换入口：仅当目标语言的对应页面真实存在时，才给 page 注入
// lang_toggles（供主题菜单渲染切换链接），避免切换后 404。
// 存在性基于数据模型（posts/pages）+ 首页分页计算，渲染前即完整可用
// （hexo.route 在渲染期间尚未填充完毕，不可靠）
hexo.extend.filter.register(
  'template_locals',
  locals => {
    const { page } = locals;
    const path = page.path || locals.path || '';
    const cur = page.lang || defaultLang();
    const others = siteLangs().filter(l => l !== cur);
    page.lang_toggles = [];
    if (!others.length) return locals;

    const norm = p => p.replace(/index\.html$/, '');
    const posts = hexo.locals.get('posts');
    const perPage = hexo.config.index_generator.per_page;
    const pageDir = hexo.config.pagination_dir || 'page';

    // 全站已存在的规范化路径集合
    const existing = new Set();
    posts.forEach(p => existing.add(norm(p.path)));
    hexo.locals.get('pages').forEach(p => existing.add(norm(p.path)));
    siteLangs().forEach(lang => {
      const prefix = lang === defaultLang() ? '' : `${lang}/`;
      existing.add(prefix); // 首页
      const count = posts.filter(p => postLang(p) === lang).length;
      const total = perPage ? Math.ceil(count / perPage) : 1;
      for (let i = 2; i <= total; i++) existing.add(`${prefix}${pageDir}/${i}/`);
    });

    // 当前页去掉自身语言前缀，得到两语言共用的基础路径
    const base = path.startsWith(`${cur}/`) ? path.slice(cur.length + 1) : path;
    page.lang_toggles = others
      .map(target => {
        const targetPath = norm(target === defaultLang() ? base : `${target}/${base}`);
        return existing.has(targetPath) ? { lang: target, url: `/${targetPath}` } : null;
      })
      .filter(Boolean);
    return locals;
  },
  20 // 在 Hexo 内置 i18n locals 过滤器（设置 page.lang）之后执行
);

function onlyLang(locals, lang) {
  return Object.assign({}, locals, {
    posts: locals.posts.filter(post => postLang(post) === lang)
  });
}

// 2. 覆盖内置首页生成器：只列默认语言文章
hexo.extend.generator.register('index', function(locals) {
  return indexGenerator.call(this, onlyLang(locals, defaultLang()));
});

// 3. 生成 /zh-CN/ 首页：只列中文文章，分页链接加前缀
hexo.extend.generator.register('index-zh-CN', function(locals) {
  const routes = indexGenerator.call(this, onlyLang(locals, ZH));
  return routes.map(route => {
    const data = Object.assign({}, route.data);
    // base/current_url 在首页是空字符串，falsy 值会被 if 跳过导致分页页码
    // 丢失 zh-CN/ 前缀（跳回英文首页），这里必须无条件补前缀；
    // prev_link/next_link 为空表示没有上/下页，保持有条件补前缀
    data.base = `${ZH}/${data.base || ''}`;
    data.current_url = `${ZH}/${data.current_url || ''}`;
    for (const key of ['prev_link', 'next_link']) {
      if (data[key]) data[key] = `${ZH}/${data[key]}`;
    }
    return Object.assign({}, route, { path: `${ZH}/${route.path}`, data });
  });
});

// 4. 中文文章的相对图片引用（如 ![pic](pic01.png)）：
// marked 的 postAsset 解析会用中文文章的 postPath（source/_posts/X.zh）查
// PostAsset，而资源实际在英文文章的文件夹（source/_posts/X/）里，查不到就
// 渲染成 /pic01.png（站点根路径，404）。这里拦截 image()：按 .zh 目录解析
// 失败时，回退到英文文章目录的同名资源，直接使用其发布路径（asset.path，
// 与英文页面的解析结果一致）。已有 .zh 资源文件夹的旧文章行为不变。
hexo.extend.filter.register('marked:renderer', renderer => {
  const origImage = renderer.image;
  renderer.image = function(href, title, text) {
    const { hexo, options } = this;
    const { postPath } = options;
    if (
      postPath &&
      postPath.endsWith(ZH_SUFFIX) &&
      !/^(#|\/\/|https?:|\/|\\)/.test(href)
    ) {
      const PostAsset = hexo.model('PostAsset');
      if (!PostAsset.findById(join(postPath, href))) {
        const enPath = postPath.slice(0, -ZH_SUFFIX.length); // 去掉 .zh 后缀
        const asset = PostAsset.findById(join(enPath, href));
        if (asset) href = asset.path.replace(/\\/g, '/');
      }
    }
    return origImage.call(this, href, title, text);
  };
});
