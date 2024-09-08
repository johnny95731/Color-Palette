import { arraylize, arrFilter } from './helpers';
import type { EventHandler, WindowEventName } from '@/types/browser';
import type { Arrayable } from '@/types/utils';


const listenerOptions = ['once', 'capture', 'passive'] as const;

type ListenerOptions = Partial<Record<typeof listenerOptions[number], boolean>>;
/**
 * First letter combinations
 */
type OptionKey =  '' | 'o' |'c' |'p' | 'oc' | 'op' |'cp' |'ocp';

type ListenerStore<EName extends WindowEventName, EType extends Event = WindowEventMap[EName]> = {
  event: EName;
  currentHandler: Partial<Record<OptionKey, EventHandler<EType> | null>>;
  registeredFuncs: Partial<Record<OptionKey, EventHandler<EType>[]>>;
}

/**
 * Get key of a group from listener options.
 */
function getOptionKey(options: ListenerOptions): OptionKey {
  return (
    listenerOptions.reduce(
      (prev, val) => options[val] ? prev + val[0] : prev, ''
    )
  ) as unknown as OptionKey;
}

/**
 * Return whether some listener with a combination of options is working.
 */
function isEmptyStore<
  EName extends WindowEventName, EType extends Event = WindowEventMap[EName]
>(
  store: ListenerStore<EName>,
) {
  return (
    Object.values(store.registeredFuncs) as EventHandler<EType>[][]
  ).every(funcs => !funcs?.length);
}

const createListerenerStore = <EName extends WindowEventName>(event: EName): ListenerStore<EName, WindowEventMap[EName]> => ({
  event,
  currentHandler: {},
  registeredFuncs: {}
});

const ListenerStores: {
  [EName in WindowEventName]?: ListenerStore<EName, WindowEventMap[EName]>
} = {};

/**
 * Create a function to excutes all handlers instead of multiple event listener.
 */
const windowEventRegister = <
  EName extends WindowEventName
>(
    event: EName,
    handlers: Arrayable<EventHandler<WindowEventMap[EName]>>,
    options: ListenerOptions = {}
  ) => {
  handlers = arraylize(handlers);
  if (!handlers.length) return;
  // init
  const store = (
    // @ts-expect-error
    ListenerStores[event] ??= createListerenerStore(event)
  ) as ListenerStore<EName, WindowEventMap[EName]>;
  const optionKey = getOptionKey(options);
  // Register, append
  (store.registeredFuncs[optionKey] ??= []).push(...handlers!);
  // Create handler if not handler
  if (!store.currentHandler[optionKey]) {
    store.currentHandler[optionKey] = async (e: WindowEventMap[EName]) => {
      const funcs = store.registeredFuncs[optionKey];
      if (!funcs) return;
      const results = [];
      for (const func of funcs)
        results.push(func(e));
      // remove registered if once: true
      if (options['once']) funcs.length = 0;
      for (const val of results)
        if ((await val) === false) return false;
    };
    addEventListener(
      store.event,
      store.currentHandler[optionKey] as EventHandler,
      options
    );
  }

  const cleanup = () => {
    const store = ListenerStores[event];
    if (!store) return;
    store.registeredFuncs[optionKey] = arrFilter(
      store.registeredFuncs[optionKey] ?? [],
      func => !(handlers as EventHandler<WindowEventMap[EName]>[]).includes(func)
    );
    if (!store.registeredFuncs[optionKey].length) {
      removeEventListener(
        store.event,
        store.currentHandler[optionKey]!,
        options
      );
      store.currentHandler[optionKey] = null;
    }
    if (isEmptyStore(store)) {
      ListenerStores[event] = undefined;
    }
  };
  return cleanup;
};
export default windowEventRegister;

