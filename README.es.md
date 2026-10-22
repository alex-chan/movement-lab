# Movement Lab · Demostraciones de ejercicios en 3D

[简体中文](README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

**Observa cómo se realiza cada ejercicio y qué músculos participan.**

Movement Lab ofrece **50 ejercicios, 6 categorías y 8 idiomas** en el navegador, con peso corporal, barras, mancuernas, poleas y máquinas.

**[Ver la aplicación](https://movement-lab.pages.dev/es/)** · [Press de banca](https://movement-lab.pages.dev/es/exercises/bench/)

![Movement Lab — 50 exercises](docs/screenshots/movement-library.png)

![3D bench press preview](web/public/previews/bench.png)

## Funciones

- Demostraciones 3D con rotación, zoom y vistas predefinidas.
- Rojo oscuro para músculos principales, rojo claro para auxiliares o estabilizadores y blanco para otras zonas.
- Reproducción, pausa, reinicio, control del progreso y velocidades 0.5× / 1× / 1.5×.
- Posición inicial, fases del movimiento, errores frecuentes y referencias.
- Búsqueda por ejercicio, equipo o músculo y filtros por zona.
- Chino, inglés, español, francés, alemán, portugués, japonés y coreano.
- Aplicación estática Three.js + Vite, sin servidor propio, cuenta ni clave de API de IA.

## Ejercicios

Pecho: **8**; espalda: **8**; hombros: **6**; brazos: **6**; piernas: **17**; zona media: **5**. Incluye press de banca, sentadillas, peso muerto, dominadas, zancadas, press en máquina, curl femoral, plancha y bird dog.

## Ejecución local

Requiere Node.js **20.19+ de la rama 20.x, o 22.12+**, y un navegador con WebGL2.

```bash
git clone https://github.com/alex-chan/movement-lab.git
cd movement-lab/web
npm ci
npm run dev
```

Abre la URL indicada, normalmente `http://localhost:5173/`. Los modelos y recursos Draco están incluidos; no necesitas Blender. Usa HTTP, no abras el HTML directamente.

## Comprobación y publicación

Desde `web/`:

```bash
npm run check:movements
npm run check:i18n
npm run build
npm run check:seo
npm run preview
```

Define `SITE_URL` con la URL pública real en `web/.env.production`, excluido de Git. Publica `web/dist/` en Cloudflare Pages u otro alojamiento estático, conservando las páginas y respuestas 404. La versión actual usa carga directa; los cambios de GitHub no se publican automáticamente.

Con `SITE_URL` se generan canonical, hreflang y sitemap, además del contenido HTML y los metadatos por idioma. Sin esta variable se utiliza noindex. Consulta la [guía de desarrollo en inglés](docs/DEVELOPMENT.md); las notas de [SEO](web/README-SEO.md) e [idiomas](web/README-I18N.md) están en chino.

## Límites y atribución

Las animaciones no simulan cargas reales ni tejidos blandos. Los colores muestran funciones musculares, **no activación medida**; las zonas blancas también pueden estabilizar. No sustituyen la orientación individual ni el consejo médico.

El atlas complementario en `/anatomy/` conserva sus contenidos y explicaciones en inglés/hindi; no está traducido a los ocho idiomas de los ejercicios.

Basado en [3d-human-body-anatomy](https://github.com/SeemaBansal1/3d-human-body-anatomy), con su historial y [documentación original](README-ANATOMY.md). Los modelos Z-Anatomy / BodyParts3D conservan las condiciones de atribución y compartir igual. La capa de órganos incluye un **riñón CC BY-NC 4.0 que debe retirarse o sustituirse antes de una publicación comercial**. Consulta [CREDITS.md](CREDITS.md).
