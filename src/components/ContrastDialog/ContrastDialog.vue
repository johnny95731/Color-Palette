<template>
  <VDialog
    ref="dialogRef"
    :overlayProps="{
      contentClass: $style1.contrastDialog
    }"
    title="對比"
    :tabs="tabLabels"
    v-model="isOpened"
    v-model:tab-idx="tabIdx"
  >
    <template v-if="tabIdx === 0">
      <div :class="$style2.region">
        <label
          v-once
          id="contrast-method"
        >Method</label>
        <SelectMenu
          label="#contrast-method"
          :items="CONTRAST_METHODS"
          :index="contrastArgs.method_"
          @update:idx="handleMethodChanged($event)"
        />
        <template v-if="contrastArgs.method_ !== 2">
          <label
            id="contrast-coeff-name"
          >Coeff.</label>
          <VSlider
            label="#contrast-coeff-name"
            :max="contrastCoeffMax"
            step="0.001"
            :model-value="contrastArgs[contrastArgs.method_]"
            @update:model-value="
              contrastArgs[contrastArgs.method_] = $event;
              updateContrastResult();
            "
          />
        </template>
      </div>
    </template>
    <template v-else-if="tabIdx === 1">
      <div :class="$style2.region">
        <h3 v-once>
          對比值計算
        </h3>
        <label
          v-once
          for="contrast-ratio-bg"
        >背景顏色</label>
        <input
          v-model="bgColor"
          id="contrast-ratio-bg"
          :class="$style1.hex"
          maxlength="7"
          size="7"
          @input="hexTextEdited($event)"
          @change="handleHexEditingFinished($event, 'bg')"
        >
        <label
          v-once
          for="contrast-ratio-text"
        >文字顏色</label>
        <input
          v-model="textColor"
          id="contrast-ratio-text"
          :class="$style1.hex"
          maxlength="7"
          size="7"
          @input="hexTextEdited($event)"
          @change="handleHexEditingFinished($event, 'fg')"
        >
        <span>對比值</span>
        <div>{{ contrastRatio }}</div>
      </div>
      <div :class="[$style1.example]">
        <h3 v-once>
          範例
        </h3>
        <div
          v-for="(i) in 5"
          :key="i"
          v-memo="[bgColor, textColor]"
          :style="{
            background: bgColor,
            color: textColor,
          }"
          aria-hidden="true"
        >
          Text
        </div>
      </div>
    </template>
    <template
      v-if="tabIdx === 0"
      #actions
    >
      <VBtn
        text="重置"
        @click="contrastBtnEvent('reset')"
      />
      <VBtn
        :class="$style1.applyBtn"
        text="套用"
        @keydown="handleFocusoutDialog"
        @click="contrastBtnEvent('start')"
      />
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, nextTick, unref } from 'vue';
import $style1 from './ContrastDialog.module.scss';
import $style2 from '../SettingDialog/SettingDialog.module.scss';
import VBtn from '../Custom/VBtn.vue';
import SelectMenu from '../Custom/SelectMenu.vue';
import VSlider from '../Custom/VSlider.vue';
import VDialog from '../Custom/VDialog.vue';
// utils
import { forLoop } from '@/utils/helpers';
import { hexTextEdited, isTabKey } from '@/utils/browser';
import { getContrastRatio } from '@/utils/colors';
import { isValidHex } from '@/utils/colorModels/hex';
import { CONTRAST_METHODS } from '@/utils/manipulate/contrast';
import { GAMMA_MAX, MULTIPLICATION_MAX } from '@/utils/manipulate/mixing';
// stores
import usePltStore from '@/stores/usePltStore';

const dialogRef = ref<InstanceType<typeof VDialog>>();

const pltState = usePltStore();

const tabLabels = [
  '調整',
  '計算',
] as const;

const tabIdx = ref(0);

const handleFocusoutDialog = (e: KeyboardEvent) => {
  if (isTabKey(e)) {
    e.preventDefault();
    isOpened.value = false;
  }
};

// # Page 0: Adjuster
type ContrastArgs = {
  method_: number
} & {
  [key in number]: number;
}
const contrastArgs = reactive<ContrastArgs>(
  forLoop(
    CONTRAST_METHODS,
    (prev, _, i) => ((prev[i] = 1), prev),
    { method_: 0 } as ContrastArgs
  ));
const contrastCoeffMax = computed(() => {
  return contrastArgs.method_ ? GAMMA_MAX : MULTIPLICATION_MAX;
});

const handleMethodChanged = (idx: number) => {
  contrastArgs.method_ = idx!;
  pltState.setIsAdjustingPlt_('reset');
  updateContrastResult();
};

const updateContrastResult = () => {
  pltState.adjustContrast_(
    contrastArgs.method_,
    contrastArgs[contrastArgs.method_]
  );
};

const contrastBtnEvent = (state: 'start' | 'reset') => {
  pltState.setIsAdjustingPlt_(state);
  contrastArgs[contrastArgs.method_] = 1;
  updateContrastResult();
};


// # Page 1: Contrast Ratio
const bgColor = ref<string>('#FFFFFF'); // background
const textColor = ref<string>('#000000'); // foreground
watch(bgColor, (n) => console.log(n));
/**
 * Finish Hex editing when input is blurred or press 'Enter'
 */
const handleHexEditingFinished = function(e: Event, idx: 'bg' | 'fg') {
  const colorRef = idx === 'bg' ? bgColor : textColor;
  const text = (e.currentTarget as HTMLInputElement).value;
  if (text !== unref(colorRef) && isValidHex(text)) {
    colorRef.value = text;
  }
};
const contrastRatio = computed(() => getContrastRatio(unref(bgColor), unref(textColor)));


// Show and Hide
const isOpened = defineModel<boolean>();
watch(isOpened, async (newVal) => {
  await nextTick();
  if (newVal && unref(tabIdx) === 0) {
    // Start adjusting when open dialog and in 2nd tab
    pltState.setIsAdjustingPlt_('start');
    updateContrastResult();
  } else if (!newVal && pltState.isAdjustingPlt_)
    pltState.setIsAdjustingPlt_('cancel');
  // Focusing on tab after opening the dialog.
  unref(dialogRef)?.tabRefs[unref(tabIdx)]?.$el.focus();
}, { flush: 'post' });

watch(tabIdx, (newVal, oldVal) => {
  if (newVal === 0) { // Switch to tab 0
    pltState.setIsAdjustingPlt_('start');
    updateContrastResult();
  } else if (oldVal === 0) // From tab 0 switch to another tab.
    pltState.setIsAdjustingPlt_('cancel');
}, { flush: 'post', immediate: true });
</script>
