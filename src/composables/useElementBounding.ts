import { shallowReactive, watch } from 'vue';
import {
  tryOnMounted, unrefElement, useEventListener, useMutationObserver, useResizeObserver,
} from '@vueuse/core';
import { objPick } from '../utils/helpers';
import type {
  MaybeComputedElementRef
} from '@vueuse/core';

type RectKeys = 'height' | 'width' | 'bottom' | 'left' | 'right' | 'top' | 'x' | 'y';

type Rect<K extends string = RectKeys> = Record<K, number>;
export interface UseElementBoundingOptions<K> {
    /**
     * Reset values to 0 on component unmounted
     *
     * @default true
     */
    reset_?: boolean;
    /**
     * Listen to window resize event
     *
     * @default true
     */
    windowResize_?: boolean;
    /**
     * Listen to window scroll event
     *
     * @default true
     */
    windowScroll_?: boolean;
    /**
     * Immediately call update on component mounted
     *
     * @default true
     */
    immediate_?: boolean;
    /**
     * Timing to recalculate the bounding box
     *
     * Setting to `next-frame` can be useful when using this together with something like {@link useBreakpoints}
     * and therefore the layout (which influences the bounding box of the observed element) is not updated on the current tick.
     *
     * @default 'sync'
     */
    updateTiming_?: 'sync' | 'next-frame';

    filter_?: K[]
}

const emptyRect = {
  height: 0,
  width: 0,
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
  x: 0,
  y: 0,
} satisfies Rect;

/**
 * Modify of vueuse.useElementBounding
 */
export const useElementBounding = <K extends RectKeys>(
  target: MaybeComputedElementRef,
  options: UseElementBoundingOptions<K> = {}
) => {
  const {
    reset_ = true,
    windowResize_ = true,
    windowScroll_ = true,
    immediate_ = true,
    updateTiming_ = 'sync',
    filter_: filter_ = [
      'height', 'width', 'bottom', 'left', 'right', 'top', 'x', 'y'
    ],
  } = options;

  const rectObj: Rect<K> =
    shallowReactive<Rect>(objPick(emptyRect, filter_));

  const recalculate = () => {
    const el = unrefElement(target);
    if (!el) {
      if (reset_)
        Object.assign(rectObj, objPick(emptyRect, filter_));
      return;
    }
    const rect = el.getBoundingClientRect();
    Object.assign(rectObj, objPick(rect, filter_));
  };

  const update_ = () => {
    if (updateTiming_ === 'sync')
      recalculate();
    else if (updateTiming_ === 'next-frame')
      requestAnimationFrame(() => recalculate());
  };

  useResizeObserver(target, update_);
  watch(() => unrefElement(target), ele => !ele && update_());
  // trigger by css or style
  useMutationObserver(target, update_, {
    attributeFilter: ['style', 'class'],
  });

  if (windowScroll_)
    useEventListener('scroll', update_, { capture: true, passive: true });
  if (windowResize_)
    useEventListener('resize', update_, { passive: true });

  tryOnMounted(() => {
    if (immediate_)
      update_();
  });

  return {
    rect_: rectObj,
    update_,
  };
};
