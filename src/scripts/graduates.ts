/* 10 Випускниці: стрічка на всю ширину вікна без смуги прокрутки.
   100vw включає смугу прокрутки, тому стрічка заходила б під неї, а розмиття підхоплювало б її темний колір. */
export function initGraduates(): void {
  const root = document.documentElement;
  const update = () => root.style.setProperty('--vw', `${root.clientWidth}px`);
  update();
  window.addEventListener('resize', update);
}
