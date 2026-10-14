import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* Анімації додаємо секція за секцією після пояснень користувачки.
   Кожна секція: окрема функція initXxxAnimation(), яка викликається тут. */
export function initAnimations(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  /* scrub-тригери першими: once-тригери, що вже відпрацювали при відновленні скролу, видаляють себе під час refresh і ламають цикл ScrollTrigger */
  initVideoExpand();
  initStepsTimeline();
  initBannerAnimation();
  initAboutReveal();
  initAboutAnimation();
  initStatsCounter();
  initProgramsReveal();
  initMethodReveal();
  initResultsReveal();
  initCoachesReveal();
  initGraduatesReveal();
  initStepsReveal();
  initSafetyReveal();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* 03 Банер: лінії розтягуються зліва, рядки по черзі виїжджають із маски знизу з легким нахилом */
function initBannerAnimation(): void {
  const title = document.querySelector<HTMLElement>('.banner__title');
  if (!title) return;
  const texts = title.querySelectorAll('.banner__text');
  const rules = title.querySelectorAll('.banner__rule');

  gsap.set(texts, { yPercent: 115, skewY: 6, opacity: 0 });
  gsap.set(rules, { scaleX: 0 });

  gsap
    .timeline({ scrollTrigger: { trigger: title, start: 'top 80%', once: true } })
    .to(rules, { scaleX: 1, duration: 1.1, ease: 'expo.out', stagger: 0.25 }, 0)
    .to(texts, { yPercent: 0, skewY: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.18 }, 0.1);
}

/* 04 Фото: безкінечний цикл ч/б архівне → кольорове фото тренерки → ч/б.
   Старт, коли фото в екрані; тривалість і паузи: моє припущення, чекаю уточнень. */
function initAboutAnimation(): void {
  const photo = document.querySelector<HTMLElement>('.about__photo');
  const coach = photo?.querySelector('.about__img--coach');
  if (!photo || !coach) return;

  gsap.set(coach, { opacity: 0 });
  gsap
    .timeline({
      repeat: -1,
      scrollTrigger: { trigger: photo, start: 'top 70%', toggleActions: 'play pause resume pause' },
    })
    .to(coach, { opacity: 1, duration: 1.6, ease: 'power1.inOut' }, 1.2)
    .to(coach, { opacity: 0, duration: 1.6, ease: 'power1.inOut' }, '+=1.2')
    .to({}, { duration: 1.2 });
}

/* 04 Лічильники: числа рахуються від 0 до значення, коли статистика потрапляє в екран.
   Тривалість 2 с, один раз: моє припущення, чекаю уточнень. Кінцевий текст лежить у HTML. */
function initStatsCounter(): void {
  const stats = document.querySelector<HTMLElement>('.about__stats');
  const nums = document.querySelectorAll<HTMLElement>('.about__num[data-count]');
  if (!stats || !nums.length) return;
  const fmt = new Intl.NumberFormat('uk-UA');

  const items = Array.from(nums).map((el) => {
    const final = el.textContent ?? '';
    el.textContent = '0' + final.replace(/[\d\s ]/g, '');
    return { el, final, target: Number(el.dataset.count), suffix: final.replace(/[\d\s ]/g, ''), v: 0 };
  });

  /* один тригер на всю сітку, щоб усі чотири числа рахувались разом */
  const tl = gsap.timeline({ scrollTrigger: { trigger: stats, start: 'top 85%', once: true } });
  items.forEach((it) => {
    tl.to(
      it,
      {
        v: it.target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => {
          it.el.textContent = fmt.format(Math.round(it.v)).replace(/ /g, ' ') + it.suffix;
        },
        onComplete: () => {
          it.el.textContent = it.final;
        },
      },
      0.6,
    );
  });
}

/* 04 Поява секції: заголовок виїжджає з легким нахилом, абзац проявляється з розмиття,
   м'яч-тумблер стоїть в абзаці й з'являється разом із текстом, статистика піднімається по черзі, фото відкривається знизу з м'яким зумом.
   Час і порядок: моє припущення, чекаю уточнень. */
function initAboutReveal(): void {
  const root = document.querySelector<HTMLElement>('.about__inner');
  if (!root) return;
  const q = (s: string) => root.querySelectorAll(s);
  const photo = root.querySelector('.about__photo');

  gsap.set(q('.about__title'), { y: 50, skewY: 4, opacity: 0 });
  gsap.set(q('.about__text'), { y: 30, opacity: 0, filter: 'blur(10px)' });
  gsap.set(q('.about__stat'), { y: 40, opacity: 0 });
  gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0% round 30px)' });
  gsap.set(q('.about__img'), { scale: 1.25 });

  gsap
    .timeline({ defaults: { ease: 'expo.out' }, scrollTrigger: { trigger: root, start: 'top 75%', once: true } })
    .to(photo, { clipPath: 'inset(0% 0% 0% 0% round 30px)', duration: 1.6 }, 0)
    .to(q('.about__img'), { scale: 1, duration: 2.2 }, 0)
    .to(q('.about__title'), { y: 0, skewY: 0, opacity: 1, duration: 1.2 }, 0.15)
    .to(q('.about__text'), { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.3 }, 0.35)
    .to(q('.about__stat'), { y: 0, opacity: 1, duration: 1.1, stagger: 0.14 }, 0.6);
}

/* 05 Поява секції: заголовок виїжджає з нахилом, підзаголовок і вік-фільтр проявляються,
   картки плавно проявляються й піднімаються по черзі.
   Час і порядок: моє припущення, чекаю уточнень. */
function initProgramsReveal(): void {
  const root = document.querySelector<HTMLElement>('.programs');
  const grid = root?.querySelector<HTMLElement>('.programs__grid');
  if (!root || !grid) return;
  const cards = grid.querySelectorAll<HTMLElement>('.program');
  const head = root.querySelector('.programs__head');

  gsap.set(root.querySelector('.programs__title'), { y: 50, skewY: 4, opacity: 0 });
  gsap.set(root.querySelector('.programs__sub'), { y: 24, opacity: 0, filter: 'blur(10px)' });
  gsap.set(root.querySelector('.age-filter'), { y: 24, opacity: 0 });
  gsap.set(root.querySelectorAll('.programs__notes p'), { y: 20, opacity: 0 });

  gsap
    .timeline({ defaults: { ease: 'expo.out' }, scrollTrigger: { trigger: head, start: 'top 85%', once: true } })
    .to(root.querySelector('.programs__title'), { y: 0, skewY: 0, opacity: 1, duration: 1.2 }, 0)
    .to(root.querySelector('.programs__sub'), { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.3 }, 0.2)
    .to(root.querySelector('.age-filter'), { y: 0, opacity: 1, duration: 1, onComplete: () => { gsap.set('.age-filter', { clearProps: 'transform,opacity' }); } }, 0.4);

  /* картки: плавно проявляються й трохи піднімаються по черзі (без зуму й відкриття).
     Анімуємо обгортку-стан через gsap.fromTo і прибираємо inline-стилі в кінці, щоб не зачепити hover і фільтр. */
  gsap.set(cards, { y: 40, opacity: 0, transition: 'none' });

  gsap
    .timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
      onComplete: () => {
        gsap.set(cards, { clearProps: 'transform,opacity,transition' });
      },
    })
    .to(cards, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12 }, 0)
    .to(root.querySelectorAll('.programs__notes p'), { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.9);
}

/* 06 Поява секції: фото відкривається зліва з м'яким зумом, заголовок виїжджає рядками,
   м'яч-тумблер з'являється разом з підзаголовком, шість напрямів піднімаються по черзі.
   Час і порядок: моє припущення, чекаю уточнень. */
function initMethodReveal(): void {
  const root = document.querySelector<HTMLElement>('.method__inner');
  if (!root) return;
  const photo = root.querySelector('.method__photo');
  const img = root.querySelector('.method__img');
  const lines = root.querySelectorAll('.method__line');
  const items = root.querySelectorAll('.method__item');

  gsap.set(photo, { clipPath: 'inset(0% 100% 0% 0% round 24px)' });
  gsap.set(img, { scale: 1.25 });
  gsap.set(lines, { y: 50, skewY: 4, opacity: 0 });
  gsap.set(root.querySelector('.method__sub'), { y: 24, opacity: 0, filter: 'blur(10px)' });
  gsap.set(items, { y: 40, opacity: 0 });

  gsap
    .timeline({
      defaults: { ease: 'expo.out' },
      scrollTrigger: { trigger: root, start: 'top 75%', once: true },
      onComplete: () => {
        gsap.set([img, items], { clearProps: 'transform,opacity' });
      },
    })
    .to(photo, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.6 }, 0)
    .to(img, { scale: 1, duration: 2.2 }, 0)
    .to(lines, { y: 0, skewY: 0, opacity: 1, duration: 1.2, stagger: 0.15 }, 0.25)
    .to(root.querySelector('.method__sub'), { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.3 }, 0.6)
    .to(items, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12 }, 0.4);
}

/* 07 Відео: при скролі росте на весь екран (бічні відступи й радіус зникають, висота = екран).
   Прив'язано до скролу (scrub), від 40% висоти екрана (за вказівкою користувачки) до верху секції: моє припущення, чекаю уточнень. */
function initVideoExpand(): void {
  const section = document.querySelector<HTMLElement>('.video');
  const box = section?.querySelector<HTMLElement>('.video__box');
  if (!section || !box) return;

  gsap.fromTo(
    section,
    { paddingLeft: () => parseFloat(getComputedStyle(section).paddingLeft), paddingRight: () => parseFloat(getComputedStyle(section).paddingRight) },
    {
      paddingLeft: 0,
      paddingRight: 0,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: section, start: 'top 40%', end: 'top top', scrub: true, invalidateOnRefresh: true },
    },
  );
  gsap.to(box, {
    height: () => window.innerHeight,
    borderRadius: 0,
    ease: 'none',
    immediateRender: false,
    scrollTrigger: { trigger: section, start: 'top 40%', end: 'top top', scrub: true, invalidateOnRefresh: true },
  });
}

/* 08 Результати: заголовок виїжджає по рядках, картки по черзі виринають знизу з легким масштабом;
   усередині число й підпис з'являються з невеликою затримкою. Один раз, коли заголовок у екрані:
   моє припущення, чекаю уточнень. */
function initResultsReveal(): void {
  const root = document.querySelector<HTMLElement>('.results');
  if (!root) return;
  const lines = root.querySelectorAll('.results__line');
  const cards = root.querySelectorAll<HTMLElement>('.results__card');
  const nums = root.querySelectorAll('.results__num');
  const labels = root.querySelectorAll('.results__label');

  gsap.set(lines, { y: 50, skewY: 4, opacity: 0 });
  gsap.set(cards, { y: 90, scale: 0.92, opacity: 0, transformOrigin: '50% 100%' });
  gsap.set(nums, { y: 28, opacity: 0 });
  gsap.set(labels, { y: 20, opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'expo.out' },
    scrollTrigger: { trigger: root, start: 'top 65%', once: true },
    onComplete: () => gsap.set([lines, cards, nums, labels], { clearProps: 'transform,opacity' }),
  });
  tl.to(lines, { y: 0, skewY: 0, opacity: 1, duration: 1.3, stagger: 0.15 }, 0)
    .to(cards, { y: 0, scale: 1, opacity: 1, duration: 1.5, stagger: { each: 0.14, from: 'start' } }, 0.3)
    .to(nums, { y: 0, opacity: 1, duration: 1.1, stagger: 0.14 }, 0.65)
    .to(labels, { y: 0, opacity: 1, duration: 1.1, stagger: 0.14 }, 0.8);
}

/* 09 Тренерки: поява при скролі (один раз). Заголовок виїжджає, фото відкривається знизу з масштабом,
   лапка вистрибує, цитата проявляється з розмиттям, стрілки плавно проявляються, мініатюра в'їжджає справа,
   напис по рядках, м'яч-тумблер з'являється разом із текстом свого рядка. Тривалості й ефекти: моє припущення, чекаю уточнень. */
function initCoachesReveal(): void {
  const root = document.querySelector<HTMLElement>('.coaches');
  if (!root) return;
  const q = <T extends HTMLElement>(sel: string): T[] => Array.from(root.querySelectorAll<T>(sel));
  const title = q('.coaches__title');
  const photo = q('.coaches__photo');
  const mark = q('.coaches__quote-mark');
  const text = q('.coaches__quote');
  const name = q('.coaches__name');
  const arrows = q('.coaches__arrow');
  const thumb = q('.coaches__thumb');
  const count = q('.coaches__count');
  const lines = q('.coaches__motto-line');
  const all = [...title, ...photo, ...mark, ...text, ...name, ...arrows, ...thumb, ...count, ...lines];

  gsap.set(title, { y: 50, skewY: 4, opacity: 0 });
  gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0% round 30px)', scale: 1.08, transformOrigin: '50% 100%' });
  gsap.set(mark, { scale: 0, rotate: -25, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(text, { y: 36, opacity: 0, filter: 'blur(10px)' });
  gsap.set(name, { y: 24, opacity: 0 });
  gsap.set(arrows, { opacity: 0 });
  gsap.set(thumb, { clipPath: 'inset(0% 0% 0% 100% round 30px)', x: 50, opacity: 0 });
  gsap.set(count, { y: 16, opacity: 0 });
  gsap.set(lines, { y: 40, skewY: 3, opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'expo.out' },
    scrollTrigger: { trigger: root, start: 'top 65%', once: true },
    onComplete: () => gsap.set(all, { clearProps: 'transform,opacity,clipPath,filter' }),
  });
  tl.to(title, { y: 0, skewY: 0, opacity: 1, duration: 1.3 }, 0)
    .to(photo, { clipPath: 'inset(0% 0% 0% 0% round 30px)', scale: 1, duration: 1.6 }, 0.2)
    .to(mark, { scale: 1, rotate: 0, opacity: 1, duration: 1.1, ease: 'back.out(2.2)' }, 0.7)
    .to(text, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.3 }, 0.85)
    .to(name, { y: 0, opacity: 1, duration: 1.1 }, 1.1)
    .to(arrows, { opacity: 1, duration: 1.2, ease: 'power2.out', stagger: 0.15 }, 1.3)
    .to(thumb, { clipPath: 'inset(0% 0% 0% 0% round 30px)', x: 0, opacity: 1, duration: 1.4 }, 0.9)
    .to(count, { y: 0, opacity: 1, duration: 1 }, 1.4)
    .to(lines, { y: 0, skewY: 0, opacity: 1, duration: 1.3, stagger: 0.15 }, 1.0);
}

/* 11 Три кроки: зелена частина лінії росте зі скролом, рожевий вузол їде по ній (варіант A, вибір користувачки) */
function initStepsTimeline(): void {
  const list = document.querySelector<HTMLElement>('.steps__list');
  const line = document.querySelector<HTMLElement>('.steps__timeline');
  if (!list || !line) return;
  line.style.setProperty('--p', '0');
  ScrollTrigger.create({
    trigger: line,
    start: 'top 60%',
    end: 'bottom 60%',
    scrub: true,
    onUpdate: (self) => line.style.setProperty('--p', String(self.progress)),
  });
}

/* 10 Випускниці: заголовок з'являється по словах (кожне виїжджає з-під маски зі скосом),
   стрічка логотипів проявляється з розмиттям і легким масштабом. Один раз. Час і ефекти: моє припущення, чекаю уточнень. */
function initGraduatesReveal(): void {
  const root = document.querySelector<HTMLElement>('.graduates');
  const title = root?.querySelector<HTMLElement>('.graduates__title');
  const marquee = root?.querySelector<HTMLElement>('.graduates__marquee');
  if (!root || !title || !marquee) return;

  /* кожне слово (і всередині акцентного span) загортаємо в маску */
  const inners: HTMLElement[] = [];
  const split = (node: Node): void => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.append(' ');
            return;
          }
          const mask = document.createElement('span');
          mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.12em;margin-bottom:-0.12em';
          const inner = document.createElement('span');
          inner.style.display = 'inline-block';
          inner.textContent = part;
          mask.append(inner);
          frag.append(mask);
          inners.push(inner);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        split(child);
      }
    });
  };
  title.setAttribute('aria-label', (title.textContent ?? '').replace(/\s+/g, ' ').trim());
  split(title);

  gsap.set(inners, { yPercent: 120, skewY: 8, opacity: 0, transformOrigin: '0% 100%' });
  gsap.set(marquee, { opacity: 0, y: 40, scale: 0.96, filter: 'blur(14px)' });

  gsap
    .timeline({
      defaults: { ease: 'expo.out' },
      scrollTrigger: { trigger: root, start: 'top 70%', once: true },
      onComplete: () => gsap.set(marquee, { clearProps: 'transform,opacity,filter' }),
    })
    .to(inners, { yPercent: 0, skewY: 0, opacity: 1, duration: 1.4, stagger: 0.12 }, 0)
    .to(marquee, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.8 }, 0.45);
}

/* 11 Три кроки: заголовок виїжджає по рядках; кожен крок окремо при скролі до нього: фото відкривається з боку, де воно стоїть,
   з розмиттям і наближенням, велике число піднімається, текст проявляється з розмиттям; кнопка вистрибує. Один раз.
   Час і ефекти: моє припущення, чекаю уточнень. */
function initStepsReveal(): void {
  const root = document.querySelector<HTMLElement>('.steps');
  if (!root) return;
  const lines = root.querySelectorAll('.steps__line');
  const cta = root.querySelector<HTMLElement>('.steps__cta');
  const steps = root.querySelectorAll<HTMLElement>('.step');
  const r = 'round 24px';

  gsap.set(lines, { y: 50, skewY: 4, opacity: 0 });
  gsap
    .timeline({ defaults: { ease: 'expo.out' }, scrollTrigger: { trigger: root.querySelector('.steps__title'), start: 'top 80%', once: true } })
    .to(lines, { y: 0, skewY: 0, opacity: 1, duration: 1.3, stagger: 0.15 });

  steps.forEach((step) => {
    const photo = step.querySelector<HTMLElement>('.step__photo');
    const num = step.querySelector<HTMLElement>('.step__num');
    const desc = step.querySelector<HTMLElement>('.step__desc');
    if (!photo || !num || !desc) return;
    /* фото кроку 2 стоїть зліва: відкривається зліва направо; кроки 1 і 3: справа наліво */
    const fromLeft = step.classList.contains('step--2');
    gsap.set(photo, {
      clipPath: fromLeft ? `inset(0% 100% 0% 0% ${r})` : `inset(0% 0% 0% 100% ${r})`,
      filter: 'blur(14px)',
      scale: 1.08,
      transformOrigin: fromLeft ? '0% 50%' : '100% 50%',
    });
    gsap.set(num, { y: 40, opacity: 0 });
    gsap.set(desc, { y: 28, opacity: 0, filter: 'blur(10px)' });

    gsap
      .timeline({
        defaults: { ease: 'expo.out' },
        scrollTrigger: { trigger: step, start: 'top 80%', once: true },
        onComplete: () => gsap.set([photo, num, desc], { clearProps: 'clipPath,transform,opacity,filter' }),
      })
      .to(photo, { clipPath: `inset(0% 0% 0% 0% ${r})`, filter: 'blur(0px)', scale: 1, duration: 1.7 }, 0)
      .to(num, { y: 0, opacity: 1, duration: 1.3 }, 0.2)
      .to(desc, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.3 }, 0.4);
  });

  if (cta) {
    gsap.set(cta, { opacity: 0, y: 30, scale: 0.9 });
    gsap.to(cta, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.3,
      ease: 'expo.out',
      scrollTrigger: { trigger: cta, start: 'top 92%', once: true },
      onComplete: () => gsap.set(cta, { clearProps: 'transform,opacity' }),
    });
  }
}

/* 12 Безпека: заголовок виїжджає по рядках; кожен рядок-аркуш при скролі до нього: лінія виростає зліва направо,
   назва піднімається по рядках, м'яч-тумблер вистрибує з обертом, опис проявляється з розмиттям по рядках,
   фото відкриваються знизу вгору по черзі. Один раз. Час і ефекти: моє припущення, чекаю уточнень. */
function initSafetyReveal(): void {
  const root = document.querySelector<HTMLElement>('.safety');
  if (!root) return;
  const lines = root.querySelectorAll('.safety__line');

  gsap.set(lines, { y: 50, skewY: 4, opacity: 0 });
  gsap
    .timeline({ defaults: { ease: 'expo.out' }, scrollTrigger: { trigger: root.querySelector('.safety__title'), start: 'top 85%', once: true } })
    .to(lines, { y: 0, skewY: 0, opacity: 1, duration: 1.3, stagger: 0.15 });

  root.querySelectorAll<HTMLElement>('.safety__row').forEach((row) => {
    const names = row.querySelectorAll('.safety__name-line');
    const toggle = row.querySelector('.safety__toggle');
    const desc = row.querySelectorAll('.safety__desc-line');
    const photos = row.querySelectorAll('.safety__photos img');

    gsap.set(row, { '--line': 0 });
    gsap.set(names, { y: 40, skewY: 4, opacity: 0 });
    gsap.set(toggle, { scale: 0, rotate: -25, opacity: 0, transformOrigin: '50% 50%' });
    gsap.set(desc, { y: 18, opacity: 0, filter: 'blur(8px)' });
    gsap.set(photos, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15, transformOrigin: '50% 100%' });

    gsap
      .timeline({
        defaults: { ease: 'expo.out' },
        scrollTrigger: { trigger: row, start: 'top 85%', once: true },
        onComplete: () => gsap.set([names, toggle, desc, photos], { clearProps: 'clipPath,transform,opacity,filter' }),
      })
      .to(row, { '--line': 1, duration: 1.6 }, 0)
      .to(names, { y: 0, skewY: 0, opacity: 1, duration: 1.2, stagger: 0.12 }, 0.15)
      .to(toggle, { scale: 1, rotate: 0, opacity: 1, duration: 1.1, ease: 'back.out(1.8)' }, 0.55)
      .to(desc, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, stagger: 0.1 }, 0.4)
      .to(photos, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.5, stagger: 0.15 }, 0.3);
  });
}
