const { test, expect } = require('@playwright/test');
const axe = require('axe-core');

const campaignDay = '2026-11-17T12:00:00Z';

async function openCampaign(page, time = campaignDay) {
  await page.clock.setFixedTime(new Date(time));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
}

for (const [width, height] of [[320, 568], [390, 844], [767, 900], [768, 1024], [1024, 768], [1280, 720], [1440, 900]]) {
  test(`portada y convocatoria a ${width} × ${height}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await openCampaign(page);

    const title = page.getByRole('heading', { level: 1 });
    const event = page.getByRole('complementary', { name: /Asamblea del grupo de Ciempozuelos/ });
    await expect(title).toBeInViewport();
    await expect(event).toBeInViewport();
    await expect(event).toContainText('18:00 h');
    await expect(event).toContainText('Colegio Eloy Saavedra');
    await expect(event.getByRole('link', { name: /Cómo llegar/ })).toHaveAttribute('href', /google\.com\/maps/);

    for (const name of ['Hazte escuchar', 'Infórmate']) {
      const action = page.getByRole('link', { name, exact: name === 'Infórmate' });
      await expect(action).toBeInViewport({ ratio: 0.99 });
      await action.click({ trial: true });
    }

    const layout = await page.evaluate(() => {
      const headline = document.querySelector('h1 .reveal-line:nth-child(2) > span');
      const range = document.createRange();
      range.selectNodeContents(headline);
      return {
        pageWidth: document.documentElement.scrollWidth,
        titleRight: range.getBoundingClientRect().right,
        missingAnchors: [...document.querySelectorAll('a[href^="#"]')]
          .map(link => link.hash.slice(1)).filter(id => !document.getElementById(id)),
      };
    });
    expect(layout.pageWidth).toBeLessThanOrEqual(width);
    expect(layout.titleRight).toBeLessThanOrEqual(width);
    expect(layout.missingAnchors).toEqual([]);

    await page.getByRole('link', { name: 'Infórmate', exact: true }).click();
    await expect(page).toHaveURL(/#informacion$/);
    await expect(page.locator('#info-title')).toBeInViewport();
    expect(errors).toEqual([]);
  });
}

test('el teclado permite abrir, cerrar y usar el menú móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCampaign(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  const toggle = page.getByRole('button', { name: /menú/ });
  const mobileNav = page.getByRole('navigation', { name: 'Menú móvil' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAccessibleName('Cerrar menú');
  await expect(mobileNav.getByRole('link', { name: 'Inicio' })).toBeFocused();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAccessibleName('Abrir menú');

  await page.keyboard.press('Enter');
  await mobileNav.getByRole('link', { name: 'Qué nos preocupa' }).click();
  await expect(page.locator('#impacto')).toBeFocused();
  await expect(page).toHaveURL(/#impacto$/);
});

test('la tarjeta del parque mueve el foco y las preguntas se expanden', async ({ page }) => {
  await openCampaign(page);
  const showPhoto = page.getByRole('button', { name: 'Ver el parque' });
  const back = page.getByRole('button', { name: 'Volver', exact: true });
  await showPhoto.focus();
  await page.keyboard.press('Enter');
  await expect(back).toBeFocused();
  await expect(page.getByRole('img', { name: /Soto Bayona/ })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(showPhoto).toBeFocused();
  await expect(showPhoto).toHaveAttribute('aria-expanded', 'false');

  const question = page.locator('details').filter({ hasText: '¿Habrá más camiones y ruido?' });
  await question.locator('summary').click();
  await expect(question).toHaveAttribute('open', '');
  await expect(question.locator('p')).toBeVisible();
});

test('las fechas se aplican a medianoche de Madrid', async ({ page }) => {
  const event = page.getByRole('complementary', { name: /Asamblea del grupo de Ciempozuelos/ });
  const sticker = page.locator('.hero-deadline-sticker');

  await openCampaign(page, '2026-11-19T22:59:59Z');
  await expect(event).toBeVisible();
  await openCampaign(page, '2026-11-19T23:00:00Z');
  await expect(event).toBeHidden();
  await expect(sticker).toBeVisible();

  await openCampaign(page, '2026-11-25T22:59:59Z');
  await expect(sticker).toBeVisible();
  await openCampaign(page, '2026-11-25T23:00:00Z');
  await expect(sticker).toBeHidden();
  await expect(page.locator('#guia-alegaciones')).toBeHidden();
  await expect(page.getByText('Plazo finalizado', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Consulta el expediente/ }).first()).toBeVisible();
  const status = page.locator('details').filter({ hasText: '¿Cuál es el estado del trámite?' });
  await status.locator('summary').click();
  await expect(status).toContainText('finalizó el 25 de noviembre de 2026');
});

test('compartir ofrece un enlace seleccionable si el navegador no permite copiar', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined });
    Object.defineProperty(navigator, 'clipboard', { value: undefined });
  });
  await openCampaign(page);
  await page.getByRole('button', { name: 'Compartir esta página' }).click();
  const url = page.getByRole('textbox', { name: 'Enlace de la campaña' });
  await expect(url).toHaveValue('https://noalaincineradoraentitulcia.es/');
  await expect(url).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('Puedes copiar el enlace seleccionado.');
});

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`contraste y accesibilidad en día y noche a ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openCampaign(page);
    for (const theme of ['light', 'dark']) {
      if (theme === 'dark') {
        await page.getByRole('button', { name: 'Cambiar a modo noche' }).click();
        await expect(page.getByRole('button', { name: 'Cambiar a modo día' })).toHaveAttribute('aria-pressed', 'true');
        await page.reload();
      }
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => {
        const results = await window.axe.run();
        return results.violations.map(({ id, nodes }) => ({ id, elements: nodes.map(node => node.target) }));
      });
      expect(violations).toEqual([]);
    }
  });
}

test('la cinta se anima y se puede pausar con el foco', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openCampaign(page);
  const banner = page.getByRole('complementary', { name: /Asamblea del grupo de Ciempozuelos/ });
  const track = banner.locator('.event-marquee-track');
  await expect(banner).toHaveCSS('background-color', 'rgb(216, 58, 40)');
  await expect(page.locator('html')).toHaveCSS('--color-accent', '#d83c24');
  await expect(track).toHaveCSS('animation-name', 'eventTicker');
  await expect(track).toHaveCSS('animation-play-state', 'running');
  await expect(banner).toBeInViewport();
  await page.getByRole('link', { name: 'Infórmate', exact: true }).click({ trial: true });

  await page.keyboard.press('Tab');
  await banner.getByRole('link', { name: /Cómo llegar/ }).focus();
  await expect(track).toHaveCSS('animation-play-state', 'paused');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(track).toHaveCSS('animation-name', 'none');
});
