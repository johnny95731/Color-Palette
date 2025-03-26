import { computed, toValue, unref, watch } from 'vue';
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

  const labelIsId = computed(() => isId(toValue(label)));

  /**
   * Create Id for input
   */
  const idForInput = computed<string>(() => getComponentId(componentName));
  /**
   * Aria label for <input />
   */
  const inputState_ = computed(() => {
    label = toValue(label);
    return {
      id: toValue(idForInput),
      'aria-labelledby': unref(labelIsId) ? label!.slice(1) : undefined,
      'aria-label': unref(labelIsId) ? undefined : label,
    };
  });
  tryOnMounted(() => {
    if (unref(labelIsId))
      document
        .querySelector(toValue(label)!)
        ?.setAttribute('for', toValue(idForInput));
  });


  const cleanup_ = watch(
    () => [toValue(label), toValue(idForInput)] as const,
    (newVal, oldVal) => {
      if (isId(oldVal[0])) {
        document.querySelector(oldVal[0])?.removeAttribute('for');
      }
      if (isId(newVal[0])) {
        document.querySelector(newVal[0])?.setAttribute('for', newVal[1]);
      }
    }
  );

  return {
    inputState_,
    cleanup_: cleanup_.stop,
  };
};
export default useInputField;
