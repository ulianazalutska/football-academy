/* Форма «ЗВ'ЯЖІТЬСЯ З НАМИ» (секція 15): верстка і валідація, без бекенду.
   Поля, правила і тексти помилок додаємо, коли користувачка дасть значення. */
export function initForm(): void {
  const form = document.querySelector<HTMLFormElement>('#contact-form form');
  if (!form) return;
  form.noValidate = true;
}
