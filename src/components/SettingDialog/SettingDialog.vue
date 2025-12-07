<template>
  <VDialog
    ref="dialogRef"
    :overlayProps="{
      contentClass: $style.settingDialog
    }"
    title="設定"
    :tabs="tabLabels"
    v-model="isOpened"
    v-model:tab-idx="tabIdx"
  >
    <template v-if="tabIdx === 0">
      <div
        :class="$style.region"
        aria-label="調色盤"
      >
        <label
          v-once
          id="color-syntax"
        >顯示</label>
        <SelectMenu
          v-memo="[settingsState.paletteDisplay]"
          v-model="settingsState.paletteDisplay"
          label="#color-syntax"
          :items="PALETTE_DISPLAY"
          letter-case="start"
        />
        <label
          v-once
          id="color-syntax"
        >色彩語法</label>
        <SelectMenu
          v-memo="[settingsState.colorSyntax]"
          v-model="settingsState.colorSyntax"
          label="#color-syntax"
          :items="COLOR_SYNTAX"
          letter-case="start"
        />
        <span
          v-once
          id="auto-sort"
        >自動排序</span>
        <VSwitch
          label="#auto-sort"
          v-model="settingsState.autoSort"
        />
      </div>
    </template>
    <template v-else-if="tabIdx === 1">
      <div
        :class="$style.region"
        aria-labelledby="title-border"
      >
        <h3
          v-once
          id="title-border"
        >
          邊界(Border)
        </h3>
        <span v-once>顯示</span>
        <VSwitch
          label="show border"
          :model-value="settingsState.border.show"
          @update:model-value="settingsState.setBorder_('show', $event)"
        />
        <template v-if="settingsState.border.show">
          <label
            v-once
            id="border-width"
          >寬度(px)</label>
          <VSlider
            v-memo="[settingsState.border.width]"
            label="#border-width"
            :max="BORDER_MAX_WIDTH"
            :model-value="settingsState.border.width"
            @update:model-value="settingsState.setBorder_('width', $event)"
          />
          <label
            v-once
            id="border-color"
          >顏色</label>
          <SelectMenu
            v-memo="[settingsState.border.color]"
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
        <h3
          v-once
          id="title-transition"
        >
          轉場(Transition)
        </h3>
        <label
          v-once
          id="transition-position"
        >Position(ms)</label>
        <VSlider
          label="#transition-position"
          :max="TRANSITION_MAX_POS"
          step="50"
          :model-value="settingsState.transition.pos"
          @update:model-value="handleTransitionChanged($event!, 'pos')"
        />
        <label
          v-once
          id="transition-color"
        >Color(ms)</label>
        <VSlider
          v-memo="[transition.color_]"
          label="#transition-color"
          :max="TRANSITION_MAX_COLOR"
          step="50"
          :model-value="transition.color_"
          @update:model-value="handleTransitionChanged($event!, 'color')"
          @keydown="handleFocusoutDialog"
        />
      </div>
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

import useSettingStore, {
  BORDER_COLOR, BORDER_MAX_WIDTH, COLOR_SYNTAX, PALETTE_DISPLAY,
  TRANSITION_MAX_COLOR, TRANSITION_MAX_POS,
} from '@/stores/useSettingStore';
import { isTabKey } from '@/utils/browser';

import $style from './SettingDialog.module.scss';
import SelectMenu from '../Custom/SelectMenu.vue';
import VDialog from '../Custom/VDialog.vue';
import VSlider from '../Custom/VSlider.vue';
import VSwitch from '../Custom/VSwitch.vue';

import type { TransitionStyle } from '@/stores/useSettingStore';


const isOpened = defineModel<boolean>(); // Show/Hide

const dialogRef = ref<InstanceType<typeof VDialog>>();

const handleFocusoutDialog = (e: KeyboardEvent) => {
  if (isTabKey(e)) {
    e.preventDefault();
    isOpened.value = false;
  }
};

const tabLabels = [
  '展示', '卡片',
];
const tabIdx = ref<number>(0);

const settingsState = useSettingStore();

// page 1: Card
// -Transition states
const transition = reactive<{
  pos_: number
  color_: number
}>({
  pos_: settingsState.transition.pos,
  color_: settingsState.transition.color,
});

const handleTransitionChanged = (
  val: number, attr: keyof TransitionStyle,
) => {
  if (attr === 'pos') transition.pos_ = val;
  else transition.color_ = val;
  settingsState.setTransition_(attr, val);
};

// Update storage
watch(settingsState.$state, settingsState.updateStorage_, { deep: true });
</script>
