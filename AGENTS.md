# AWレポート固有の開発前提

- このアプリは`asics`案件専用の公開静的サイトであり、案件横断アプリへ移動しない。
- 利用者が読み込むCSV／Excelはブラウザ内だけで処理する。注文データ、キャンペーン利用データ、集計結果をサーバーへ送信する機能を追加しない。
- 商品情報の補完に使う外部通信は公開商品ページの読み取りだけに限定し、認証情報や利用者入力を送信しない。
- 本番URLは`https://inoue-pell.github.io/aw-report/`、release targetは`public-pages`を正本とする。
- GitHub Pagesのprovider標準deployとrollbackのcanaryが完了するまでは、現在登録済みの`public-pages` targetと共通GitHub Pages adapterを組合せを変えずに凍結互換利用する。新しいtarget・adapter・credential・公開方式を追加せず、通常releaseのためにadapterを再configureしない。Claude用またはCodex用の別経路も追加しない。
- 本人から実装・変更を依頼された通常releaseは、依頼元セッションがGitHub、CI、凍結互換経路によるPages公開、health、必要なrollback、結果報告まで担当する。上位共通指示の高リスク作用だけを事前確認する。
- `.github/workflows/deploy-pages.yml`はcredentialを使うhash固定workflowである。provider標準経路へ移行するまでは凍結し、変更が必要な場合は通常改修へ混ぜず、高リスク境界に該当する内容だけを事前確認する。
- 公開対象は`pages-manifest.json`へ列挙した静的ファイルだけとし、原本データ、作業資料、秘密情報を追加しない。
