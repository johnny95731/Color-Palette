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
/**
 * Copy Hex text to clipboard (excludes "#").
 * @param e Triggered mouse event.
 */
export const copyHex = (
  e: MouseEvent,
): void => {
  const target = e.currentTarget as HTMLElement;
  if (!target) return;
  const text = target.innerText;
  const brIdx = text.indexOf('\n'); // index of break.
  const start = text.startsWith('#') ? 1 : 0;
  let hex: string;
  if (brIdx > -1) {
    hex = text.slice(start, brIdx);
  } else {
    hex = text.slice(start);
  }
  try {
    navigator.clipboard.writeText(hex);
  } catch (err) {
    console.error('copy hex:', err);
  }
};
