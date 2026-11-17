# pi-herdr-core

herdr-core（CLI は `hc`）を pi から効率的に使うための Pi package です。
`herdr`（古いターミナル・マルチプレクサー）用ではなく、`hc` 専用です。

## 提供するもの

1. **スキル `herdr-core`**
   `hc` のコア手順（タスクの委任、待ち、慢長コマンドの回し方、結果回収、
   クリーンアップ、エラーコード）の cheatsheet です。
   約 300 行の `hc --skill` 全文を毎回読み込む代わりになります。
2. **ツール `hc_manual`**
   ローカル CLI のライブ出力（`hc --skill`。`target: "herdr-app"` なら
   `herdr-app --skill`）をそのまま返します。
   cheatsheet に載っていない詳細（リモートマシン、recovery、macOS、
   設定キー、ウィンドウとレイアウト）はこちらで確認します。
   毎回 CLI を呼び直すため、hc のバージョンが変わっても stale な
   コピーを持ちません。
3. **フッターのステータス**
   herdr-core 内（`$HC_TERMINAL_ID` が設定されている）で pi を実行すると、
   自分のターミナル ID（例 `herdr t5p`）をフッターに常時表示します。

## インストール

```sh
pi install git:github.com/gamoutatsumi/pi-herdr-core
```

リポジトリをまだ push していない間は、ローカルパスで試せます。

```sh
pi install /path/to/pi-herdr-core
```

**注意:** すでに単体の `herdr-core` スキル（例
`~/.pi/agent/skills/herdr-core/`）を持っている場合は、インストール後に
削除してください。同名スキルは先に発見された方が採用されます。

## 使い方

設定は不要です。サブエージェント、バックグラウンドタスク、長時間
コマンド、リモートマシンのような `hc` に向いたタスクで、エージェントが
スキルを自動ロードします。強制ロードは `/skill:herdr-core` です。

最新マニュアルを agent に取得させたい場合は、例えば「`hc_manual` で
最新の hc マニュアルを確認して、リモートマシン使い方を教えて」と
依頼すればよいです。

## 開発

- 開発環境は `nix develop` で入ります（`pi`・`nodejs` 24・`typescript`
  が使えます）。
- TypeScript の拡張は jiti 経由でそのまま読み込まれるため、ビルドは
  不要です。
- スモークテスト（Node 24+。拡張を fake な ExtensionAPI で駆動し、
  ツール登録・マニュアル取得・エラー経路・フッター挙動を確認）:

  ```sh
  npm install --no-save typebox
  node scripts/smoke.mjs
  ```

- 拡張単体で試す: `pi -e ./extensions/herdr-core.ts`
- スキル単体で試す: スキルディレクトリが pi の検出対象
  （`~/.agents/skills/` など）にある状態で `/skill:herdr-core` を実行。
