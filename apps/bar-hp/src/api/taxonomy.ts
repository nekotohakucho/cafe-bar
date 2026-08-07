import type { TaxonomyTerm } from "emdash";
import { getTaxonomyTerms, getTerm as getEmDashTerm } from "emdash";
import { err, ok, type Result, ResultAsync } from "neverthrow";

import { NotFoundError, ServerError } from "./error";

function toApiError(term: TaxonomyTerm | null, taxonomy: string, slug: string): Result<TaxonomyTerm, NotFoundError> {
  if (!term) {
    return err(new NotFoundError({ collection: taxonomy, id: slug }));
  }

  return ok(term);
}

export function getTerms(taxonomy: string): ResultAsync<TaxonomyTerm[], ServerError> {
  return ResultAsync.fromPromise(
    getTaxonomyTerms(taxonomy),
    (cause) => new ServerError({ collection: taxonomy, cause }),
  );
}

export function getTerm(taxonomy: string, slug: string): ResultAsync<TaxonomyTerm, NotFoundError | ServerError> {
  return ResultAsync.fromPromise(
    getEmDashTerm(taxonomy, slug),
    (cause) => new ServerError({ collection: taxonomy, id: slug, cause }),
  ).andThen((term) => toApiError(term, taxonomy, slug));
}
