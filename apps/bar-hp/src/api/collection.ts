import type { CacheHint, CollectionFilter, ContentEntry, InferCollectionData } from "emdash";
import { getEmDashCollection } from "emdash";
import { ResultAsync } from "neverthrow";

import { ServerError } from "./error";

export function getCollection<T extends string, D = InferCollectionData<T>>(
  collection: T,
  filter?: CollectionFilter,
): ResultAsync<
  { entries: ContentEntry<D>[]; cacheHint: CacheHint; nextCursor?: string; hasMore?: boolean },
  ServerError
> {
  return ResultAsync.fromPromise(
    getEmDashCollection<T, D>(collection, filter),
    (cause) => new ServerError({ collection, cause }),
  ).map(({ entries, cacheHint, nextCursor, hasMore }) => ({ entries, cacheHint, nextCursor, hasMore }));
}
