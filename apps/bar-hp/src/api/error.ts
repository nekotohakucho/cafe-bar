import { ErrorFactory } from "@praha/error-factory";

export class NotFoundError extends ErrorFactory({
  name: "NotFoundError",
  message: ({ collection, id }) => `${collection} のエントリ "${id}" が見つかりません`,
  fields: ErrorFactory.fields<{ collection: string; id: string }>(),
}) {}

export class ServerError extends ErrorFactory({
  name: "ServerError",
  message: ({ collection, id }) =>
    id === undefined
      ? `${collection} の取得に失敗しました`
      : `${collection} のエントリ "${id}" の取得に失敗しました`,
  fields: ErrorFactory.fields<{ collection: string; id?: string }>(),
}) {}
