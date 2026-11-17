(function () {
  const root = document.documentElement;
  if (root.dataset.allegationsClosed === 'true') {
    const formattedDeadline = new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'long', timeZone: 'UTC',
    }).format(new Date(root.dataset.allegationsUntil));
    const closedMessage = `El plazo de información pública finalizó el ${formattedDeadline}. Consulta el expediente oficial para conocer su estado actualizado.`;

    document.querySelectorAll('a.btn-primary[href="#participa"]').forEach(link => {
      link.textContent = 'Consulta el expediente →';
    });
    document.querySelector('.info-fact-status .info-fact-index').textContent = '04 / ESTADO';
    document.querySelector('.info-fact-status .info-fact-kicker').textContent = 'Estado del trámite';
    document.querySelector('.info-fact-status > strong').textContent = 'Plazo finalizado';
    document.querySelector('.info-fact-status > span:last-child').textContent = closedMessage;
    document.querySelector('.participa-heading > p:last-child').textContent = closedMessage;
    document.querySelector('[data-allegations-question]').textContent = '¿Cuál es el estado del trámite?';
    document.querySelector('[data-allegations-answer]').textContent = closedMessage;
  }

  const share = document.querySelector('.participa-share');
  const shareStatus = document.querySelector('#share-status');
  const shareUrl = document.querySelector('#share-url');
  share.addEventListener('click', async () => {
    const url = document.querySelector('link[rel="canonical"]').href;
    shareStatus.textContent = '';
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Defendamos Titulcia', url });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      shareStatus.textContent = 'Enlace copiado';
    } catch {
      shareUrl.value = url;
      shareUrl.hidden = false;
      shareUrl.select();
      shareStatus.textContent = 'Puedes copiar el enlace seleccionado.';
    }
  });
})();
