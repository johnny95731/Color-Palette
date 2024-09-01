import { shallowReactive, watch } from 'vue';
import {
  tryOnMounted, unrefElement, useMutationObserver, useResizeObserver,
} from '@vueuse/core';
import { useWindowEventRegister } from './useWindowEventRegister';
import { objPick } from '../helpers';
import type {
  MaybeComputedElementRef, UseElementBoundingOptions
} from '@vueuse/core';

type RectKeys = 'height' | 'width' | 'bottom' | 'left' | 'right' | 'top' | 'x' | 'y';

type Rect<K extends string = RectKeys> = Record<K, number>;

const emptyRect = {
  height: 0,
  width: 0,
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
  x: 0,
  y: 0,
} as Rect;

/**
 * Modify of vueuse.useElementBounding
 */
export function useElementBounding<K extends RectKeys>(
  target: MaybeComputedElementRef,
  options: UseElementBoundingOptions & {
    filter?: K[]
  } = {},
) {
  const {
    reset = true,
    windowResize = true,
    windowScroll = true,
    immediate = true,
    updateTiming = 'sync',
    filter = [
      'height', 'width', 'bottom', 'left', 'right', 'top', 'x', 'y'
    ],
  } = options;

  const rectObj: Rect<K> =
    shallowReactive<Rect>(objPick(emptyRect, filter));

  function recalculate() {
    const el = unrefElement(target);
    if (!el) {
      if (reset)
        Object.assign(rectObj, objPick(emptyRect, filter));
      return;
    }
    const rect = el.getBoundingClientRect();
    Object.assign(rectObj, objPick(rect, filter));
  }

  function update() {
    if (updateTiming === 'sync')
      recalculate();
    else if (updateTiming === 'next-frame')
      requestAnimationFrame(() => recalculate());
  }

  useResizeObserver(target, update);
  watch(() => unrefElement(target), ele => !ele && update());
  // trigger by css or style
  useMutationObserver(target, update, {
    attributeFilter: ['style', 'class'],
  });

  if (windowScroll)
    useWindowEventRegister('scroll', update, { capture: true, passive: true });
    // useEventListener('scroll', update, { capture: true, passive: true });
  if (windowResize)
    useWindowEventRegister('resize', update, { passive: true });
    // useEventListener('resize', update, { passive: true });

  tryOnMounted(() => {
    if (immediate)
      update();
  });

  return {
    rect: rectObj,
    update,
  };
}
