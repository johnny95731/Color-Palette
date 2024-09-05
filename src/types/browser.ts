
export type EventHandler<E = Event> = (
  (evt?: E) => void | unknown | Promise<void | unknown>) | (
  (evt: E) => void | unknown | Promise<void | unknown>
)
