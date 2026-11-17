# No a la incineradora en Titulcia

Web estática de la campaña. GitHub Pages sirve la raíz de `main`.

## Vista previa y pruebas

Instala Node.js y Python 3. Desde la raíz del repositorio:

```sh
npm ci
npm start
```

Abre <http://127.0.0.1:4173/>. Los cambios en HTML, CSS y JavaScript se ven al recargar.

Para instalar el navegador de pruebas y ejecutar la revisión:

```sh
npx playwright install chromium
npm test
```

En Linux, si faltan dependencias del navegador, usa `npx playwright install --with-deps chromium`.
Las pruebas levantan el servidor local. También comprueban la portada con fechas fijas de
noviembre de 2026 para que se pueda revisar la convocatoria aunque ya haya caducado.

## Dónde editar

- [index.html](index.html) contiene el texto, los enlaces y los estilos base de la portada.
- [assets/campaign-v2.css](assets/campaign-v2.css) contiene los ajustes de la portada, el banner y los colores de las tarjetas.
- [assets/campaign-dates.js](assets/campaign-dates.js) aplica las fechas en horario de Madrid.
  Para cambiar la convocatoria, actualiza `data-event-until` en la etiqueta `html` y edita el bloque
  `event-marquee` con la fecha visible, el lugar y el enlace al mapa. El aviso se oculta al acabar
  el día indicado. Para desactivarlo manualmente, quita `data-event-until`.
- El plazo de alegaciones se controla con `data-allegations-until`. Si cambia, actualiza también
  las fechas visibles del aviso, la tarjeta de estado, la pregunta frecuente y la sección Participa.
  Al vencer, la portada dirige al expediente oficial.
- [tests/portada.spec.js](tests/portada.spec.js) comprueba tamaños de pantalla, accesibilidad,
  interacción y caducidad. Si se programa otra convocatoria, actualiza las fechas y los datos
  esperados en estas pruebas.

`folio/` contiene la plantilla y los estilos compartidos. La portada carga el CSS compartido
ya compilado y puede previsualizarse sin ejecutar Tailwind.
