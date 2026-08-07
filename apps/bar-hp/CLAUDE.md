This is an EmDash site -- a CMS built on Astro with a full admin UI.

## Commands

```bash
npx emdash dev        # Start dev server (runs migrations, seeds, generates types)
npx emdash types      # Regenerate TypeScript types from schema
npx emdash seed seed/seed.json --validate  # Validate seed file
```

The admin UI is at `http://localhost:4321/_emdash/admin`.

## Key Files

| File                     | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `astro.config.mjs`       | Astro config with `emdash()` integration, database, and storage                  |
| `src/live.config.ts`     | EmDash loader registration (boilerplate -- don't modify)                         |
| `seed/seed.json`         | Schema definition + demo content (collections, fields, taxonomies, menus, widgets) |
| `emdash-env.d.ts`      | Generated types for collections (auto-regenerated on dev server start)             |
| `src/layouts/Base.astro` | Base layout with EmDash wiring (menus, search, page contributions)               |
| `src/pages/`             | Astro pages -- all server-rendered                                                 |

## Skills

Agent skills are in `.agents/skills/`. Load them when working on specific tasks:

- **building-emdash-site** -- Querying content, rendering Portable Text, schema design, seed files, site features (menus, widgets, search, SEO, comments, bylines). Start here.
- **creating-plugins** -- Building EmDash plugins with hooks, storage, admin UI, API routes, and Portable Text block types.
- **emdash-cli** -- CLI commands for content management, seeding, type generation, and visual editing flow.
- **emdash-form-notify** -- Setting notifyEmails / autoresponder / webhookUrl on a forms-plugin form via the admin API.

## Rules

- All content pages must be server-rendered (`output: "server"`). No `getStaticPaths()` for CMS content.
- Image fields are objects (`{ src, alt }`), not strings. Use `<Image image={...} />` from `"emdash/ui"`.
- `entry.id` is the slug (for URLs). `entry.data.id` is the database ULID (for API calls like `getEntryTerms`).
- Always call `Astro.cache.set(cacheHint)` on pages that query content.
- Taxonomy names in queries must match the seed's `"name"` field exactly (e.g., `"tag"` not `"tags"`).

## Naming & Code Style

- CMS コンテンツを表示するページは動的ルート (`[slug].astro`) で追加する。slug ごとに個別ファイルを作らない (例: `legal_pages` → `src/pages/legals/[slug].astro`)。
- `src/api/` のラッパは EmDash の関数をそのまま包む汎用形にする。コレクション名・タクソノミー名は引数で受け、`getPosts()` のような具象関数は定義しない。
- `if` の本文は必ずブロックで書く。`if (!entry) return Astro.redirect("/404");` のような一行形式は禁止。

  ```ts
  if (!entry) {
    return Astro.redirect("/404");
  }
  ```

- 指示されていない要素・クラス・CSS ファイルを足さない。見出しやラッパー div は要求されたときだけ追加する。

## Migration Notes

移植元は Next.js 12 + Newt の `kage-development/cat-bar-web`。URL は SEO のため現行を維持する (`/article/[slug]`, `/category/[slug]`)。
