/* 13 Кемпи: «+» на фото. На hover (миша) і по кліку (тач) кружечок з хрестиком перетворюється на крапку, поруч з'являється картка.
   Одночасно відкрита одна: клік поза карткою або Esc закривають. */
export function initCamps(): void {
  const spots = document.querySelectorAll<HTMLElement>('.camp__spot');
  if (!spots.length) return;

  const setOpen = (spot: HTMLElement, open: boolean): void => {
    spot.classList.toggle('is-open', open);
    spot.querySelector('.camp__plus')?.setAttribute('aria-expanded', String(open));
  };
  const closeAll = (except?: HTMLElement): void => spots.forEach((s) => s !== except && setOpen(s, false));

  spots.forEach((spot) => {
    spot.querySelector('.camp__plus')?.addEventListener('click', () => {
      const open = !spot.classList.contains('is-open');
      closeAll(spot);
      setOpen(spot, open);
    });
  });

  document.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('.camp__spot')) closeAll();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });
}
