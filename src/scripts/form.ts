/* 15 Форма «ЗВ'ЯЖІТЬСЯ З НАМИ»: верстка і валідація, без бекенду (рішення 6).
   Обов'язкові: ваше ім'я, ім'я гравчині, телефон (моє рішення). Телефон: маска +380 XX XXX XX XX.
   «Що цікавить» заповнюється кнопкою в картці: «Записатися» в програмі ставить її назву, «ЗАБРОНЮВАТИ МІСЦЕ» ставить «Кемп» і підставляє назву кемпу в повідомлення. */
const MSG_NAME = "Будь ласка, вкажіть ім'я";
const MSG_PHONE = 'Вкажіть номер у форматі +380 XX XXX XX XX';

function formatPhone(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (!d) return '';
  if (!d.startsWith('380')) d = '380' + d.replace(/^(80|0)/, '');
  d = d.slice(0, 12);
  const p = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
  return '+' + p.join(' ');
}

/* власний випадаючий список замість нативного select (плавне відкриття, стиль сайту); нативний лишається прихованим для даних */
function enhanceSelect(select: HTMLSelectElement): void {
  const label = document.querySelector<HTMLElement>(`label[for="${select.id}"]`);
  const options = Array.from(select.options).filter((o) => o.value);
  const wrap = document.createElement('div');
  wrap.className = 'cselect';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cselect__btn';
  btn.id = select.id;
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  const val = document.createElement('span');
  btn.append(val);

  const list = document.createElement('ul');
  list.className = 'cselect__list';
  list.setAttribute('role', 'listbox');
  list.id = `${select.id}-list`;
  btn.setAttribute('aria-controls', list.id);
  if (label) {
    label.id ||= `${select.id}-label`;
    list.setAttribute('aria-labelledby', label.id);
  }

  const items = options.map((o) => {
    const li = document.createElement('li');
    li.className = 'cselect__opt';
    li.setAttribute('role', 'option');
    li.dataset.value = o.value;
    li.textContent = o.textContent;
    list.append(li);
    return li;
  });

  select.id = '';
  select.classList.add('cselect__native');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  select.after(wrap);
  wrap.append(btn, list);

  let active = -1;
  const setActive = (i: number): void => {
    active = i;
    items.forEach((li, n) => li.classList.toggle('is-active', n === i));
    if (i >= 0) btn.setAttribute('aria-activedescendant', items[i].id || (items[i].id = `${list.id}-${i}`));
  };
  const sync = (): void => {
    val.textContent = select.selectedOptions[0]?.textContent ?? '';
    btn.classList.toggle('is-placeholder', !select.value);
    items.forEach((li) => li.setAttribute('aria-selected', String(li.dataset.value === select.value)));
  };
  const open = (): void => {
    document.dispatchEvent(new CustomEvent('cselect:close', { detail: wrap }));
    wrap.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    setActive(Math.max(0, items.findIndex((li) => li.dataset.value === select.value)));
  };
  const close = (): void => {
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.removeAttribute('aria-activedescendant');
    setActive(-1);
  };
  const choose = (i: number): void => {
    select.value = items[i].dataset.value ?? '';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    close();
    btn.focus();
  };
  const isOpen = (): boolean => wrap.classList.contains('is-open');

  btn.addEventListener('click', () => (isOpen() ? close() : open()));
  items.forEach((li, i) => {
    li.addEventListener('mousemove', () => setActive(i));
    li.addEventListener('click', () => choose(i));
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen()) open();
      else setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
    } else if ((e.key === 'Enter' || e.key === ' ') && isOpen()) {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Tab') {
      close();
    }
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target as Node)) close();
  });
  document.addEventListener('cselect:close', (e) => {
    if ((e as CustomEvent<HTMLElement>).detail !== wrap) close();
  });
  select.addEventListener('change', sync);
  sync();
}

export function initForm(): void {
  const card = document.querySelector<HTMLElement>('#contact-form .contact__card');
  const form = card?.querySelector<HTMLFormElement>('form');
  if (!card || !form) return;
  form.noValidate = true;

  const submit = form.querySelector<HTMLButtonElement>('.contact__submit')!;
  const submitText = submit.querySelector<HTMLElement>('.contact__submit-text')!;
  const done = card.querySelector<HTMLElement>('.contact__done')!;
  form.querySelectorAll<HTMLSelectElement>('select').forEach(enhanceSelect);
  const phone = form.elements.namedItem('phone') as HTMLInputElement;

  const setError = (input: HTMLInputElement, msg: string): void => {
    const field = input.closest('.contact__field')!;
    field.classList.toggle('is-invalid', !!msg);
    input.setAttribute('aria-invalid', String(!!msg));
    const err = field.querySelector<HTMLElement>('.contact__error');
    if (err) err.textContent = msg;
    if (msg && err) input.setAttribute('aria-describedby', err.id);
    else input.removeAttribute('aria-describedby');
  };

  const check = (input: HTMLInputElement): boolean => {
    let msg = '';
    if (input.name === 'phone') {
      if (input.value.replace(/\D/g, '').length !== 12) msg = MSG_PHONE;
    } else if (!input.value.trim()) {
      msg = MSG_NAME;
    }
    setError(input, msg);
    return !msg;
  };

  const required = ['name', 'player', 'phone'].map((n) => form.elements.namedItem(n) as HTMLInputElement);

  phone.addEventListener('input', () => {
    phone.value = formatPhone(phone.value);
    if (phone.closest('.is-invalid')) check(phone);
  });
  phone.addEventListener('focus', () => {
    if (!phone.value) phone.value = '+380 ';
  });
  phone.addEventListener('blur', () => {
    if (phone.value.replace(/\D/g, '').length <= 3) phone.value = '';
  });
  required.forEach((input) => {
    let touched = false;
    input.addEventListener('blur', () => touched && check(input));
    input.addEventListener('input', () => {
      touched = true;
      if (input.closest('.is-invalid')) check(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = required.map(check).every(Boolean);
    if (!ok) {
      required.find((i) => i.closest('.is-invalid'))?.focus();
      return;
    }
    submit.disabled = true;
    submitText.textContent = 'Надсилаємо…';
    /* відправку на сервер підключимо пізніше; поки імітуємо успіх */
    window.setTimeout(() => {
      card.classList.add('is-sent');
      done.hidden = false;
    }, 900);
  });

  /* вибір кемпу на секції 13 */
  const interest = form.elements.namedItem('interest') as HTMLSelectElement;
  const message = form.elements.namedItem('message') as HTMLTextAreaElement;
  const camp = form.elements.namedItem('camp') as HTMLInputElement;
  document.querySelectorAll<HTMLElement>('[data-camp]').forEach((link) => {
    link.addEventListener('click', () => {
      const name = link.dataset.camp ?? '';
      camp.value = name;
      interest.value = 'Кемп';
      interest.dispatchEvent(new Event('change'));
      if (!message.value.trim() || message.value.startsWith('Кемп: ')) message.value = `Кемп: ${name}`;
    });
  });

  /* вибір програми в картці секції 05 */
  document.querySelectorAll<HTMLElement>('.program__join').forEach((link) => {
    link.addEventListener('click', () => {
      const name = link.closest('.program')?.querySelector('.program__name')?.textContent?.trim();
      if (!name) return;
      interest.value = name;
      interest.dispatchEvent(new Event('change'));
    });
  });
}
