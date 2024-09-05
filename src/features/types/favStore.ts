
export type StateType = {
  /**
   * Favorite colors.
   */
  colors: string[];
  /**
   * Favorite palettes(plts).
   */
  plts: string[];
  /**
   * Whether the colors/plts is loaded.
   */
  isInitialized: [boolean, boolean];
}
