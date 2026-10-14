# GIRLS XI Football Academy

Лендінг. Vite + TypeScript + GSAP (ScrollTrigger).

```
npm install
npm run dev      # локальний сервер
npm run build    # перевірка типів і збірка в dist/
```

- `index.html`: структура, 17 порожніх секцій з якорями (`#hero`, `#programs`, … `#contact-form`)
- `src/styles/`: `main.css` підключає `project/tokens.css`, `base.css`, `project/breakpoints.css`
- `src/scripts/`: `form.ts` (валідація), `animations.ts` (GSAP)
- `public/`: `images/` (WebP), `icons/` (SVG), `fonts/`
- `project/`: бриф, секції, рішення (джерело правди для верстки)
