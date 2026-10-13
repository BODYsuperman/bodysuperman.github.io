{# Site language switcher: shown only when the counterpart page exists
   (page.lang_toggles is computed in scripts/i18n-posts.js) #}
{%- if theme.language_switcher and page.lang_toggles and page.lang_toggles.length %}
  <div class="site-lang-switcher">
    <span class="lang-item lang-current">{{ language_name(page.lang) }}</span>
    {%- for toggle in page.lang_toggles %}
      <a class="lang-item lang-link" href="{{ toggle.url }}" rel="section" title="{{ language_name(toggle.lang) }}">
        <i class="fa fa-language"></i> {{ language_name(toggle.lang) }}
      </a>
    {%- endfor %}
  </div>
{%- endif %}
