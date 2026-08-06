export function startProgressUpdates() {
  function updateProgress() {
    const now = Date.now();

    document.querySelectorAll(".progress-bar").forEach((bar) => {
      const startedAt = Number(bar.dataset.startedAt);
      const craftTime = Number(bar.dataset.craftTime) * 1000;

      if (!startedAt || !craftTime) return;

      let progress = (now - startedAt) / craftTime;
      progress = Math.min(Math.max(progress, 0), 1);

      bar.style.width = `${progress * 100}%`;

      if (progress >= 1) {
        bar.classList.add("complete");
      }
    });
  }

  updateProgress();

  return setInterval(updateProgress, 250);
}
