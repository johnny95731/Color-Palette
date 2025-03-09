import { getCurrentInstance } from 'vue';
import { randomCharacter } from './helpers';
import type { EventHandler } from '@/types/browser';
import type { Props as OverlayProps } from '@/components/Custom/OverlayContainer.vue';


export function getPropertyValue(el: HTMLElement | null | undefined, property: string): number;
export function getPropertyValue(property: string): number;
export function getPropertyValue(
  el: HTMLElement | string | null | undefined,
  property?: string
) {
  if (typeof el === 'string') {
    property = el;
    el = document.documentElement;
  }
  if (!el) el = document.documentElement;
  const num = +getComputedStyle(el!)
    .getPropertyValue(property ?? 'width' as string)
    .replace(/[^0-9]/g, '');
  return Number.isNaN(num) ? 0 : num;

}

// Id generater
const getRandomId = (prev?: string) => {
  let id = (prev ?? '') + randomCharacter(true);
  while (document.getElementById(id))
    id += randomCharacter();
  return id;
};

export const getComponentId = (prefix: string = 'component') => {
  const thisInstance = getCurrentInstance();
  if (!thisInstance || document.getElementById(`${prefix}-${thisInstance.uid}`))
    return getRandomId(prefix+'-');
  return `${prefix}-${thisInstance.uid}`;
};

// Events
export const stopPropagation = (e: Event) => e.stopPropagation();

export function getCursorPosition(e: MouseEvent | TouchEvent): MouseEvent | Touch
export function getCursorPosition(
  e: MouseEvent | TouchEvent,
  client: `${'client' | 'page' | 'screen'}${'Y' | 'X'}`
): number
/**
 * Return TouchList if `e` is TouchEvent else return `e`
 */
export function getCursorPosition(
  e: MouseEvent | TouchEvent,
  client?: `${'client' | 'page' | 'screen'}${'Y' | 'X'}`
) {
  // @ts-expect-error
  const obj = e.touches ?
    (e as TouchEvent).touches[0] :
    (e as MouseEvent);
  return client ? obj[client] : obj;
}

/**
 * Remove non-hex text and add "#" to first word.
 */
export const hexTextEdited: EventHandler = (e: Event) => {
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
 * Paste text from clipboard.
 */
export const pasteText = async () => {
  try {
    return await clipboard.readText();
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};


export const calcOverlayZIndex = (type: OverlayProps['type'], parent?: number) => {
  let zIndex: number;
  if (parent) // not outermost node.
    zIndex = parent + 1;
  else if (type === 'tooltip')
    zIndex = 50;
  else zIndex = 100;
  return zIndex;
};


// Keyboard Event Helpers
export const noModifierKey = (e: KeyboardEvent): boolean => {
  return !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey;
};

export const shiftOnly = (e: KeyboardEvent): boolean => {
  return e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey;
};

export const ctrlOnly = (e: KeyboardEvent): boolean => {
  return e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey;
};

export const isTabKey = (e: KeyboardEvent) =>
  e.key === 'Tab' && noModifierKey(e);


// Attribute checker
export const hasPopup = (target?: EventTarget | HTMLElement | null) => {
  return !!(target && (target as HTMLElement).dataset.haspopup === 'true');
};
