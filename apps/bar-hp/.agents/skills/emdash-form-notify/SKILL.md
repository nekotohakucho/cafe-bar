---
name: emdash-form-notify
description: Set notifyEmails / autoresponder / webhookUrl on an EmDash forms-plugin form via the admin API. Use when the user wants to configure form notification settings that the admin UI does not expose.
---

# EmDash Form Notification Settings

`@emdash-cms/plugin-forms` のフォーム設定のうち、管理画面に入力欄が無い項目を
admin API 経由で設定する。

管理画面の Settings で編集できるのは Confirmation Message / Submit Label /
Spam Protection / Retention Days / Redirect URL の5項目のみ。
`notifyEmails` `autoresponder` `webhookUrl` は API から設定するしかない。

## 必要な入力

| 変数 | 例 |
| --- | --- |
| `EMDASH_URL` | `http://localhost:4321` |
| `EMDASH_TOKEN` | `ec_pat_...` (admin スコープ) |
| `FORM_SLUG` | `contact-form` |
| `NOTIFY_EMAILS` | `["you@example.com"]` |

## 手順

### 1. slug から ID を引く

`forms/list` は絞り込みパラメータを持たず、作成日の降順で最大100件を返す。
クライアント側で `slug` を突き合わせる。

```bash
FORM_ID=$(curl -s -X POST "$EMDASH_URL/_emdash/api/plugins/emdash-forms/forms/list" \
  -H "Authorization: Bearer $EMDASH_TOKEN" \
  | python3 -c "import sys,json;print(next(f['id'] for f in json.load(sys.stdin)['data']['items'] if f['slug']=='$FORM_SLUG'))")
```

`items` の各要素は `{ id, ...data }` の形なので、`slug` はそのまま入っている。

### 2. settings を更新する

`settings` は部分指定でよい。サーバー側で
`{ ...existing.settings, ...input.settings }` とマージされるため、
渡さなかったキーは保たれる。

```bash
curl -s -X POST "$EMDASH_URL/_emdash/api/plugins/emdash-forms/forms/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMDASH_TOKEN" \
  -d "{\"id\":\"$FORM_ID\",\"settings\":{\"notifyEmails\":$NOTIFY_EMAILS}}"
```

レスポンスは更新後のフォーム定義全体なので、`settings.notifyEmails` を見れば
反映を確認できる。

## 設定できる項目

`formSettingsSchema` より。

| キー | 型 |
| --- | --- |
| `confirmationMessage` | string |
| `redirectUrl` | string (http/https) |
| `notifyEmails` | string[] (email) |
| `digestEnabled` | boolean |
| `digestHour` | number (0-23) |
| `autoresponder` | `{ subject, body }` |
| `webhookUrl` | string (http/https) |
| `retentionDays` | number |
| `spamProtection` | `none` / `honeypot` / `turnstile` |
| `submitLabel` | string |
| `nextLabel` | string |
| `prevLabel` | string |

自動返信を設定する場合。

```bash
-d "{\"id\":\"$FORM_ID\",\"settings\":{\"autoresponder\":{\"subject\":\"お問い合わせありがとうございます\",\"body\":\"内容を確認のうえご連絡いたします。\"}}}"
```

## 認証

- トークン認証は CSRF ヘッダー不要
- セッション cookie で叩く場合は `X-EmDash-Request: 1` が必須
- トークンには admin スコープが要る

## メールが送られない場合

`notifyEmails` と `autoresponder` はどちらも `ctx.email` があるときだけ実行される。
`ctx.email` は `email:deliver` フックのプロバイダが選択されているときに生える。

選択状態を確認する。

```bash
curl -s "$EMDASH_URL/_emdash/api/settings/email" -H "Authorization: Bearer $EMDASH_TOKEN"
```

`selectedProviderId` が `null` なら未選択。切り替えは以下。

```bash
curl -s -X PUT "$EMDASH_URL/_emdash/api/admin/hooks/exclusive/email:deliver" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EMDASH_TOKEN" \
  -d '{"pluginId":"<プロバイダのプラグイン ID>"}'
```

dev では emdash 内蔵のコンソール出力プロバイダ (`emdash-console-email`) も
候補に入るため、候補が複数になり自動選択されない。本番では内蔵プロバイダが
登録されないので、プロバイダが1つなら自動選択される。

## 注意

- `digestEnabled` が true のとき、`notifyEmails` への即時通知は送られない
- 送信失敗はログに出るだけで、submission レコードには残らない
