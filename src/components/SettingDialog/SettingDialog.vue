<template>
  <VDialog
    ref="dialogRef"
    :overlayProps="{
      contentClass: $style.settingDialog
    }"
    title="設定"
    v-model="isOpened"
  >
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
        @keydown="handleFocusoutDialog"
      />
    </div>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import $style from './SettingDialog.module.scss';
import SelectMenu from '../Custom/SelectMenu.vue';
import VSwitch from '../Custom/VSwitch.vue';
import VSlider from '../Custom/VSlider.vue';
import VDialog from '../Custom/VDialog.vue';
// stores
import useSettingStore, { BORDER_COLOR, BORDER_MAX_WIDTH, COLOR_FUNCTIONS, TRANSITION_MAX_COLOR, TRANSITION_MAX_POS } from '@/stores/useSettingStore';
// types
import type { TransitionStyle } from '@/stores/useSettingStore';
import { isTabKey } from '@/utils/browser';

const isOpened = defineModel<boolean>(); // Show/Hide

const dialogRef = ref<InstanceType<typeof VDialog>>();

const settingsState = useSettingStore();


const handleFocusoutDialog = (e: KeyboardEvent) => {
  if (isTabKey(e)) {
    e.preventDefault();
    isOpened.value = false;
  }
};

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
</script>
