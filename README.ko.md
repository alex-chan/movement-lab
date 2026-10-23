# Movement Lab · 3D 운동 동작 시연

[简体中文](README.zh-CN.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

**동작의 원리와 참여하는 근육을 입체적으로 살펴보세요.**

Movement Lab은 브라우저에서 실행하는 3D 운동 라이브러리입니다. **50개 동작, 6개 운동 부위, 8개 언어**를 제공하며 맨몸, 바벨, 덤벨, 케이블과 머신 운동을 살펴볼 수 있습니다.

**[데모 열기](https://movement-lab.pages.dev/ko/)** · [바벨 벤치 프레스](https://movement-lab.pages.dev/ko/exercises/bench/)

![Movement Lab — 50 exercises](docs/screenshots/movement-library.png)

![3D bench press preview](web/public/previews/bench.png)

## 주요 기능

- 회전, 확대·축소 및 시점 전환이 가능한 3D 동작 시연.
- 주동근은 진한 빨강, 보조·안정화 근육은 연한 빨강, 나머지 부위는 흰색으로 표시.
- 재생, 일시 정지, 다시 시작, 진행 위치 조절, 0.5× / 1× / 1.5× 속도.
- 준비 자세, 동작 단계, 흔한 실수 및 참고 자료.
- 동작·기구·근육 검색과 운동 부위 필터.
- 중국어, 영어, 스페인어, 프랑스어, 독일어, 포르투갈어, 일본어, 한국어.
- Three.js + Vite 정적 사이트로 별도 백엔드, 계정 또는 AI API 키가 필요하지 않습니다.

## 수록 동작

가슴 **8**, 등 **8**, 어깨 **6**, 팔 **6**, 하체 **17**, 코어 **5**개입니다. 벤치 프레스, 스쿼트, 데드리프트, 풀업, 런지, 머신 숄더 프레스, 레그 컬, 플랭크, 버드독 등을 제공합니다.

## 로컬 실행

Node.js **20.x의 20.19 이상 또는 22.12 이상**과 WebGL2 지원 브라우저가 필요합니다.

```bash
git clone https://github.com/alex-chan/movement-lab.git
cd movement-lab/web
npm ci
npm run dev
```

출력된 URL(기본 `http://localhost:5173/`)을 여세요. 모델과 Draco 리소스가 포함되어 Blender는 필요하지 않습니다. HTML을 직접 열지 말고 HTTP 서버를 사용하세요.

## 검증 및 배포

`web/` 디렉터리에서 실행합니다.

```bash
npm run check:movements
npm run check:i18n
npm run build
npm run check:seo
npm run preview
```

Git에서 제외되는 로컬 파일 `web/.env.production`에 실제 공개 URL을 `SITE_URL`로 지정하세요. `web/dist/`를 Cloudflare Pages 등의 정적 호스팅에 배포하고 개별 페이지와 올바른 404 응답을 유지하세요. 현재 사이트는 직접 업로드 방식이며 GitHub 푸시로 자동 배포되지 않습니다.

정적 설명문, 다국어 메타데이터와 구조화 데이터를 생성합니다. `SITE_URL`을 설정하면 canonical, hreflang과 sitemap도 생성되며, 설정하지 않으면 noindex가 적용됩니다. [개발 가이드는 영어](docs/DEVELOPMENT.md), [SEO](web/README-SEO.md)와 [다국어 안내](web/README-I18N.md)는 중국어입니다.

## 시연 범위 및 출처

애니메이션은 실제 부하나 연부 조직을 시뮬레이션하지 않습니다. 색상은 근육의 역할을 나타내며 **측정된 근활성도는 아닙니다**. 흰색 부위도 안정화에 참여할 수 있습니다. 개별 운동 지도나 의료 조언을 대신하지 않습니다.

보조 도구인 `/anatomy/`의 기존 지식 콘텐츠와 해설은 영어·힌디어를 유지하며, 운동 라이브러리의 8개 언어 번역에는 포함되지 않습니다.

[3d-human-body-anatomy](https://github.com/SeemaBansal1/3d-human-body-anatomy)를 바탕으로 확장했으며 이력과 [원본 문서](README-ANATOMY.md)를 보존합니다. Z-Anatomy / BodyParts3D 모델에는 각 출처의 저작자 표시 및 동일조건변경허락 조건이 적용됩니다. 장기 레이어에 **CC BY-NC 4.0 신장 모델이 포함되어 있어 상업적 공개 전에 제거하거나 교체해야 합니다**. [CREDITS.md](CREDITS.md)를 참고하세요.
