import { getCurrentInstance } from 'vue';
import { randomCharacter } from './helpers';
import type { EventHandler } from '@/types/browser';


export function getPropertyValue(el: HTMLElement, property: string): number;
export function getPropertyValue(el: string): number;
export function getPropertyValue(
  el: HTMLElement | string,
  property?: string
) {
  if (typeof el === 'string') {
    property = el;
    el = document.documentElement;
  }
  const num = +getComputedStyle(el)
    .getPropertyValue(property ?? 'width' as string)
    .replace(/(px)|%|(rem)/g, '');
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
  return thisInstance ? `${prefix}-${thisInstance.uid}` : getRandomId(prefix+'-');
};

// Events
export const stopPropagation = (e: Event) => e.stopPropagation();

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
 * Copy Hex innerText to clipboard (excludes "#").
 */
export const copyInnerHex: EventHandler = (e: Event) => {
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
