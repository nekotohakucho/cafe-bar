import type { EmDashCollections } from "emdash";

import { getEntry } from "./entry";
import { NotFoundError, ServerError } from "./error";

export type ShopInfo = EmDashCollections["shop_info"];

const SHOP_INFO_ID = "default";

function toServerError(error: NotFoundError | ServerError): ServerError {
  if (error instanceof NotFoundError) {
    return new ServerError({
      collection: error.collection,
      id: error.id,
      cause: error,
    });
  }

  return error;
}

export function getShopInfo() {
  return getEntry("shop_info", SHOP_INFO_ID).mapErr(toServerError);
}
