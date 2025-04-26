import { computed, ref, toValue, unref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { reduce } from '@/utils/helpers';
import type { MaybeRef, MaybeRefOrGetter } from 'vue';
import type { Position } from '@vueuse/core';
import { clip, rangeMapping } from '@johnny95731/color-utils';

// A Modified of vueuse/useDraggable

/** */
export interface UseDraggableOptions {
  /**
   * Prevent events defaults
   *
   * @default true
   */
  preventDefault_?: MaybeRefOrGetter<boolean>

  /**
   * Prevent events propagation
   *
   * @default true
   */
  stopPropagation_?: MaybeRefOrGetter<boolean>

  /**
   * Whether dispatch events in capturing phase
   *
   * @default true
   */
  capture_?: boolean

  /**
   * Element for calculating bounds (If not set, it will use the event's target).
   *
   * @default undefined
   */
  containerElement_?: MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>

  /**
   * Initial position of the element.
   *
   * @default object { x: 0, y: 0 }
   */
  initialValue_?: MaybeRefOrGetter<Partial<Position>>

  /**
   * Binding `start` function automatically.
   *
   * @default true
   */
  binding_?: MaybeRefOrGetter<boolean>

  /**
   * Callback when the dragging starts. Return `false` to prevent dragging.
   */
  onStart_?: MaybeRef<(position: Position, event: PointerEvent) => void | false>

  /**
   * Callback during dragging.
   */
  onMove_?: MaybeRef<(position: Position, event: PointerEvent) => void>

  /**
   * Callback when dragging end.
   */
  onEnd_?: MaybeRef<(position: Position, event: PointerEvent) => void>

  /**
   * Axis to drag on.
   *
   * @default 'both'
   */
  axis_?: 'x' | 'y' | 'both'

  /**
   * Whether map the possition to percentage (0~100).
   *
   * @default true
   */
  toRatio_?: boolean
}

/**
 * Wrap a drag event.
 * @param target Element to trigger drag event.
 * @param options
 * @returns
 */
export const useDragableElement = (
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: UseDraggableOptions = { capture_: true }
) => {
  const {
    preventDefault_: preventDefault_ = false,
    stopPropagation_: stopPropagation_ = false,
    containerElement_: containerElement_ = document.documentElement,
    initialValue_: initialValue_,
    binding_: binding_ = true,
    onMove_: onMove_,
    onEnd_: onEnd_,
    onStart_: onStart_,
    axis_: axis_ = 'both',
    toRatio_: toRatio_ = true,
  } = options;

  const isDragging_ = ref(false);
  /**
   * Cursor coordinate on screen. If `container` is specific, position is
   * bounding by the container and the top-left of the container is the origin.
   */
  const position_ = ref<Position>(Object.assign({ x: 0, y: 0 }, toValue(initialValue_)));

  const handleEvent = (e: PointerEvent) => {
    if (toValue(preventDefault_))
      e.preventDefault();
    if (toValue(stopPropagation_))
      e.stopPropagation();
  };

  const getContainerRect = () => {
    return toValue(containerElement_)?.getBoundingClientRect?.();
  };

  /**
   * Bounding the value by container and mapping to percentage (if specific).
   */
  const posConverter = (val: number, start: number, end: number) => {
    return toRatio_ ?
      rangeMapping(val, start, end, 0, 100) :
      clip(val, start, end) - start;
  };

  /** Calculate cursor position. */
  const calcPos = (e: PointerEvent) => {
    const containerRect = getContainerRect();
    let { x, y } = unref(position_);
    if (axis_ === 'x' || axis_ === 'both') {
      x = e.clientX;
      if (containerRect)
        x = posConverter(x, containerRect.x, containerRect.right);
    }
    if (axis_ === 'y' || axis_ === 'both') {
      y = e.clientY;
      if (containerRect)
        y = posConverter(y, containerRect.y, containerRect.bottom);
    }
    return { x, y };
  };

  // Dragging events
  const cleanups: (() => void)[] = [];
  const config = { capture: options.capture_ ?? true };

  const start_ = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const pos = calcPos(e);
    if (unref(onStart_)?.(pos, e) === false)
      return;
    isDragging_.value = true;
    cleanups.push(
      useEventListener('pointermove', move, config),
      useEventListener('pointerup', end, config),
      useEventListener('pointercancel', end, config),
    );
    handleEvent(e);
    return false;
  };
  const move = (e: PointerEvent) => {
    if (!isDragging_.value) return;

    const pos = calcPos(e);
    position_.value = pos;
    unref(onMove_)?.(pos, e);
    handleEvent(e);
  };
  const end = (e: PointerEvent) => {
    isDragging_.value = false;
    reduce(cleanups, (_, fn) => fn());
    unref(onEnd_)?.(unref(position_), e);
    handleEvent(e);
  };

  let cleanupStart: (() => void) | undefined;
  watch(() => toValue(binding_), (newVal) => {
    cleanupStart?.();
    if (newVal)
      cleanupStart = useEventListener(target, 'pointerdown', start_, config);
  }, { immediate: true });

  return {
    position_,
    isDragging_: computed(() => unref(isDragging_)),
    start: start_,
  };
};
