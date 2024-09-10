import type { Ref, ShallowRef, WritableComputedRef } from 'vue';

export type EventHandler<E extends Event = Event> = (
  (evt?: E) => void | unknown | Promise<void | unknown>) | (
  (evt: E) => void | unknown | Promise<void | unknown>
)

export type MaybeRef <T = unknown> = T | Ref<T> | ShallowRef<T> | WritableComputedRef<T>

export type WindowEventName = keyof WindowEventMap;

export type VueClass = string | unknown[] | {[key in string]: unknown}
