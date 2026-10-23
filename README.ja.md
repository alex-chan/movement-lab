# Movement Lab · 3D 筋力トレーニング動作デモ

[简体中文](README.zh-CN.md) · [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português](README.pt.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

**動きの仕組みと、関わる筋肉を立体的に理解する。**

Movement Lab はブラウザーで使える 3D トレーニング動作ライブラリです。**50 種目・6 部位・8 言語**に対応し、自重、バーベル、ダンベル、ケーブル、マシンの動きを確認できます。

**[デモを見る](https://movement-lab.pages.dev/ja/)** · [ベンチプレス](https://movement-lab.pages.dev/ja/exercises/bench/)

![Movement Lab — 50 exercises](docs/screenshots/movement-library.png)

![3D bench press preview](web/public/previews/bench.png)

## 主な機能

- 回転、ズーム、視点切り替えに対応した 3D 動作デモ。
- 主働筋は濃い赤、補助筋・安定筋は薄い赤、その他の部位は白で表示。
- 再生、一時停止、リセット、進行位置の調整、0.5×／1×／1.5× の速度切り替え。
- 開始姿勢、動作段階、よくある間違い、参考資料。
- 種目・器具・筋肉による検索と、部位別フィルター。
- 中国語、英語、スペイン語、フランス語、ドイツ語、ポルトガル語、日本語、韓国語。
- Three.js + Vite の静的サイト。独自バックエンド、アカウント、AI API キーは不要。

## 収録内容

胸 **8**、背中 **8**、肩 **6**、腕 **6**、脚 **17**、体幹 **5** 種目。ベンチプレス、スクワット、デッドリフト、懸垂、ランジ、マシンショルダープレス、レッグカール、プランク、バードドッグなどを収録しています。

## ローカルで実行

Node.js **20.x の 20.19 以降、または 22.12 以降**と、WebGL2 対応ブラウザーが必要です。

```bash
git clone https://github.com/alex-chan/movement-lab.git
cd movement-lab/web
npm ci
npm run dev
```

表示された URL（通常は `http://localhost:5173/`）を開きます。モデルと Draco 関連ファイルは同梱され、Blender は不要です。HTML を直接開かず、HTTP サーバー経由でアクセスしてください。

## 検証と公開

`web/` ディレクトリで実行します。

```bash
npm run check:movements
npm run check:i18n
npm run build
npm run check:seo
npm run preview
```

Git 管理対象外のローカルファイル `web/.env.production` に、実際の公開 URL を `SITE_URL` として設定します。`web/dist/` を Cloudflare Pages などへ配置し、各ページと正しい 404 応答を維持してください。現在のサイトは直接アップロード方式で、GitHub へのプッシュでは自動公開されません。

静的な説明文、多言語メタ情報、構造化データを生成します。`SITE_URL` を設定すると canonical、hreflang、sitemap も生成され、未設定の場合は noindex になります。[開発ガイドは英語](docs/DEVELOPMENT.md)、[SEO](web/README-SEO.md) と [国際化](web/README-I18N.md) の資料は中国語です。

## デモの範囲と出典

アニメーションは実際の負荷や軟部組織を再現するものではありません。配色は筋肉の役割を示し、**実測の筋活動強度ではありません**。白い部位も安定化に関わる場合があります。個別の運動指導や医療助言に代わるものではありません。

補助機能の人体図譜 `/anatomy/` は、従来の英語・ヒンディー語の内容と解説を保持しており、種目ライブラリの 8 言語対応には含まれません。

[3d-human-body-anatomy](https://github.com/SeemaBansal1/3d-human-body-anatomy) を基に拡張し、履歴と [元のドキュメント](README-ANATOMY.md) を保持しています。Z-Anatomy／BodyParts3D のモデルには、それぞれの表示・継承条件が適用されます。臓器レイヤーには **CC BY-NC 4.0 の腎臓モデルが含まれるため、商用公開前に削除または置き換えが必要**です。[CREDITS.md](CREDITS.md) を参照してください。
