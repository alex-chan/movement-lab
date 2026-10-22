# Movement Lab · Demonstrações de exercícios em 3D

[简体中文](README.md) · [English](README.en.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

**Veja como executar cada movimento e quais músculos participam.**

Movement Lab é uma biblioteca 3D no navegador com **50 exercícios, 6 categorias e 8 idiomas**, incluindo peso corporal, barras, halteres, cabos e máquinas.

**[Acessar demonstração](https://movement-lab-alex-chan.pages.dev/pt/)** · [Supino com barra](https://movement-lab-alex-chan.pages.dev/pt/exercises/bench/)

![Movement Lab — 50 exercises](docs/screenshots/movement-library.png)

![3D bench press preview](web/public/previews/bench.png)

## Recursos

- Demonstrações 3D com rotação, zoom e vistas predefinidas.
- Vermelho escuro para músculos principais, vermelho claro para auxiliares ou estabilizadores e branco para outras regiões.
- Reprodução, pausa, reinício, controle de progresso e velocidades 0.5× / 1× / 1.5×.
- Posição inicial, fases do movimento, erros comuns e referências.
- Busca por exercício, equipamento ou músculo e filtros por região.
- Chinês, inglês, espanhol, francês, alemão, português, japonês e coreano.
- Aplicação estática Three.js + Vite, sem backend próprio, conta ou chave de API de IA.

## Exercícios

Peito: **8**; costas: **8**; ombros: **6**; braços: **6**; pernas: **17**; core: **5**. Exemplos: supino, agachamento, levantamento terra, barra fixa, avanço reverso, desenvolvimento na máquina, flexão de pernas, prancha e bird dog.

## Executar localmente

Requer Node.js **20.19+ na série 20.x, ou 22.12+**, e navegador com WebGL2.

```bash
git clone https://github.com/alex-chan/movement-lab.git
cd movement-lab/web
npm ci
npm run dev
```

Abra a URL exibida, normalmente `http://localhost:5173/`. Os modelos e recursos Draco estão incluídos; Blender não é necessário. Use HTTP, em vez de abrir o HTML diretamente.

## Verificar e publicar

No diretório `web/`:

```bash
npm run check:movements
npm run check:i18n
npm run build
npm run check:seo
npm run preview
```

Defina `SITE_URL` com a URL pública real no arquivo local `web/.env.production`, ignorado pelo Git. Publique `web/dist/` no Cloudflare Pages ou em outra hospedagem estática, preservando páginas individuais e respostas 404. O site atual usa upload direto; alterações no GitHub não são publicadas automaticamente.

Com `SITE_URL`, a compilação gera canonical, hreflang e sitemap, além das instruções HTML e dos metadados localizados. Sem essa variável, utiliza noindex. Veja o [guia em inglês](docs/DEVELOPMENT.md); as notas de [SEO](web/README-SEO.md) e [idiomas](web/README-I18N.md) estão em chinês.

## Limites e créditos

As animações não simulam cargas reais nem tecidos moles. As cores representam funções musculares, **não ativação medida**; regiões brancas também podem estabilizar. Não substituem orientação individual ou aconselhamento médico.

O atlas complementar em `/anatomy/` mantém o conteúdo e as explicações em inglês/híndi, fora da tradução dos exercícios para oito idiomas.

Baseado em [3d-human-body-anatomy](https://github.com/SeemaBansal1/3d-human-body-anatomy), preservando o histórico e a [documentação original](README-ANATOMY.md). Os modelos Z-Anatomy / BodyParts3D mantêm as condições de atribuição e compartilhamento pela mesma licença. A camada de órgãos contém um **rim CC BY-NC 4.0 que deve ser removido ou substituído antes da publicação comercial**. Veja [CREDITS.md](CREDITS.md).
