# ドメインを追加したとき

## ログインメールのリンクを新ドメインにする

ログインメールのリンクは D1 `bar-hp` の `options` テーブル (`emdash:site_url`) の値から作られる。
初回セットアップ時に保存されたまま自動では変わらず、管理画面からも変更できない。

Cloudflare ダッシュボード → Storage & Databases → D1 → {name} → Console で実行する。

```sql
UPDATE options SET value = json_quote('https://new-domain') WHERE name = 'emdash:site_url';
```

- 値は JSON 文字列で保存する
- 末尾に `/` を付けない

## Outlook でリンクを開くとログインできない

Outlook のリンクをクリックすると `invalid_link` などのエラーになる。
Safe Links (Microsoft Defender) がリンクに先にアクセスし、1 回しか使えないトークンを使ってしまうため。

リンクをコピーして、ブラウザのアドレスバーに貼り付けて開けばログインできる。
