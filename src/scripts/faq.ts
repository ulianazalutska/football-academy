/* 14 Часті питання: акордеон за прикладом accordion-05. Відкрите одне питання за раз (моє припущення), початково всі закриті (підтверджено).
   Ефект (піднімання тексту питання, розкриття висоти) робить CSS через клас .is-open на пункті. */
export function initFaq(): void {
  const items = document.querySelectorAll<HTMLElement>('.faq__item');
  if (!items.length) return;

  const setOpen = (item: HTMLElement, open: boolean): void => {
    item.classList.toggle('is-open', open);
    item.querySelector('.faq__q')?.setAttribute('aria-expanded', String(open));
  };

  items.forEach((item) => {
    item.querySelector('.faq__q')?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach((other) => other !== item && setOpen(other, false));
      setOpen(item, open);
    });
  });
}
