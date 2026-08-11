# AWレポート固有の開発前提

- このアプリは`asics`案件専用の公開静的サイトであり、案件横断アプリへ移動しない。
- 利用者が読み込むCSV／Excelはブラウザ内だけで処理する。注文データ、キャンペーン利用データ、集計結果をサーバーへ送信する機能を追加しない。
- 商品情報の補完に使う外部通信は公開商品ページの読み取りだけに限定し、認証情報や利用者入力を送信しない。
- 本番URLは`https://inoue-pell.github.io/aw-report/`、release targetは`public-pages`を正本とする。
- GitHub、CI、Pages公開、health、rollbackは`ai-work-dev-platform`の共通GitHub Pages adapterを使う。Claude用またはCodex用の別経路を追加しない。
- `.github/workflows/deploy-pages.yml`はcredentialを使うhash固定workflowである。変更は通常改修へ混ぜず、対象と切戻しを確認した共通基盤変更として扱う。
- 公開対象は`pages-manifest.json`へ列挙した静的ファイルだけとし、原本データ、作業資料、秘密情報を追加しない。
