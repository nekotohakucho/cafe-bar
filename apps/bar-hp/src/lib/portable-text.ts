import type { PortableTextBlock, PortableTextSpan } from "emdash/ui";

export function toPlainText(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks) {
    return "";
  }

  return blocks
    .filter((block) => block._type === "block")
    .map((block) => ((block.children ?? []) as PortableTextSpan[]).map((child) => child.text ?? "").join(""))
    .join("");
}
