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

  // Ajusta el pie de la portada a la altura real de la convocatoria.
  // No interviene en el scroll ni cambia la posición del banner.
  const banner = document.querySelector('#main > .event-marquee');
  if (banner && root.dataset.eventActive === 'true') {
    const measureBanner = () => {
      const styles = getComputedStyle(banner);
      if (styles.display === 'none') return;
      const footprint = Math.ceil(
        banner.getBoundingClientRect().height +
        (parseFloat(styles.marginTop) || 0) +
        (parseFloat(styles.marginBottom) || 0)
      );
      if (footprint > 0) root.style.setProperty('--campaign-banner-footprint', `${footprint}px`);
    };
    measureBanner();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(measureBanner).observe(banner);
    }
    window.addEventListener('resize', measureBanner, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureBanner);
  }
})();
