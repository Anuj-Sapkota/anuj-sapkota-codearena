export const truncate = (text: string, max = 60) =>
  text.length > max ? text.slice(0, max).trimEnd() + "..." : text;
