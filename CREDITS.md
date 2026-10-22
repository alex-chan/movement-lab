# Credits and license scope

## Project origin

Movement Lab extends [SeemaBansal1/3d-human-body-anatomy](https://github.com/SeemaBansal1/3d-human-body-anatomy). The original Git history and [atlas README](README-ANATOMY.md) are preserved. The fitness-focused additions include the exercise catalogue, procedural exercise demonstrations, muscle-role highlighting, instruction panels, previews, eight-language exercise UI and static SEO pages.

This document records provenance and inherited notices. It does not grant a new blanket license to the repository or replace the individual licenses below. In particular, the `license` field in `web/package.json` must not be treated as a license for all bundled model assets or upstream material.

## Anatomy assets

- **Z-Anatomy:** [project website](https://www.z-anatomy.com/), CC BY-SA 4.0. The bundled web models were simplified and modified from these assets; the upstream notice states that the derived models are shared under the same license.
- **BodyParts3D:** [database and project information](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/), © The Database Center for Life Science, CC BY-SA 2.1 JP. This is the underlying source acknowledged by Z-Anatomy and the original repository.
- **Kidney exception:** the inherited organs layer contains a kidney model by **Lissie Cowley**, licensed **CC BY-NC 4.0**, as documented in the upstream README. Remove or replace this model before commercial release, including an advertising-supported release. Its noncommercial restriction remains relevant even though the main entry point now focuses on fitness.

Retain attribution, license links and modification notices when redistributing the applicable models. See [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [CC BY-SA 2.1 JP](https://creativecommons.org/licenses/by-sa/2.1/jp/) and [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).

## Libraries and fonts

- [Three.js](https://threejs.org/): MIT.
- [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh): MIT.
- [Vite](https://vite.dev/): MIT.
- [Draco](https://github.com/google/draco): Apache 2.0; decoder resources are supplied through the Three.js distribution.
- Orbitron, Rajdhani and Baloo 2 from Google Fonts: SIL Open Font License, as acknowledged upstream.

Dependencies retain their own copyright and license notices. Exercise pages link to references for movement descriptions; those links do not imply endorsement or professional review of this project.
