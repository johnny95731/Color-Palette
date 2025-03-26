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
          v-memo="[settingsState.paletteDisplay_]"
          v-model="settingsState.paletteDisplay_"
          label="#color-syntax"
          :items="PALETTE_DISPLAY"
          letter-case="start"
        />
        <label
          v-once
          id="color-syntax"
        >色彩語法</label>
        <SelectMenu
          v-memo="[settingsState.colorSyntax_]"
          v-model="settingsState.colorSyntax_"
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
          hide-label
          v-model="settingsState.autoSort_"
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
          hide-label
          :model-value="settingsState.border_.show_"
          @update:model-value="settingsState.setBorder_('show', $event)"
        />
        <template v-if="settingsState.border_.show_">
          <label
            v-once
            id="border-width"
          >寬度(px)</label>
          <VSlider
            v-memo="[settingsState.border_.width_]"
            label="#border-width"
            :max="BORDER_MAX_WIDTH"
            :model-value="settingsState.border_.width_"
            @update:model-value="settingsState.setBorder_('width', $event)"
          />
          <label
            v-once
            id="border-color"
          >顏色</label>
          <SelectMenu
            v-memo="[settingsState.border_.color_]"
            label="#border-color"
            :items="BORDER_COLOR"
            letter-case="start"
            :model-value="settingsState.border_.color_"
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
          :model-value="settingsState.transition_.pos_"
          @update:model-value="handleTransitionChanged($event, 'pos')"
        />
        <label
          v-once
          id="transition-color"
        >Color(ms)</label>
        <VSlider
          v-memo="[transition.color]"
          label="#transition-color"
          :max="TRANSITION_MAX_COLOR"
          step="50"
          :model-value="transition.color"
          @update:model-value="handleTransitionChanged($event, 'color')"
          @keydown="handleFocusoutDialog"
        />
      </div>
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import $style from './SettingDialog.module.scss';
import SelectMenu from '../Custom/SelectMenu.vue';
import VSwitch from '../Custom/VSwitch.vue';
import VSlider from '../Custom/VSlider.vue';
import VDialog from '../Custom/VDialog.vue';
import { isTabKey } from '@/utils/browser';
// stores
import useSettingStore, { BORDER_COLOR, BORDER_MAX_WIDTH, COLOR_SYNTAX, PALETTE_DISPLAY, TRANSITION_MAX_COLOR, TRANSITION_MAX_POS } from '@/stores/useSettingStore';
// types
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
  '展示', '卡片'
];
const tabIdx = ref<number>(0);

const settingsState = useSettingStore();

// page 1: Card
// -Transition states
const transition = reactive<{
  pos: number,
  color: number,
}>({
  pos: settingsState.transition_.pos_,
  color: settingsState.transition_.color_,
});

const handleTransitionChanged = (
  val: number, attr: keyof TransitionStyle,
) => {
  if (attr === 'pos') transition.pos = val;
  else transition.color = val;
  settingsState.setTransition_(attr, val);
};

// Update storage
watch(settingsState.$state, settingsState.updateStorage_, { deep: true });
</script>
