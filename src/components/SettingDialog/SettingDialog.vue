<template>
  <VDialog
    ref="dialogRef"
    :overlayProps="{
      contentClass: $style.settingDialog
    }"
    title="設定"
    :tabs="tabLabels"
    v-model="model"
    v-model:tab-idx="tabIdx"
  >
    <!-- Page 0: Card -->
    <template v-if="tabIdx === 0">
      <div
        :class="$style.region"
        aria-labelledby="title-border"
      >
        <h3 id="title-border">
          Border
        </h3>
        <span>Show</span>
        <VSwitch
          label="show border"
          hide-label
          :model-value="settingsState.border.show"
          @update:model-value="settingsState.setBorder_('show', $event)"
        />
        <template v-if="settingsState.border.show">
          <label
            id="border-width"
          >Width(px)</label>
          <VSlider
            label="#border-width"
            :max="BORDER_MAX_WIDTH"
            :model-value="settingsState.border.width"
            @update:model-value="settingsState.setBorder_('width', $event)"
          />
          <label
            id="border-color"
          >Color</label>
          <SelectMenu
            label="#border-color"
            :items="BORDER_COLOR"
            letter-case="start"
            :model-value="settingsState.border.color"
            @update:model-value="settingsState.setBorder_('color', $event)"
          />
        </template>
      </div>
      <div
        :class="$style.region"
        aria-labelledby="title-transition"
      >
        <h3 id="title-transition">
          Transition
        </h3>
        <label
          id="transition-position"
        >Position(ms)</label>
        <VSlider
          label="#transition-position"
          :max="TRANSITION_MAX_POS"
          step="50"
          :model-value="settingsState.transition.pos"
          @update:model-value="handleTransitionChanged($event, 'pos')"
        />
        <label
          id="transition-color"
        >Color(ms)</label>
        <VSlider
          label="#transition-color"
          :max="TRANSITION_MAX_COLOR"
          step="50"
          :model-value="transition.color"
          @update:model-value="handleTransitionChanged($event, 'color')"
        />
      </div>
      <div
        :class="$style.region"
        aria-labelledby="title-Transition"
      >
        <h3 id="title-others">
          Others
        </h3>
        <label id="color-notation">Color Notation</label>
        <SelectMenu
          v-model="settingsState.colorNotation_"
          label="#color-notation"
          :items="COLOR_FUNCTIONS"
          letter-case="start"
          @keydown.tab="tabIdx = 1"
        />
      </div>
    </template>
    <!-- Page 1: Contrast -->
    <template v-else-if="tabIdx === 1">
      <div :class="$style.region">
        <label
          v-once
          id="contrast-method"
        >Method</label>
        <SelectMenu
          label="#contrast-method"
          :items="CONTRAST_METHODS"
          :index="contrastArgs.method"
          @update:index="handleMethodChanged($event)"
        />
        <template v-if="contrastArgs.method !== 2">
          <label
            id="contrast-coeff-name"
          >Coeff.</label>
          <VSlider
            label="#contrast-coeff-name"
            :max="contrastCoeffMax"
            step="0.001"
            :model-value="contrastArgs[contrastArgs.method]"
            @update:model-value="
              contrastArgs[contrastArgs.method] = $event;
              updateContrastDisplay();
            "
          />
        </template>
      </div>
    </template>
    <template
      v-if="tabIdx === 1"
      #actions
    >
      <VBtn
        text="重置"
        @click="contrastBtnEvent('reset')"
      />
      <VBtn
        :class="$style.applyBtn"
        text="套用"
        @keydown="handleFocusoutDialog"
        @click="contrastBtnEvent('start')"
      />
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, nextTick, unref } from 'vue';
import $style from './SettingDialog.module.scss';
import VBtn from '../Custom/VBtn.vue';
import SelectMenu from '../Custom/SelectMenu.vue';
import VSwitch from '../Custom/VSwitch.vue';
import VSlider from '../Custom/VSlider.vue';
import VDialog from '../Custom/VDialog.vue';
// utils
import { forLoop } from '@/utils/helpers';
import { isTabKey } from '@/utils/browser';
import { CONTRAST_METHODS } from '@/utils/manipulate/contrast';
import { GAMMA_MAX, MULTIPLICATION_MAX } from '@/utils/manipulate/mixing';
// stores
import usePltStore from '@/stores/usePltStore';
import useSettingStore, { BORDER_COLOR, BORDER_MAX_WIDTH, COLOR_FUNCTIONS, TRANSITION_MAX_COLOR, TRANSITION_MAX_POS } from '@/stores/useSettingStore';
// types
import type { TransitionStyle } from '@/stores/useSettingStore';

const model = defineModel<boolean>(); // Show/Hide

const dialogRef = ref<InstanceType<typeof VDialog>>();

const pltState = usePltStore();
const settingsState = useSettingStore();

const tabLabels = [
  'Card',
  'Contrast',
] as const;

const tabIdx = ref(0);

function handleFocusoutDialog(e: KeyboardEvent) {
  if (isTabKey(e)) {
    e.preventDefault();
    model.value = false;
  }
}

watch(model, async (newVal) => {
  await nextTick();
  if (newVal && tabIdx.value === 1) {
    // Start adjusting when open dialog and in 2nd tab
    pltState.setIsAdjustingPlt_('start');
    updateContrastDisplay();
  } else if (!newVal && pltState.isAdjustingPlt_)
    pltState.setIsAdjustingPlt_('cancel');
  // Focusing on tab after opening the dialog.
  dialogRef.value?.tabRefs[unref(tabIdx)]?.$el.focus();
});

watch(tabIdx, (newVal, oldVal) => {
  if (newVal === 1) { // Switch to tab-1
    pltState.setIsAdjustingPlt_('start');
    updateContrastDisplay();
  } else if (oldVal === 1) // From tab-1 switch to another tab.
    pltState.setIsAdjustingPlt_('cancel');
});

// page 0: Card
// -Transition states
const transition = reactive<{
  pos: number,
  color: number,
}>({
  pos: settingsState.transition.pos,
  color: settingsState.transition.color,
});

const handleTransitionChanged = (
  val: number, attr: keyof TransitionStyle,
) => {
  if (attr === 'pos') transition.pos = val;
  else transition.color = val;
  settingsState.setTransition_(attr, val);
};
// page 1: Contrast
type ContrastArgs = {
  method: number
} & {
  [key in number]: number;
}
const contrastArgs = reactive<ContrastArgs>(
  forLoop(
    CONTRAST_METHODS,
    (prev, _, i) => ((prev[i] = 1), prev),
    { method: 0 } as ContrastArgs
  ));
const contrastCoeffMax = computed(() => {
  return contrastArgs.method ? GAMMA_MAX : MULTIPLICATION_MAX;
});

const handleMethodChanged = (idx: number) => {
  contrastArgs.method = idx!;
  pltState.setIsAdjustingPlt_('reset');
  updateContrastDisplay();
};

function updateContrastDisplay() {
  pltState.adjustContrast_(
    contrastArgs.method,
    contrastArgs[contrastArgs.method]
  );
}

const contrastBtnEvent = (state: 'start' | 'reset') => {
  pltState.setIsAdjustingPlt_(state);
  contrastArgs[contrastArgs.method] = 1;
  updateContrastDisplay();
};
</script>
