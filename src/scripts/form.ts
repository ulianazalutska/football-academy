/* 15 Форма «ЗВ'ЯЖІТЬСЯ З НАМИ»: валідація і відправка в Google Apps Script (project/apps-script/Code.gs),
   адреса веб-застосунку лежить у VITE_FORM_ENDPOINT (.env). Без неї форма імітує успіх.
   Обов'язкові: ваше ім'я, ім'я гравчині, телефон (моє рішення). Телефон: маска +380 XX XXX XX XX.
   «Що цікавить» заповнюється кнопкою в картці: «Записатися» в програмі ставить її назву, «ЗАБРОНЮВАТИ МІСЦЕ» ставить «Кемп» і підставляє назву кемпу в повідомлення. */
const MSG_NAME = "Будь ласка, вкажіть ім'я";
import { gsap } from 'gsap';

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;
const MSG_EMAIL = 'Вкажіть email у форматі name@example.com';
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
  const fail = form.querySelector<HTMLElement>('.contact__fail')!;
  const title = card.querySelector<HTMLElement>('.contact__title')!;
  const back = card.querySelector<HTMLButtonElement>('.contact__back')!;
  const burst = card.querySelector<HTMLElement>('.contact__done-burst')!;
  const calm = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const submitLabel = submitText.textContent;
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
    } else if (input.name === 'email') {
      if (input.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) msg = MSG_EMAIL;
    } else if (!input.value.trim()) {
      msg = MSG_NAME;
    }
    setError(input, msg);
    return !msg;
  };

  const required = ['name', 'player', 'phone', 'email'].map((n) => form.elements.namedItem(n) as HTMLInputElement);

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

  const send = async (): Promise<void> => {
    if (!ENDPOINT) {
      console.warn('VITE_FORM_ENDPOINT не задано: відправку імітовано');
      await new Promise((r) => window.setTimeout(r, 900));
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    /* text/plain не викликає CORS preflight, який Apps Script не обробляє */
    const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) });
    const body = (await res.json()) as { ok: boolean };
    if (!body.ok) throw new Error('rejected');
  };

  /* екран подяки: форма виїжджає вгору, галочка малюється, навколо розлітаються цятки, текст і кнопка з'являються по черзі */
  const showDone = (): void => {
    const swap = (): void => {
      card.classList.add('is-sent');
      done.hidden = false;
    };
    if (calm()) return swap();
    const items = Array.from(done.querySelectorAll<HTMLElement>('.contact__done-title, .contact__done-text, .contact__back'));
    gsap
      .timeline()
      .to([title, form], { y: -14, opacity: 0, duration: 0.4, ease: 'power2.in' })
      .add(() => {
        swap();
        gsap.set([title, form], { clearProps: 'transform,opacity' });
        gsap.set('.contact__done-ring', { strokeDashoffset: 1 });
        gsap.set('.contact__done-tick', { strokeDashoffset: 1 });
        gsap.set('.contact__done-disc', { scale: 0 });
        gsap.set(items, { y: 18, opacity: 0 });
        burst.replaceChildren(
          ...Array.from({ length: 16 }, () => Object.assign(document.createElement('span'), { className: 'contact__dot' })),
        );
      })
      .to('.contact__done-ring', { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' })
      .to('.contact__done-disc', { scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, '<0.15')
      .to('.contact__done-tick', { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, '>-0.15')
      .add(() => {
        const dist = Math.min(window.innerWidth, 1440) * 0.075;
        burst.querySelectorAll<HTMLElement>('.contact__dot').forEach((dot, i, all) => {
          const a = (i / all.length) * Math.PI * 2 + Math.random() * 0.3;
          const r = dist * (0.8 + Math.random() * 0.6);
          gsap.fromTo(
            dot,
            { x: 0, y: 0, scale: 0.4, opacity: 1 },
            { x: Math.cos(a) * r, y: Math.sin(a) * r, scale: 1, opacity: 0, duration: 1.1, ease: 'power3.out' },
          );
        });
      }, '<-0.1')
      .to(items, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', stagger: 0.12 }, '<0.1');
  };

  /* «Повернутись до форми»: очищає поля й повертає форму плавно, по рядках */
  const resetForm = (): void => {
    form.reset();
    form.querySelectorAll('select').forEach((sel) => sel.dispatchEvent(new Event('change')));
    form.querySelectorAll<HTMLInputElement>('input').forEach((i) => {
      i.closest('.contact__field')?.classList.remove('is-invalid');
      i.removeAttribute('aria-invalid');
      i.removeAttribute('aria-describedby');
    });
    form.querySelectorAll('.contact__error').forEach((el) => (el.textContent = ''));
    fail.hidden = true;
    submit.disabled = false;
    submitText.textContent = submitLabel;
  };

  back.addEventListener('click', () => {
    const open = (): void => {
      resetForm();
      done.hidden = true;
      card.classList.remove('is-sent');
    };
    if (calm()) {
      open();
      required[0].focus();
      return;
    }
    gsap.to(done, {
      y: -10,
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        open();
        gsap.set(done, { clearProps: 'transform,opacity' });
        gsap.fromTo(
          [title, ...Array.from(form.children)],
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.05,
            clearProps: 'transform,opacity',
            onComplete: () => required[0].focus({ preventScroll: true }),
          },
        );
      },
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    const ok = required.map(check).every(Boolean);
    if (!ok) {
      required.find((i) => i.closest('.is-invalid'))?.focus();
      return;
    }
    fail.hidden = true;
    submit.disabled = true;
    submitText.textContent = 'Надсилаємо…';
    try {
      await send();
      showDone();
    } catch {
      fail.hidden = false;
      submit.disabled = false;
      submitText.textContent = submitLabel;
    }
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
