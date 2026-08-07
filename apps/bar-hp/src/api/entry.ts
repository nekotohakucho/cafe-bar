import type { CacheHint, ContentEntry, EntryResult, InferCollectionData } from "emdash";
import { getEmDashEntry } from "emdash";
import { err, ok, type Result, ResultAsync } from "neverthrow";

import { NotFoundError, ServerError } from "./error";

function toApiError<D>(
  result: EntryResult<D>,
  collection: string,
  id: string,
): Result<EntryResult<D> & { entry: ContentEntry<D> }, NotFoundError | ServerError> {
  if (result.error && result.error.name !== "LiveEntryNotFoundError") {
    return err(new ServerError({ collection, id, cause: result.error }));
  }

  if (!result.entry) {
    return err(new NotFoundError({ collection, id }));
  }

  return ok(result);
}

function toEntry<D>({ entry, cacheHint }: EntryResult<D> & { entry: ContentEntry<D> }): {
  entry: ContentEntry<D>;
  cacheHint: CacheHint;
} {
  return { entry, cacheHint };
}

export function getEntry<T extends string, D = InferCollectionData<T>>(
  collection: T,
  id: string,
): ResultAsync<{ entry: ContentEntry<D>; cacheHint: CacheHint }, NotFoundError | ServerError> {
  return ResultAsync.fromPromise(
    getEmDashEntry<T, D>(collection, id),
    (cause) => new ServerError({ collection, id, cause }),
  )
    .andThen((result) => toApiError(result, collection, id))
    .map(toEntry);
}
