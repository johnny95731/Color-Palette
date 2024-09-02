import { watch } from 'vue';
import { arraylize, arrFilter } from '../helpers';
import { type MaybeRef, type Arrayable,  type WindowEventName, toValue } from '@vueuse/core';
import type{ EventHandler } from '@/types/funcType';


const listenerOptions = ['once', 'capture', 'passive'] as const;

type ListenerOptions = Partial<Record<typeof listenerOptions[number], boolean>>;
type OptionKey =  '' | 'o' |'c' |'p' | 'oc' | 'op' |'cp' |'ocp';

type ListenerStore<EName extends WindowEventName, EType extends Event = Event> = {
  event: EName;
  currentHandler: Partial<Record<OptionKey, EventHandler<EType> | null>>;
  registedFuncs: Partial<Record<OptionKey, EventHandler<EType>[]>>;
}

/**
 * Create a handler that will excute funcs in order.
 */
function createHandler<EName extends WindowEventName, EType extends Event = WindowEventMap[EName]>(
  /**
   * Listener options.
   */
  store: ListenerStore<EName, EType>,
  optionKey: OptionKey
) {
  return async (e: EType) => {
    if (!store.registedFuncs[optionKey]) return;
    const re = !(
      await Promise.all(store.registedFuncs[optionKey].map(func => func(e)))
    ).some(val => !val);
    // remove registed if once: true
    if (optionKey.startsWith('o')) store.registedFuncs[optionKey].length = 0;
    return re;

  };
}
/**
 * Get key of a group from listener options.
 */
function getOptionKey(options: ListenerOptions) {
  return (
    listenerOptions.reduce(
      (prev, val) => options[val] ? prev + val[0] : prev, ''
    )
  ) as unknown as OptionKey;
}
/**
 * Unregist old functions and regist new functions with specific options.
 * @param options Listener options. For spiliting functions into groups.
 * @param newFuncs Functions that will be registed.
 * @param oldFuncs Functions that will be unregisted.
 */
function updateRegisted<EName extends WindowEventName, EType extends Event>(
  /**
   * Listener options.
   */
  store: ListenerStore<EName, EType>,
  /**
   * Listener options.
   */
  options: ListenerOptions,
  /**
   * Functions that will be appended.
   */
  newFuncs?: Arrayable<EventHandler<EType>> | null,
  /**
   * Functions that will be removed.
   */
  oldFuncs?: Arrayable<EventHandler<EType>> | null,
) {
  const optionKey = getOptionKey(options);
  // unregist
  if (oldFuncs) {
    oldFuncs = arraylize(oldFuncs);
    store.registedFuncs[optionKey] = arrFilter(
      store.registedFuncs[optionKey] ?? [],
      func => !(oldFuncs as EventHandler<EType>[]).includes(func)
    );
  }
  // regist
  if (newFuncs) {
    newFuncs = arraylize(newFuncs);
    (store.registedFuncs[optionKey] ??= []).push(...newFuncs!);
  }
  updateListener(store, options, optionKey);
}

function removeListener<EName extends WindowEventName, EType extends Event>(
  /**
   * Listener options.
   */
  store: ListenerStore<EName, EType>,
  options: ListenerOptions,
  optionKey: OptionKey,
) {
  if (store.currentHandler[optionKey]) {
    window.removeEventListener(
      store.event, store.currentHandler[optionKey] as EventHandler, options
    );
    store.currentHandler[optionKey] = null;
  }
}

function updateListener<EName extends WindowEventName, EType extends Event>(
  /**
   * Listener options.
   */
  store: ListenerStore<EName, EType>,
  options: ListenerOptions,
  optionKey: OptionKey,
) {
  removeListener(store, options, optionKey);
  // addListener
  if (store.registedFuncs[optionKey]?.length) {
    store.currentHandler[optionKey] = createHandler(store, optionKey);
    window.addEventListener(
      store.event,
      store.currentHandler[optionKey] as EventHandler,
      options
    );
  }
}

/**
 * Return whether some listener with a combination of options is working.
 */
function isEmptyStore<EName extends WindowEventName, EType extends Event>(
  /**
   * Listener options.
   */
  store: ListenerStore<EName, EType>,
) {
  return (
    Object.entries(store.currentHandler) as [OptionKey, EventHandler<EType> | null][]
  )
    .every(([key, handler]) => {
      // no
      if (!handler && store.registedFuncs[key]) {
        store.registedFuncs[key]!.length = 0;
        delete store.registedFuncs[key];
        return true;
      }
      return !handler;
    });
}

const createListerenerStore = <EName extends WindowEventName, EType extends Event>(event: EName): ListenerStore<EName, EType> => ({
  event,
  currentHandler: {},
  registedFuncs: {}
});

const ListenerStores:
  Partial<Record<WindowEventName, ReturnType<typeof createListerenerStore>>>
  = {};

/**
 * Collect many event handlers and excute them in one event listener.
 * One listener excute many function have higher performance than many listener.
 */
export const useWindowEventRegister = <
  EName extends WindowEventName
>(
    event: EName,
    handlers: MaybeRef<Arrayable<EventHandler<WindowEventMap[EName]>>>,
    options: ListenerOptions = {}
  ) => {
  const stopWatch = watch(() => toValue(handlers), (newFuncs, oldFuncs) => {
    const store = ListenerStores[event] ??= createListerenerStore(event);
    // @ts-expect-error
    updateRegisted(store, options, newFuncs, oldFuncs);
    if (isEmptyStore(store)) delete ListenerStores[event];
    if (event ==='click') {
      console.log('trigger watch');
      console.log(newFuncs, oldFuncs);
      console.log(store.registedFuncs);
    }
  }, { immediate: true, flush: 'post' });

  const cleanup = () => {
    const store = ListenerStores[event];
    if (!store) return;
    // @ts-expect-error
    updateRegisted(store, options, null, handlers);
    if (isEmptyStore(store)) delete ListenerStores[event];
  };

  const stop = () => {
    stopWatch();
    cleanup();
  };
  return stop;
};


