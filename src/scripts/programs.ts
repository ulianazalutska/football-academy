/* 05 Фільтр за віком: вибраний сегмент стає рожевим, відповідна картка світиться, решта затемнюється.
   Початково вибрано «10-12»; по кліку на вік сторінка плавно прокручується до картки; вицвітання решти вмикається, коли сітка потрапляє в екран. */
export function initPrograms(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.age-filter__btn');
  const grid = document.querySelector<HTMLElement>('.programs__grid');
  const cards = document.querySelectorAll<HTMLElement>('.program[data-age]');
  if (!buttons.length || !grid) return;

  const setOpen = (card: HTMLElement, open: boolean) => {
    card.classList.toggle('is-open', open);
    const panel = card.querySelector<HTMLElement>('.program__panel');
    if (panel) panel.hidden = false;
    card.querySelector('.program__more')?.setAttribute('aria-expanded', String(open));
  };

  cards.forEach((card) => {
    card.querySelector('.program__more')?.addEventListener('click', () => {
      const open = !card.classList.contains('is-open');
      cards.forEach((c) => setOpen(c, false));
      setOpen(card, open);
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cards.forEach((c) => setOpen(c, false));
  });

  /* при прокрутці до секції одразу вибрано «10-12», решта карток вицвітає */
  new IntersectionObserver(
    (entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        grid.classList.add('is-filtered');
        obs.disconnect();
      }
    },
    { threshold: 0.35 },
  ).observe(grid);

  /* radiogroup за стандартом: у табі лише вибраний пункт, між пунктами ходять стрілки, Home і End */
  const list = Array.from(buttons);
  const syncTab = (): void => list.forEach((b) => (b.tabIndex = b.classList.contains('is-active') ? 0 : -1));
  syncTab();
  list.forEach((btn, i) => {
    btn.addEventListener('keydown', (e) => {
      const to = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : null;
      if (to === null) return;
      e.preventDefault();
      const next = list[(to + list.length) % list.length];
      next.focus();
      next.click();
    });
  });

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const age = btn.dataset.age;
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-checked', String(on));
      });
      syncTab();
      grid.classList.add('is-filtered');
      cards.forEach((card) => card.classList.toggle('is-match', card.dataset.age === age));
      /* плавно веде до відповідної картки (по центру екрана) */
      const target = Array.from(cards).find((card) => card.dataset.age === age);
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    });
  });
}
