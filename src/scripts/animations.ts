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
  initCampsReveal();
  initFaqReveal();
  initContactReveal();
  initReadyReveal();
  initFooterReveal();
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* 03 Банер: увесь заголовок (рядки й лінії) м'яко проявляється одним блоком, лінії без окремої анімації */
function initBannerAnimation(): void {
  const title = document.querySelector<HTMLElement>('.banner__title');
  if (!title) return;

  gsap.set(title, { y: 24, opacity: 0 });
  gsap.to(title, {
    y: 0,
    opacity: 1,
    duration: 1.2,
    ease: 'power2.out',
    scrollTrigger: { trigger: title, start: 'top 80%', once: true },
    onComplete: () => gsap.set(title, { clearProps: 'transform,opacity' }),
  });
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

/* 04 Поява секції: усе м'яко проявляється з легким підйомом (фото, заголовок, абзац, блок статистики);
   м'яч-тумблер стоїть в абзаці й з'являється разом із текстом. */
function initAboutReveal(): void {
  const root = document.querySelector<HTMLElement>('.about__inner');
  if (!root) return;
  const q = (s: string) => root.querySelectorAll(s);
  const photo = root.querySelector('.about__photo');

  gsap.set(q('.about__title'), { y: 24, opacity: 0 });
  gsap.set(q('.about__text'), { y: 24, opacity: 0 });
  gsap.set(q('.about__stats'), { y: 30, opacity: 0 });
  gsap.set(photo, { y: 40, opacity: 0 });

  gsap
    .timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: root, start: 'top 75%', once: true },
      onComplete: () => gsap.set([...q('.about__title'), ...q('.about__text'), ...q('.about__stats'), photo], { clearProps: 'transform,opacity' }),
    })
    .to(photo, { y: 0, opacity: 1, duration: 1.3 }, 0)
    .to(q('.about__title'), { y: 0, opacity: 1, duration: 1.1 }, 0.15)
    .to(q('.about__text'), { y: 0, opacity: 1, duration: 1.2 }, 0.35)
    .to(q('.about__stats'), { y: 0, opacity: 1, duration: 1.2 }, 0.6);
}

/* 05 Поява секції: заголовок, підзаголовок і вік-фільтр м'яко проявляються,
   картки плавно проявляються й піднімаються по черзі. */
function initProgramsReveal(): void {
  const root = document.querySelector<HTMLElement>('.programs');
  const grid = root?.querySelector<HTMLElement>('.programs__grid');
  if (!root || !grid) return;
  const cards = grid.querySelectorAll<HTMLElement>('.program');
  const head = root.querySelector('.programs__head');

  gsap.set(root.querySelector('.programs__title'), { y: 24, opacity: 0 });
  gsap.set(root.querySelector('.programs__sub'), { y: 24, opacity: 0 });
  gsap.set(root.querySelector('.age-filter'), { y: 24, opacity: 0 });
  gsap.set(root.querySelectorAll('.programs__notes p'), { y: 20, opacity: 0 });

  gsap
    .timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: head, start: 'top 85%', once: true } })
    .to(root.querySelector('.programs__title'), { y: 0, opacity: 1, duration: 1.1, clearProps: 'transform,opacity' }, 0)
    .to(root.querySelector('.programs__sub'), { y: 0, opacity: 1, duration: 1.2, clearProps: 'transform,opacity' }, 0.2)
    .to(root.querySelector('.age-filter'), { y: 0, opacity: 1, duration: 1, onComplete: () => { gsap.set('.age-filter', { clearProps: 'transform,opacity' }); } }, 0.4);

  /* картки: плавно проявляються й трохи піднімаються по черзі (без зуму й відкриття).
     Анімуємо обгортку-стан через gsap.fromTo і прибираємо inline-стилі в кінці, щоб не зачепити hover і фільтр. */
  gsap.set(cards, { y: 40, opacity: 0, transition: 'none' });

  gsap
    .timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
      onComplete: () => {
        gsap.set(cards, { clearProps: 'transform,opacity,transition' });
      },
    })
    .to(cards, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12 }, 0)
    .to(root.querySelectorAll('.programs__notes p'), { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, 0.9);
}

/* 06 Поява секції: фото і заголовок м'яко проявляються, м'яч-тумблер з'являється разом з підзаголовком,
   список із шести напрямів проявляється одним блоком. */
function initMethodReveal(): void {
  const root = document.querySelector<HTMLElement>('.method__inner');
  if (!root) return;
  const photo = root.querySelector('.method__photo');
  const lines = root.querySelectorAll('.method__line');
  const items = root.querySelectorAll('.method__list');

  gsap.set(photo, { y: 40, opacity: 0 });
  gsap.set(lines, { y: 24, opacity: 0 });
  gsap.set(root.querySelector('.method__sub'), { y: 24, opacity: 0 });
  gsap.set(items, { y: 30, opacity: 0 });

  gsap
    .timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: root, start: 'top 75%', once: true },
      onComplete: () => {
        gsap.set([photo, ...lines, root.querySelector('.method__sub'), ...items], { clearProps: 'transform,opacity' });
      },
    })
    .to(photo, { y: 0, opacity: 1, duration: 1.3 }, 0)
    .to(lines, { y: 0, opacity: 1, duration: 1.1, stagger: 0.15 }, 0.25)
    .to(root.querySelector('.method__sub'), { y: 0, opacity: 1, duration: 1.2 }, 0.6)
    .to(items, { y: 0, opacity: 1, duration: 1.2 }, 0.4);
}

/* 07 Відео: при скролі росте на весь екран (бічні відступи й радіус зникають, висота = екран).
   Прив'язано до скролу (scrub), від 40% висоти екрана (за вказівкою користувачки) до верху секції: моє припущення, чекаю уточнень. */
function initVideoExpand(): void {
  const section = document.querySelector<HTMLElement>('.video');
  const box = section?.querySelector<HTMLElement>('.video__box');
  if (!section || !box) return;

  /* ≤1068: без ефекту скролу, відео одразу на весь екран (стилі в video.css) */
  gsap.matchMedia().add('(min-width: 1069px)', () => {
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
  });
}

/* 08 Результати: м'яка поява: заголовок по рядках, картки по черзі піднімаються знизу з фейдом
   (число й підпис разом із карткою). Один раз, коли секція в екрані. */
function initResultsReveal(): void {
  const root = document.querySelector<HTMLElement>('.results');
  if (!root) return;
  const lines = root.querySelectorAll('.results__line');
  const cards = root.querySelectorAll<HTMLElement>('.results__card');

  gsap.set(lines, { y: 24, opacity: 0 });
  gsap.set(cards, { y: 40, opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: root, start: 'top 65%', once: true },
    onComplete: () => gsap.set([...lines, ...cards], { clearProps: 'transform,opacity' }),
  });
  tl.to(lines, { y: 0, opacity: 1, duration: 1.1, stagger: 0.15 }, 0)
    .to(cards, { y: 0, opacity: 1, duration: 1.2, stagger: 0.12 }, 0.35);
}

/* 09 Тренерки: м'яка поява при скролі (один раз). Усе проявляється фейдом з легким підйомом, лапка і стрілки лише фейдом,
   напис по рядках, м'яч-тумблер з'являється разом із текстом свого рядка. */
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

  gsap.set(title, { y: 24, opacity: 0 });
  gsap.set(photo, { y: 30, opacity: 0 });
  gsap.set(mark, { opacity: 0 });
  gsap.set(text, { y: 20, opacity: 0 });
  gsap.set(name, { y: 24, opacity: 0 });
  gsap.set(arrows, { opacity: 0 });
  gsap.set(thumb, { y: 30, opacity: 0 });
  gsap.set(count, { y: 16, opacity: 0 });
  gsap.set(lines, { y: 24, opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: root, start: 'top 65%', once: true },
    onComplete: () => gsap.set(all, { clearProps: 'transform,opacity' }),
  });
  tl.to(title, { y: 0, opacity: 1, duration: 1.1 }, 0)
    .to(photo, { y: 0, opacity: 1, duration: 1.3 }, 0.2)
    .to(mark, { opacity: 1, duration: 1.1 }, 0.7)
    .to(text, { y: 0, opacity: 1, duration: 1.2 }, 0.85)
    .to(name, { y: 0, opacity: 1, duration: 1.1 }, 1.1)
    .to(arrows, { opacity: 1, duration: 1.2, stagger: 0.15 }, 1.3)
    .to(thumb, { y: 0, opacity: 1, duration: 1.3 }, 0.9)
    .to(count, { y: 0, opacity: 1, duration: 1 }, 1.4)
    .to(lines, { y: 0, opacity: 1, duration: 1.2, stagger: 0.15 }, 1.0);
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

/* 10 Випускниці: заголовок м'яко проявляється з легким підйомом. Стрічка логотипів без анімації появи. Один раз. */
function initGraduatesReveal(): void {
  const root = document.querySelector<HTMLElement>('.graduates');
  const title = root?.querySelector<HTMLElement>('.graduates__title');
  if (!root || !title) return;

  gsap.set(title, { y: 24, opacity: 0 });
  gsap.to(title, {
    y: 0,
    opacity: 1,
    duration: 1.1,
    ease: 'power2.out',
    scrollTrigger: { trigger: root, start: 'top 70%', once: true },
    onComplete: () => gsap.set(title, { clearProps: 'transform,opacity' }),
  });
}

/* 11 Три кроки: заголовок по рядках; кожен крок окремо при скролі до його фото: фото і текстовий блок (число + опис)
   м'яко проявляються з підйомом; кнопка так само. Один раз. */
function initStepsReveal(): void {
  const root = document.querySelector<HTMLElement>('.steps');
  if (!root) return;
  const lines = root.querySelectorAll('.steps__line');
  const cta = root.querySelector<HTMLElement>('.steps__cta');
  const steps = root.querySelectorAll<HTMLElement>('.step');

  gsap.set(lines, { y: 24, opacity: 0 });
  gsap
    .timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: root.querySelector('.steps__title'), start: 'top 80%', once: true } })
    .to(lines, { y: 0, opacity: 1, duration: 1.1, stagger: 0.15, clearProps: 'transform,opacity' });

  steps.forEach((step) => {
    const photo = step.querySelector<HTMLElement>('.step__photo');
    const text = step.querySelector<HTMLElement>('.step__text');
    if (!photo || !text) return;
    gsap.set(photo, { y: 40, opacity: 0 });
    gsap.set(text, { y: 30, opacity: 0 });

    /* .step не має висоти (фото й текст абсолютні), тож тригер стоїть на самому фото */
    gsap
      .timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: photo, start: 'top 85%', once: true },
        onComplete: () => gsap.set([photo, text], { clearProps: 'transform,opacity' }),
      })
      .to(photo, { y: 0, opacity: 1, duration: 1.3 }, 0)
      .to(text, { y: 0, opacity: 1, duration: 1.2 }, 0.2);
  });

  if (cta) {
    gsap.set(cta, { opacity: 0, y: 24 });
    gsap.to(cta, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: cta, start: 'top 92%', once: true },
      onComplete: () => gsap.set(cta, { clearProps: 'transform,opacity' }),
    });
  }
}

/* 12 Безпека: заголовок по рядках; кожен рядок-аркуш при скролі до нього: лінія виростає зліва направо,
   увесь рядок (назва, м'яч-тумблер, опис, фото) м'яко проявляється одним блоком. Один раз. */
function initSafetyReveal(): void {
  const root = document.querySelector<HTMLElement>('.safety');
  if (!root) return;
  const lines = root.querySelectorAll('.safety__line');

  gsap.set(lines, { y: 24, opacity: 0 });
  gsap
    .timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: root.querySelector('.safety__title'), start: 'top 85%', once: true } })
    .to(lines, { y: 0, opacity: 1, duration: 1.1, stagger: 0.15, clearProps: 'transform,opacity' });

  root.querySelectorAll<HTMLElement>('.safety__row').forEach((row) => {
    gsap.set(row, { '--line': 0, y: 30, opacity: 0 });

    gsap
      .timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: row, start: 'top 85%', once: true },
        onComplete: () => gsap.set(row, { clearProps: 'transform,opacity' }),
      })
      .to(row, { '--line': 1, duration: 1.4 }, 0)
      .to(row, { y: 0, opacity: 1, duration: 1.2 }, 0);
  });
}

/* 15 Форма: проста поява, картка плавно проявляється один раз.
   Лише прозорість (transform картки тримає центрування). Тривалість 1 с: моє припущення, чекаю уточнень. */
function initContactReveal(): void {
  const root = document.querySelector<HTMLElement>('.contact');
  const card = root?.querySelector<HTMLElement>('.contact__card');
  if (!root || !card) return;

  gsap.set(card, { opacity: 0 });
  gsap.to(card, {
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: { trigger: root, start: 'top 60%', once: true },
    onComplete: () => gsap.set(card, { clearProps: 'opacity' }),
  });
}

/* 13 Кемпи: заголовок з підзаголовком проявляються разом; кожна картка проявляється цілим блоком (фейд + підйом).
   Картки по черзі (на десктопі зі зсувом, на вузьких кожна по своєму скролу). */
function initCampsReveal(): void {
  const root = document.querySelector<HTMLElement>('.camps');
  const list = root?.querySelector<HTMLElement>('.camps__list');
  const cards = root?.querySelectorAll<HTMLElement>('.camp');
  if (!root || !list || !cards?.length) return;
  const head = [root.querySelector('.camps__title'), ...root.querySelectorAll('.camps__sub-line')];

  gsap.set(head, { y: 24, opacity: 0 });
  gsap.to(head, {
    y: 0,
    opacity: 1,
    duration: 1.1,
    ease: 'power2.out',
    scrollTrigger: { trigger: root.querySelector('.camps__head'), start: 'top 85%', once: true },
    onComplete: () => gsap.set(head, { clearProps: 'transform,opacity' }),
  });

  const wide = window.matchMedia('(min-width: 1024px)').matches;
  cards.forEach((card, i) => {
    gsap.set(card, { y: 40, opacity: 0, transition: 'none' });
    gsap.to(card, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out',
      delay: wide ? i * 0.18 : 0,
      scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      onComplete: () => gsap.set(card, { clearProps: 'transform,opacity,transition' }),
    });
  });
}

/* 14 FAQ: заголовок і рядки питань по черзі м'яко проявляються з легким підйомом. Один раз. */
function initFaqReveal(): void {
  const root = document.querySelector<HTMLElement>('.faq');
  const title = root?.querySelector<HTMLElement>('.faq__title');
  const items = root?.querySelectorAll<HTMLElement>('.faq__item');
  if (!root || !title || !items?.length) return;

  gsap.set(title, { opacity: 0, y: 24 });
  gsap.set(items, { opacity: 0, y: 24 });

  gsap
    .timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: title, start: 'top 85%', once: true } })
    .to(title, { opacity: 1, y: 0, duration: 1.1, clearProps: 'transform,opacity' }, 0)
    .to(items, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, clearProps: 'transform,opacity' }, 0.3);
}

/* 16 Готова?: усе стоїть на місці й лише проявляється з розмиття (за референсом у project/sections/16-ready/анімація):
   спершу логотип «girls XI Academy» (разом), потім «ГОТОВА?». Один раз. */
function initReadyReveal(): void {
  const root = document.querySelector<HTMLElement>('.ready');
  const title = root?.querySelector<HTMLElement>('.ready__title');
  const logo = root?.querySelector<SVGSVGElement>('.ready__logo');
  if (!root || !title || !logo) return;

  gsap.set([logo, title], { opacity: 0, filter: 'blur(14px)' });

  gsap
    .timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: root, start: 'top 65%', once: true } })
    .to(logo, { opacity: 1, filter: 'blur(0px)', duration: 1.4, clearProps: 'filter,opacity' }, 0)
    .to(title, { opacity: 1, filter: 'blur(0px)', duration: 1.4, clearProps: 'filter,opacity' }, 0.6);
}

/* 17 Футер: м'який каскад. Слоган (друга половина на 0,15 с пізніше) → дівчинка → таблетки, години, іконки → колонки → лінія розтягується, потім нижній рядок.
   Один раз, без різких рухів. Час і ефекти: мої, погоджено в чаті. */
function initFooterReveal(): void {
  const root = document.querySelector<HTMLElement>('.footer');
  if (!root) return;
  const q = <T extends HTMLElement>(s: string) => root.querySelectorAll<T>(s);
  const slogans = q('.footer__slogan');
  const girl = q('.footer__girl');
  const small = q('.footer__pill, .footer__hours, .footer__social li');
  const cols = q('.footer__col, .footer__address');
  const bottomText = q('.footer__bottom p');
  const bottom = root.querySelector<HTMLElement>('.footer__bottom');
  if (!bottom) return;

  gsap.set(slogans, { opacity: 0, y: 24 });
  gsap.set(girl, { opacity: 0, y: 16 });
  gsap.set(small, { opacity: 0, y: 12 });
  gsap.set(cols, { opacity: 0 });
  gsap.set(bottomText, { opacity: 0 });
  gsap.set(bottom, { '--line': 0 });

  gsap
    .timeline({ defaults: { ease: 'power2.out' }, scrollTrigger: { trigger: root, start: 'top 85%', once: true } })
    .to(slogans, { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, clearProps: 'transform,opacity' }, 0)
    .to(girl, { opacity: 1, y: 0, duration: 0.8, clearProps: 'transform,opacity' }, 0.3)
    .to(small, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, clearProps: 'transform,opacity' }, 0.5)
    .to(cols, { opacity: 1, duration: 0.8, stagger: 0.08, clearProps: 'opacity' }, 0.9)
    .to(bottom, { '--line': 1, duration: 0.8, ease: 'power1.inOut' }, 1.1)
    .to(bottomText, { opacity: 1, duration: 0.6, clearProps: 'opacity' }, 1.6);
}
