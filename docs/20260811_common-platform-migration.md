# 共通開発・リリース基盤への移行

> 2026-08-13運用更新: 本書の共通GitHub Pages adapterは、provider標準deployとrollbackのcanary完了まで、登録済み`public-pages` targetだけに使う凍結互換経路である。新しいtarget・adapter・credential・公開方式を追加せず、通常releaseのためのconfigureを行わない。依頼元セッションがGitHub、CI、互換経路の実行、公開health、必要なrollback、結果報告までを所有する。以下の移行・baseline事実は履歴として保持する。

作成日: 2026-08-11

状態: 移行完了

## 対象

`aw-report`は`asics`案件だけで利用するため、案件の`apps/aw-report/`を正本として維持する。配置場所を`AI-Work/Apps/`へ変更しない。

公開先は既存の`https://inoue-pell.github.io/aw-report/`を維持し、app profile v3の`external_service`／`public-pages` targetとして共通基盤へ接続する。

## 移行前に確認したこと

- GitHub Pagesは`main`直下を公開するlegacy branch buildだった。
- 公開HTMLと案件フォルダの`index.html`はSHA-256が一致していた。
- 公開URLはHTTP 200、HTTPS強制で稼働していた。
- 手元GitとGitHubの初期履歴は別だったため、GitHub mainを正本にし、手元の旧履歴は保全してから接続する。
- CSV／Excelと分析結果はブラウザ内だけで処理し、公開サービスへアップロードしない。

## 採用したrelease契約

- repository: `inoue-pell/aw-report`
- target: `public-pages`
- environment: `production-pages`
- publication mode: `manual_confirmation`
- CI: `.github/workflows/ci.yml`
- deploy: hash固定した`.github/workflows/deploy-pages.yml`
- health: 公開`release.json`のcommit一致と公開HTML 200
- rollback: 直前commitのPages artifactを同じ固定workflowで再公開

公開artifactは`pages-manifest.json`記載のファイルだけで構成する。候補commit内のpackage scriptをPages credential付きで実行せず、workflow自体のhashが変わった場合は再登録まで安全停止する。

## 移行結果

2026年8月11日に、次を完了した。

1. app profileと検証を登録した。
2. GitHub Pull RequestとCIを統合した。
3. 手元GitとGitHub mainを整合させ、旧ローカル履歴は別branchとして保全した。
4. machine profileへ案件アプリrootを固定bindingし、共通GitHub Pages adapterをアプリ単位のIDでhash登録した。
5. legacy branch buildから固定workflow buildへ切り替え、現在commitをbaseline artifactとして公開した。
6. 低リスク変更を共通改修・releaseでcanaryとして通した。

公開URL（`https://inoue-pell.github.io/aw-report/`）と静的サイトの内容は移行前後で変更していない。healthは公開release markerを公開済みcommitへ結び付けて確認する。rollbackは直前に公開したcommitのartifact再公開へ結び付いている。
