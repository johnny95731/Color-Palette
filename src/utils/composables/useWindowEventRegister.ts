import { watch } from 'vue';
import type { Arrayable, WindowEventName } from '@vueuse/core';
import type{ EventHandler } from '@/types/funcType';


const listenerOptions = ['once', 'capture', 'passive'] as const;

type ListenerOptions = Partial<Record<typeof listenerOptions[number], boolean>>;
type OptionKey =  '' | 'o' |'c' |'p' | 'oc' | 'op' |'cp' |'ocp';


class ListerenerStore<EName extends WindowEventName, EType extends Event> {
  event: EName;
  currentListeners: Record<OptionKey, EventHandler<EType> | null>;
  registedFuncs: Record<OptionKey, EventHandler<EType>[]>;

  constructor (event: EName) {
    this.event = event;
    this.currentListeners = {
      '': null,
      'o': null,
      'c': null,
      'p': null,
      'oc': null,
      'op': null,
      'cp': null,
      'ocp': null,
    };
    this.registedFuncs = {
      '': [],
      'o': [],
      'c': [],
      'p': [],
      'oc': [],
      'op': [],
      'cp': [],
      'ocp': [],
    };
  }

  static createListener<EName extends WindowEventName, EType = WindowEventMap[EName]>(
    funcs: EventHandler<EType>[],
    optionKey: OptionKey
  ) {
    return async (e: EType) => {
      let re;
      for (const func of funcs) {
        const ret = await func(e);
        ret === false && (re = false);
      }
      // remove registed if once: true
      if (optionKey.startsWith('o')) funcs.length = 0;
      return re;
    };
  }

  updateRegisted(
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
    const optionKey = options['once'] ? 'o' : listenerOptions.reduce(
      (prev, val) => options[val] ? prev + val[0] : prev, ''
    ) as any as OptionKey;
    // unregist
    if (oldFuncs && !Array.isArray(oldFuncs)) oldFuncs = [oldFuncs];
    if (oldFuncs)
      this.registedFuncs[optionKey] = this.registedFuncs[optionKey]
        .filter(func => !oldFuncs.includes(func));
    // regist
    if (newFuncs && !Array.isArray(newFuncs)) newFuncs = [newFuncs];
    if (newFuncs)
      this.registedFuncs[optionKey].push(...newFuncs);
    this.updateListener(options, optionKey);
  }

  updateListener(
    options: ListenerOptions, optionKey?: OptionKey
  ) {
    if (optionKey == null) optionKey = (options['once'] ? 'o' : listenerOptions.reduce(
      (prev, val) => options[val] ? prev + val[0] : prev, ''
    )) as any as OptionKey;
    if (this.currentListeners[optionKey])
      window.removeEventListener(
        this.event, this.currentListeners[optionKey] as EventHandler , options
      );
    if (this.registedFuncs[optionKey].length) {
      this.currentListeners[optionKey] =
        ListerenerStore.createListener<EName, EType>(this.registedFuncs[optionKey], optionKey);
      window.addEventListener(
        this.event, this.currentListeners[optionKey] as EventHandler, options
      );
    }
  }
}

const eventStores: {
  [K in WindowEventName]?: ListerenerStore<K, WindowEventMap[K]>
} = {};

/**
 * Collect many event handlers and excute them in one event listener.
 * One listener excute many function have higher performance than many listener.
 */
export const useWindowEventRegister = <
  EName extends WindowEventName
>(
    event: EName,
    handlers: Arrayable<EventHandler<WindowEventMap[EName]>>,
    options: ListenerOptions = {}
  ) => {
  const stopWatch = watch(() => handlers, (newFuncs, oldFuncs) => {
    // @ts-expect-error
    const store = (eventStores[event] ??= new ListerenerStore(event));
    store.updateRegisted(options, newFuncs, oldFuncs);
  }, { immediate: true, flush: 'post' });

  const cleanup = () =>
    eventStores[event]!.updateRegisted(options, null, handlers);

  const stop = () => {
    stopWatch();
    cleanup();
  };
  return stop;
};


