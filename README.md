# AW注文×キャンペーン利用レポート

アシックス案件専用の静的Webアプリです。注文×キャンペーン利用データをブラウザ内で読み込み、新規／既存、型番、ブランド、キャンペーン別に集計・可視化します。

- 本番: https://inoue-pell.github.io/aw-report/
- 所有案件: `asics`
- 公開方式: GitHub Pages
- データ処理: 利用者のブラウザ内のみ

## ローカル確認

静的ファイルだけで動作します。ローカルサーバーを起動し、表示されたURLをブラウザで開きます。

```sh
python3 -m http.server 4173
```

## 検証

外部依存のインストールは不要です。Node.js 22.13以上で実行します。

```sh
npm test
```

検証では、HTMLと商品catalogの構文、ブラウザ外へのデータ送信がないこと、app profile、公開manifest、CI、hash固定Pages workflowの契約を確認します。

## 構成

- `index.html`: 画面、CSV／Excel読込、集計、可視化
- `aw_product_catalog.js`: 公開商品情報の補助catalog
- `pages-manifest.json`: 本番artifactへ含めるファイルのallowlist
- `.ai-work/`: Claude／Codex共通の開発・検証・release契約
- `.github/workflows/ci.yml`: Pull Request／mainの決定論的検証
- `.github/workflows/deploy-pages.yml`: provider標準deploy移行まで、登録済みtargetだけで凍結互換利用する固定Pages公開

## リリース

provider標準deployとrollbackのcanaryが完了するまでは、現在登録済みの`public-pages` targetとadapterだけを組合せを変えずに凍結互換利用します。新しいtarget・adapter・configureは追加しません。本人から実装・変更を依頼された通常releaseは、依頼元セッションがPull Request、CI、固定Pages公開、公開`release.json`とHTMLのhealth、必要な直前artifactへのrollback、結果報告まで担当します。

移行と初回baselineの詳細は[共通基盤移行](docs/20260811_common-platform-migration.md)を参照してください。
