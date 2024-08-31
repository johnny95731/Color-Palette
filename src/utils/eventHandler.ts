import type { EventHandler } from '@/types/funcType';

// Events
export const stopPropagation = (e: Event) => e.stopPropagation();

/**
 * Remove non-hex text and add "#" to first word.
 */
export const hexTextEdited: EventHandler = (e) => {
  const textInput = e!.currentTarget as HTMLInputElement;
  let text = (textInput.value);
  text = text.replace(/[^A-F0-9]/ig, '');
  textInput.value = `#${text.toUpperCase()}`;
};

const clipboard = navigator.clipboard;
/**
 * Copy text to clipboard.
 */
export const copyText = (text: string): void => {
  try {
    clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

/**
 * Copy Hex innerText to clipboard (excludes "#").
 */
export const copyInnerHex: EventHandler = (e) => {
  const target = e!.currentTarget as HTMLElement;
  if (target) {
    const text = target.innerText.replace('#', '');
    copyText(text.trim());
  }
};


// Keyboard Event Helpers
export const noModifierKey = (e: KeyboardEvent): boolean => {
  return !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey;
};

export const shiftOnly = (e: KeyboardEvent): boolean => {
  return e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey;
};

export const isTabKey = (e: KeyboardEvent) =>
  e.key === 'Tab' && noModifierKey(e);


// Attribute checker
export const hasPopup = (target?: EventTarget | HTMLElement | null) => {
  return !!(target && (target as HTMLElement).dataset.haspopup === 'true');
};
