import { computed, ref, toValue, unref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { clip, rangeMapping } from '@/utils/numeric';
import type { MaybeRef, MaybeRefOrGetter } from 'vue';
import type { Position } from '@vueuse/core';

// A Modified of vueuse/useDraggable

/** */
export interface UseDraggableOptions {
  /**
   * Prevent events defaults
   *
   * @default true
   */
  preventDefault?: MaybeRefOrGetter<boolean>

  /**
   * Prevent events propagation
   *
   * @default true
   */
  stopPropagation?: MaybeRefOrGetter<boolean>

  /**
   * Whether dispatch events in capturing phase
   *
   * @default true
   */
  capture?: boolean

  /**
   * Element for calculating bounds (If not set, it will use the event's target).
   *
   * @default undefined
   */
  containerElement?: MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>

  /**
   * Initial position of the element.
   *
   * @default object { x: 0, y: 0 }
   */
  initialValue?: MaybeRefOrGetter<Partial<Position>>

  /**
   * Binding `start` function automatically.
   *
   * @default true
   */
  binding?: MaybeRefOrGetter<boolean>

  /**
   * Callback when the dragging starts. Return `false` to prevent dragging.
   */
  onStart?: MaybeRef<(position: Position, event: PointerEvent) => void | false>

  /**
   * Callback during dragging.
   */
  onMove?: MaybeRef<(position: Position, event: PointerEvent) => void>

  /**
   * Callback when dragging end.
   */
  onEnd?: MaybeRef<(position: Position, event: PointerEvent) => void>

  /**
   * Axis to drag on.
   *
   * @default 'both'
   */
  axis?: 'x' | 'y' | 'both'

  /**
   * Whether map the possition to percentage (0~100).
   *
   * @default false
   */
  toRatio?: true
}

/**
 * Wrap a drag event.
 * @param target Element to trigger drag event.
 * @param options
 * @returns
 */
export const useDragableElement = (
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: UseDraggableOptions = { capture: true }
) => {
  const {
    preventDefault = false,
    stopPropagation = false,
    containerElement = document.documentElement,
    initialValue,
    binding = true,
    onMove,
    onEnd,
    onStart,
    axis = 'both',
    toRatio = true,
  } = options;

  const isDragging_ = ref(false);
  /**
   * Cursor coordinate on screen. If `container` is specific, position is
   * bounding by the container and the top-left of the container is the origin.
   */
  const position = ref<Position>(Object.assign({ x: 0, y: 0 }, toValue(initialValue)));
  const unit = toRatio ? '%' : 'px';

  const handleEvent = (e: PointerEvent) => {
    if (toValue(preventDefault))
      e.preventDefault();
    if (toValue(stopPropagation))
      e.stopPropagation();
  };

  const getContainerRect = () => {
    return toValue(containerElement)?.getBoundingClientRect?.();
  };

  /**
   * Bounding the value by container and mapping to percentage (if specific).
   */
  const posConverter = (val: number, start: number, end: number) => {
    return toRatio ?
      rangeMapping(val, start, end, 0, 100) :
      clip(val, start, end) - start;
  };

  /** Calculate cursor position. */
  const calcPos = (e: PointerEvent) => {
    const containerRect = getContainerRect();
    let { x, y } = position.value;
    if (axis === 'x' || axis === 'both') {
      x = e.clientX;
      if (containerRect)
        x = posConverter(x, containerRect.x, containerRect.right);
    }
    if (axis === 'y' || axis === 'both') {
      y = e.clientY;
      if (containerRect)
        y = posConverter(y, containerRect.y, containerRect.bottom);
    }
    return { x, y };
  };

  // Dragging events
  const cleanups: (() => void)[] = [];
  const config = { capture: options.capture ?? true };

  function start(e: PointerEvent) {
    if (e.button !== 0) return;
    const pos = calcPos(e);
    if (unref(onStart)?.(pos, e) === false)
      return;
    isDragging_.value = true;
    cleanups.push(
      useEventListener('pointermove', move, config),
      useEventListener('pointerup', end, config),
      useEventListener('pointercancel', end, config),
    );
    handleEvent(e);
    return false;
  }
  function move(e: PointerEvent) {
    if (!isDragging_.value) return;

    const pos = calcPos(e);
    position.value = pos;
    unref(onMove)?.(pos, e);
    handleEvent(e);
  }
  function end(e: PointerEvent) {
    isDragging_.value = false;
    cleanups.forEach(fn => fn());
    unref(onEnd)?.(position.value, e);
    handleEvent(e);
  }

  let cleanupStart: (() => void) | undefined;
  watch(() => toValue(binding), (newVal) => {
    cleanupStart?.();
    if (newVal)
      cleanupStart = useEventListener(target, 'pointerdown', start, config);
  }, { immediate: true });

  return {
    position,
    // Avoid to be changed.
    isDragging: computed(() => isDragging_.value),
    style: computed(
      () => ({
        left: `${position.value.x}${unit}`,
        top: `${position.value.y}${unit}`,
      }),
    ),
    start,
  };
};
