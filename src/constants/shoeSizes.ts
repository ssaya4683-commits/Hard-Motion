export const SHOE_SIZES = [
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
] as const;

export type ShoeSize = (typeof SHOE_SIZES)[number];