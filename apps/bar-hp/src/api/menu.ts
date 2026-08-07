import type { Menu } from "emdash";
import { getMenu as getEmDashMenu } from "emdash";
import { err, ok, type Result, ResultAsync } from "neverthrow";

import { NotFoundError, ServerError } from "./error";

function toApiError(menu: Menu | null, name: string): Result<Menu, NotFoundError> {
  if (!menu) {
    return err(new NotFoundError({ collection: "menu", id: name }));
  }

  return ok(menu);
}

export function getMenu(name: string): ResultAsync<Menu, NotFoundError | ServerError> {
  return ResultAsync.fromPromise(
    getEmDashMenu(name),
    (cause) => new ServerError({ collection: "menu", id: name, cause }),
  ).andThen((menu) => toApiError(menu, name));
}
