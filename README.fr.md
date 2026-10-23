# Movement Lab · Démonstrations d’exercices en 3D

[简体中文](README.zh-CN.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

**Comprendre le mouvement et les muscles qui y participent.**

Movement Lab propose **50 exercices, 6 catégories et 8 langues** dans le navigateur : poids du corps, barre, haltères, poulies et machines.

**[Voir le site](https://movement-lab.pages.dev/fr/)** · [Développé couché](https://movement-lab.pages.dev/fr/exercises/bench/)

![Movement Lab — 50 exercises](docs/screenshots/movement-library.png)

![3D bench press preview](web/public/previews/bench.png)

## Fonctionnalités

- Démonstrations 3D avec rotation, zoom et vues prédéfinies.
- Rouge foncé pour les muscles principaux, rouge clair pour les auxiliaires ou stabilisateurs, blanc pour les autres zones.
- Lecture, pause, redémarrage, chronologie et vitesses 0.5× / 1× / 1.5×.
- Position de départ, phases, erreurs courantes et références.
- Recherche par exercice, matériel ou muscle et filtres par zone.
- Chinois, anglais, espagnol, français, allemand, portugais, japonais et coréen.
- Application statique Three.js + Vite, sans serveur applicatif, compte ni clé d’API d’IA.

## Exercices

Pectoraux : **8** ; dos : **8** ; épaules : **6** ; bras : **6** ; jambes : **17** ; centre du corps : **5**. Exemples : développé couché, squat, soulevé de terre, tractions, fentes, développé sur machine, leg curl, planche et bird dog.

## Lancer en local

Prérequis : Node.js **20.19+ dans la branche 20.x, ou 22.12+**, et un navigateur WebGL2.

```bash
git clone https://github.com/alex-chan/movement-lab.git
cd movement-lab/web
npm ci
npm run dev
```

Ouvrez l’URL indiquée, généralement `http://localhost:5173/`. Les modèles et ressources Draco sont inclus ; Blender n’est pas nécessaire. Utilisez HTTP, pas l’ouverture directe du fichier HTML.

## Vérifier et déployer

Depuis `web/` :

```bash
npm run check:movements
npm run check:i18n
npm run build
npm run check:seo
npm run preview
```

Renseignez l’URL publique réelle dans `SITE_URL`, dans le fichier local `web/.env.production`, exclu de Git. Déployez `web/dist/` sur Cloudflare Pages ou un hébergement statique, en conservant les pages et les réponses 404. Le site actuel utilise le téléversement direct ; les envois GitHub ne déclenchent pas de publication automatique.

Avec `SITE_URL`, la compilation ajoute canonical, hreflang et sitemap au contenu HTML et aux métadonnées localisées. Sans cette variable, elle utilise noindex. Voir le [guide en anglais](docs/DEVELOPMENT.md) ; les notes [SEO](web/README-SEO.md) et [langues](web/README-I18N.md) sont en chinois.

## Limites et crédits

Les animations ne simulent ni charges réelles ni tissus mous. Les couleurs indiquent les rôles musculaires, **pas une activation mesurée** ; les zones blanches peuvent aussi stabiliser. Elles ne remplacent pas un accompagnement individuel ou un avis médical.

L’atlas complémentaire `/anatomy/` conserve son contenu et ses commentaires en anglais/hindi, hors de la traduction en huit langues des exercices.

Projet dérivé de [3d-human-body-anatomy](https://github.com/SeemaBansal1/3d-human-body-anatomy), avec son historique et sa [documentation d’origine](README-ANATOMY.md). Les modèles Z-Anatomy / BodyParts3D gardent leurs conditions d’attribution et de partage à l’identique. La couche des organes contient un **rein CC BY-NC 4.0 à retirer ou remplacer avant toute publication commerciale**. Voir [CREDITS.md](CREDITS.md).
