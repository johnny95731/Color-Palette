// Events
export const preventDefault = (e: MouseEvent) => {
  e.preventDefault();
  return false;
};

export const stopPropagation = (e: Event) => e.stopPropagation();

/**
 * Remove non-hex text and add "#" to first word.
 * @param e Triggered mouse event.
 */
export const hexTextEdited = (
  e: Event,
): void => {
  const textInput = e.currentTarget as HTMLInputElement;
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
export const copyInnerHex = (
  e: MouseEvent,
): void => {
  const target = e.currentTarget as HTMLElement;
  if (!target) return;
  const text = target.innerText.replace('#', '');
  const start = text.startsWith('#') ? 1 : 0;
  const hex = text.slice(start).trim();
  copyText(hex);
};


// Keyboard Event Helpers
export function noModifierKey(e: KeyboardEvent): boolean {
  return !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey;
}

export function shiftOnly(e: KeyboardEvent): boolean {
  return e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey;
}


export function isMenuContainer(target?: EventTarget | Element | null) {
  return (target as Element | null)?.classList.contains('menu-container');
}

export function hasPopup(target?: EventTarget | HTMLElement | null) {
  return !!(target && (target as HTMLElement).dataset.haspopup === 'true');
}
