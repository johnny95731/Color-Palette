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
      <div
        :class="$style2.region"
      >
        <h3
          v-once
        >
          對比值計算
          <VTooltip>
            <template #activator="{props: tooltipProps}">
              <VIcon
                v-bind="tooltipProps"
                type="info-circle"
              />
            </template>
            <template #text>
              WCAG一般文字標準<br>
              Level AA&ensp;&numsp;: &geq;4.5<br>
              Level AAA&thinsp;&thinsp;: &geq;7<br>
            </template>
          </VTooltip>
          <VTooltip>
            <template #activator="{props: tooltipProps}">
              <VIcon
                v-bind="tooltipProps"
                type="info-square"
                style="margin-left: 4px;"
              />
            </template>
            <template #text>
              WCAG大型文字標準<br>
              Level AA&ensp;&numsp;: &geq;3<br>
              Level AAA&thinsp;&thinsp;: &geq;4.5
              <div style="opacity: 0.8;">
                文字≥18pt或粗體且≥14pt稱為大型文字。
              </div>
            </template>
          </VTooltip>
        </h3>
        <label
          v-once
          for="contrast-ratio-bg"
        >背景顏色</label>
        <HexInputter
          v-model="bgColor"
          id="contrast-ratio-bg"
        />
        <label
          v-once
          for="contrast-ratio-text"
        >文字顏色</label>
        <HexInputter
          v-model="textColor"
          id="contrast-ratio-text"
        />
        <span>對比值</span>
        <div>{{ contrastRatio }}</div>
      </div>
      <div :class="[$style1.example]">
        <h3 v-once>
          範例
        </h3>
        <div
          v-memo="[bgColor, textColor]"
          :style="{
            background: bgColor,
            color: textColor,
          }"
          aria-hidden="true"
        >
          <div
            v-once
            v-text="'Text'"
            :style="{
              fontSize: '10pt',
            }"
          />
          <div
            v-once
            v-text="'Text'"
            :style="{
              fontSize: '14pt',
            }"
          />
          <div
            v-once
            v-text="'Large'"
            :style="{
              fontSize: '14pt',
              fontWeight: 'bold',
            }"
          />
          <div
            v-once
            v-text="'Large'"
            :style="{
              fontSize: '18pt',
            }"
          />
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
import { isTabKey } from '@/utils/browser';
import { getContrastRatio } from '@/utils/colors';
import { CONTRAST_METHODS } from '@/utils/manipulate/contrast';
import { GAMMA_MAX, MULTIPLICATION_MAX } from '@/utils/manipulate/mixing';
// stores
import usePltStore from '@/stores/usePltStore';
import VIcon from '../Custom/VIcon.vue';
import VTooltip from '../Custom/VTooltip.vue';
import HexInputter from '../Custom/HexInputter.vue';

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

const contrastBtnEvent = (state: Parameters<typeof pltState.setIsAdjustingPlt_>['0']) => {
  pltState.setIsAdjustingPlt_(state);
  contrastArgs[contrastArgs.method_] = 1;
  updateContrastResult();
};


// # Page 1: Contrast Ratio
const bgColor = ref<string>('#FFFFFF'); // background
const textColor = ref<string>('#000000'); // foreground
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
