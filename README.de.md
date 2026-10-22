# Movement Lab · 3D-Übungsdemonstrationen

[简体中文](README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

**Bewegungen verstehen und die beteiligten Muskeln erkennen.**

Movement Lab ist eine 3D-Übungsbibliothek im Browser mit **50 Übungen, 6 Trainingsbereichen und 8 Sprachen**. Sie umfasst Eigengewichtsübungen, Langhanteln, Kurzhanteln, Kabelzüge und Trainingsgeräte.

**[Live-Demo](https://movement-lab-alex-chan.pages.dev/de/)** · [Bankdrücken](https://movement-lab-alex-chan.pages.dev/de/exercises/bench/)

![Movement Lab — 50 exercises](docs/screenshots/movement-library.png)

![3D bench press preview](web/public/previews/bench.png)

## Funktionen

- Interaktive 3D-Demonstrationen mit Drehen, Zoom und festen Kameraansichten.
- Dunkelrot für Hauptmuskeln, Hellrot für unterstützende oder stabilisierende Muskeln, Weiß für übrige Bereiche.
- Wiedergabe, Pause, Neustart, Zeitleiste und Geschwindigkeiten 0.5× / 1× / 1.5×.
- Ausgangsposition, Bewegungsphasen, häufige Fehler und Quellen.
- Suche nach Übung, Gerät oder Muskel und Filter nach Trainingsbereich.
- Chinesisch, Englisch, Spanisch, Französisch, Deutsch, Portugiesisch, Japanisch und Koreanisch.
- Statische Three.js- und Vite-Anwendung ohne eigenes Backend, Benutzerkonto oder KI-API-Schlüssel.

## Übungsumfang

Brust: **8**; Rücken: **8**; Schultern: **6**; Arme: **6**; Beine: **17**; Rumpf: **5**. Beispiele: Bankdrücken, Kniebeugen, Kreuzheben, Klimmzüge, Ausfallschritte, Schulterpressen, Beinbeugen, Plank und Bird Dog.

## Lokal starten

Voraussetzungen: Node.js **20.19+ innerhalb von 20.x oder 22.12+** und ein WebGL2-fähiger Browser.

```bash
git clone https://github.com/alex-chan/movement-lab.git
cd movement-lab/web
npm ci
npm run dev
```

Öffne die angezeigte URL, normalerweise `http://localhost:5173/`. Modelle und Draco-Ressourcen sind enthalten; Blender wird nicht benötigt. Nutze einen HTTP-Server, statt HTML-Dateien direkt zu öffnen.

## Prüfen und bereitstellen

Im Verzeichnis `web/`:

```bash
npm run check:movements
npm run check:i18n
npm run build
npm run check:seo
npm run preview
```

Trage die tatsächliche öffentliche URL als `SITE_URL` in die lokale, von Git ausgeschlossene Datei `web/.env.production` ein. Veröffentliche `web/dist/` auf Cloudflare Pages oder einem anderen statischen Hostingdienst; einzelne Seiten und echte 404-Antworten müssen erhalten bleiben. Die aktuelle Website wird direkt hochgeladen. GitHub-Pushes lösen keine automatische Veröffentlichung aus.

Mit `SITE_URL` erzeugt der Build zusätzlich canonical, hreflang und Sitemap. HTML-Anleitungen und lokalisierte Metadaten sind enthalten; ohne `SITE_URL` gilt noindex. Siehe die [englische Entwicklungsanleitung](docs/DEVELOPMENT.md); [SEO](web/README-SEO.md) und [Sprachnotizen](web/README-I18N.md) sind auf Chinesisch.

## Grenzen und Herkunft

Die Animationen simulieren weder reale Lasten noch Weichteile. Farben zeigen Muskelrollen, **keine gemessene Aktivierung**; weiße Bereiche können ebenfalls stabilisieren. Sie ersetzen keine individuelle Trainingsbetreuung oder medizinische Beratung.

Der ergänzende Atlas unter `/anatomy/` enthält weiterhin englische/hindische Inhalte und Erklärungen; diese sind nicht Teil der acht Übungssprachen.

Basiert auf [3d-human-body-anatomy](https://github.com/SeemaBansal1/3d-human-body-anatomy), dessen Verlauf und [Originaldokumentation](README-ANATOMY.md) erhalten bleiben. Z-Anatomy-/BodyParts3D-Modelle behalten ihre Bedingungen zur Namensnennung und Weitergabe unter gleichen Bedingungen. Die Organschicht enthält ein **Nierenmodell unter CC BY-NC 4.0, das vor kommerzieller Veröffentlichung entfernt oder ersetzt werden muss**. Siehe [CREDITS.md](CREDITS.md).
