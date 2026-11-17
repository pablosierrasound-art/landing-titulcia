// Cargar antes del contenido para evitar que aparezcan avisos ya vencidos.
(function () {
  const root = document.documentElement;
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const today = [date.year, date.month, date.day].join('-');

  root.dataset.eventActive = String(Boolean(root.dataset.eventUntil) && today <= root.dataset.eventUntil);
  root.dataset.allegationsClosed = String(today > root.dataset.allegationsUntil);
  root.classList.add('js');
})();
