
export type CardType = {
  /**
   * Order of card in palette.
   */
  order: number;
  /**
   * RGB hex code.
   */
  hex: string;
  /**
   * Color array in specific color space.
   */
  color: number[];
  nameIdx?: number;
  /**
   * Stores hex before editing the palette.
   */
  originHex: string;
  /**
   * Stores color before editing the palette.
   */
  originColor: number[];
  /**
   * The card is lock (can't refresh the card).
   */
  isLock: boolean;
  /**
   * The card is in bookmarks.
   */
  isFav: boolean;
};
