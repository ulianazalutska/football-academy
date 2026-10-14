/* 05 Фільтр за віком: вибраний сегмент стає рожевим, відповідна картка світиться, решта затемнюється.
   Початково вибрано «10-12»; вицвітання решти вмикається, коли сітка потрапляє в екран. */
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

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const age = btn.dataset.age;
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-checked', String(on));
      });
      grid.classList.add('is-filtered');
      cards.forEach((card) => card.classList.toggle('is-match', card.dataset.age === age));
    });
  });
}
