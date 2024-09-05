import { BORDER_COLOR } from '@/constants/settingStore';

export type BorderStyleType = {
  /**
   * Show border or not.
   */
  show: boolean;
  width: number;
  color: typeof BORDER_COLOR[number];
};

export type TransitionType = {
  /**
   * Position transition (happens only when dragging) duration (in `ms`).
   */
  pos: number;
  /**
   * Background-color transition duration (in `ms`).
   */
  color: number
}

export type StateType = {
  /**
   * Border of cards.
   */
  border: BorderStyleType;
  /**
   * Transition of cards
   */
  transition: TransitionType;
};
