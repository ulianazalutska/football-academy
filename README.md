# GIRLS XI Football Academy

Лендінг. Vite + TypeScript + GSAP (ScrollTrigger).

```
npm install
npm run dev      # локальний сервер
npm run build    # перевірка типів і збірка в dist/
```

- `index.html`, `privacy.html`, `terms.html`, `child-protection.html`: сторінки (головна має 17 секцій з якорями `#hero`, `#programs`, … `#contact-form`)
- `src/styles/`: `main.css` підключає `project/tokens.css`, `base.css`, `project/breakpoints.css`
- `src/scripts/`: `form.ts` (валідація і відправка), `animations.ts` (GSAP), решта по секціях; `src/i18n/`: UA/EN
- `project/apps-script/Code.gs`: приймач заявок (Google Sheets + Telegram)
- `.env`: `VITE_FORM_ENDPOINT` (адреса Apps Script), див. `.env.example`; на хостингу змінну задати до збірки
- `public/`: `images/` (WebP), `icons/` (SVG), `fonts/` (Manrope woff2), `video/`
- `project/`: бриф, секції, рішення (джерело правди для верстки)
