import { computed, shallowRef, toValue, unref, watch } from 'vue';
import { tryOnMounted } from '@vueuse/core';
import { getComponentId, isId } from '@/utils/browser';
import type { MaybeRefOrGetter } from 'vue';


export type UseInputFieldOptions = {
  /**
   * Component name for generate input id.
   */
  componentName?: string,
  /**
   * Specific the input id.
   * Has higher priority than `componentName`.
   */
  inputId?: MaybeRefOrGetter<string>,
}


const useInputField = (
  label?: MaybeRefOrGetter<string>,
  /**
   * Component name for generate input id.
   */
  componentName?: string
) => {

  /**
   * Create Id for input
   */
  const idForInput = computed<string>(() => getComponentId(componentName));
  /**
   * Aria label for <input />
   */
  const state = shallowRef<{
    id_: string,
    ariaLabelledby_?: string,
    ariaLabel_?: string
  }>({
    id_: toValue(idForInput),
  });
  tryOnMounted(() => {
    if (isId(toValue(label)))
      document
        .querySelector(toValue(label)!)
        ?.setAttribute('for', toValue(idForInput));
  });


  const cleanup = watch(
    () => [toValue(label), toValue(idForInput)] as const,
    (newVal, oldVal) => {
      if (isId(oldVal[0])) {
        document.querySelector(oldVal[0])?.removeAttribute('for');
      }
      if (isId(newVal[0])) {
        document.querySelector(newVal[0])?.setAttribute('for', newVal[1]);
      }
      const labelIsId = isId(newVal[0]);
      state.value = {
        id_: unref(idForInput),
        ariaLabelledby_: labelIsId ? newVal[0].slice(1) : undefined,
        ariaLabel_: labelIsId ? undefined : newVal[0],
      };
    }
  );

  return {
    state_: state,
    cleanup: cleanup.stop,
  };
};
export default useInputField;
