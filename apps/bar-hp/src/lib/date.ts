const formatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo",
});

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return "";
  }

  return formatter.format(new Date(date));
}
