# お問い合わせフォームの通知先メールアドレスを設定する

## 背景

お問い合わせフォームは `@emdash-cms/plugin-forms` で動いている。
フォーム送信時の通知先 (`notifyEmails`) はフォーム設定の一部だが、管理画面の
Settings には入力欄が無い (編集できるのは Confirmation Message / Submit Label /
Spam Protection / Retention Days / Redirect URL のみ)。

そのため、Cloudflare D1 のコンソール画面から SQL を直接実行して設定する。

## 保存場所

D1 データベース `bar-hp` の `_plugin_storage` テーブル。

| 列 | 値 |
| --- | --- |
| `plugin_id` | `emdash-forms` |
| `collection` | `forms` |
| `id` | フォーム ID (ULID) |
| `data` | フォーム定義の JSON。通知先は `$.settings.notifyEmails` (文字列配列) |

## 手順

Cloudflare ダッシュボード → Storage & Databases → D1 → `bar-hp` → Console を開く。

### 1. フォーム ID を確認する

```sql
SELECT id,
       json_extract(data, '$.slug') AS slug,
       json_extract(data, '$.settings.notifyEmails') AS notify_emails
FROM _plugin_storage
WHERE plugin_id = 'emdash-forms' AND collection = 'forms';
```

`slug` が `contact-form` の行の `id` を控える。

### 2. 通知先を更新する

`json_set` で `$.settings.notifyEmails` だけを差し替える。他の設定には触らない。
`<FORM_ID>` と宛先を置き換えて実行する。

```sql
UPDATE _plugin_storage
SET data = json_set(data, '$.settings.notifyEmails', json('["notify@example.com"]')),
    updated_at = datetime('now')
WHERE plugin_id = 'emdash-forms'
  AND collection = 'forms'
  AND id = '<FORM_ID>';
```

複数の宛先に送る場合は配列に並べる。

```sql
json('["a@example.com", "b@example.com"]')
```

### 3. 反映を確認する

```sql
SELECT json_extract(data, '$.settings.notifyEmails')
FROM _plugin_storage
WHERE id = '<FORM_ID>';
```

## 注意

- `digestEnabled` が `true` のときは即時通知が送られない。`$.settings.digestEnabled` が `false` であることを合わせて確認する
- 通知はメールプロバイダ (`email:deliver`) が選択されているときだけ送られる。
  `GET /_emdash/api/settings/email` の `selectedProviderId` が `null` の場合は
  `PUT /_emdash/api/admin/hooks/exclusive/email:deliver` に `{"pluginId":"emdash-worker-mailer"}` を送る
- worker-mailer の SMTP 設定 (管理画面 → プラグイン → Worker Mailer の歯車) が入っていることが前提
- 送信失敗はサーバーログに出るだけで、submission レコードには残らない
- 管理画面でフォーム設定を保存し直した場合は、`notifyEmails` が保持されているか手順 3 で再確認する

## ローカル環境の場合

ローカル D1 の実体は以下の sqlite ファイル。dev サーバーを止めてから `sqlite3` で同じ SQL を実行する。

```
apps/bar-hp/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/<hash>.sqlite
```

dev サーバー稼働中は admin API 経由で更新する。手順は `apps/bar-hp/.agents/skills/emdash-form-notify/SKILL.md` を参照。
