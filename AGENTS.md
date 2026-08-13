# AWレポート固有の開発前提

- このアプリは`asics`案件専用の公開静的サイトであり、案件横断アプリへ移動しない。
- 利用者が読み込むCSV／Excelはブラウザ内だけで処理する。注文データ、キャンペーン利用データ、集計結果をサーバーへ送信する機能を追加しない。
- 商品情報の補完に使う外部通信は公開商品ページの読み取りだけに限定し、認証情報や利用者入力を送信しない。
- 本番URLは`https://inoue-pell.github.io/aw-report/`、release targetは`public-pages`を正本とする。
- `public-pages`はGitHub Pagesの標準workflowを正規公開経路とする。PRのCI済みmerge commitがmainへ入ると1回だけ公開し、依頼元セッションが公開`release.json`、HTML、deployment履歴まで確認する。共通GitHub Pages adapter、ReleasePlan、permit、receiptを通常公開へ戻さない。
- rollbackは`.github/workflows/deploy-pages.yml`を`workflow_dispatch`し、直前に正常確認したexact commitを1回だけ再公開する。結果不明時は再送せず、Actions、Pages deployment、公開`release.json`をread-onlyで照合する。
- `.github/workflows/deploy-pages.yml`はGitHub標準のPages権限だけを使うhash固定workflowである。新しいcredential、公開先、custom domain、外部送信を追加しない。
- 公開対象は`pages-manifest.json`へ列挙した静的ファイルだけとし、原本データ、作業資料、秘密情報を追加しない。
