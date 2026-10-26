/* Спільна поведінка відео-блоків (hero і секція 07): клік або Enter/Space — відтворити чи поставити на паузу, клас .is-playing на блоці */
export function bindVideoToggle(box: HTMLElement, video: HTMLVideoElement): void {
  const toggle = (): void => {
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  };

  video.addEventListener('play', () => box.classList.add('is-playing'));
  video.addEventListener('pause', () => box.classList.remove('is-playing'));

  box.addEventListener('click', toggle);
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
}
