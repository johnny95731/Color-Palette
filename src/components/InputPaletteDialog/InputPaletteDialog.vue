<template>
  <OverlayContainer
    :content-class="$style.settingDialog"
    role="dialog"
    :eager="true"
    transition="slide-y"
    transparent
    v-model="isShowing"
  >
    <header
      :class="$style.header"
    >
      <h2>輸入調色盤</h2>
      <VBtn
        icon="x-lg"
        aria-label="close"
        @click="isShowing = false"
      />
    </header>
    <div
      :class="$style.content"
    >
      <div
        ref="contentRef"
        :class="$style.palette"
      >
        <div
          v-for="(hex, i) in colors"
          :key="i"
          :class="$style.color"
          :style="i === draggingIdx && divPosition"
        >
          <VBtn
            icon="list"
            @pointerdown="startDragging($event)"
          />
          <label
            :for="`color${i+1}`"
            :style="{background: hex, color: hex}"
          >{{ `color${i+1}` }}</label>
          <input
            :id="`color${i+1}`"
            maxlength="7"
            size="7"
            :value="hex"
            @input="hexTextEdited($event)"
            @change="handleHexEditingFinished($event, i)"
            @keydown="handlePaste($event, i)"
          >
          <VBtn
            v-if="colors.length > 2"
            icon="x-lg"
            aria-label="移除"
            @click="deleteColor(i)"
          />
          <VIcon
            v-if="i !==draggingIdx && i === finalIdx"
            type="arrow-left"
          />
        </div>
      </div>
      <div
        v-once
        class="spacer"
      />
      <div
        :class="$style.buttons"
      >
        <VBtn
          style="align-self: center;"
          prepend-icon="plus"
          text="新增"
          :disabled="colors.length === MAX_NUM_OF_CARDS"
          @click="addColor"
        />
        <div
          v-once
          class="spacer"
        />
        <label
          v-once
        >
          <input
            type="checkbox"
            name="preview"
            v-model="isPreview"
          >
          預覽
        </label>
        <VBtn
          v-once
          text="確定"
          @click="comfirm"
        />
      </div>
    </div>
  </OverlayContainer>
</template>

<script setup lang="ts">
import { ref, unref, watch } from 'vue';
import $style from './InputPaletteDialog.module.scss';
import OverlayContainer from '@/components/Custom/OverlayContainer.vue';
import VBtn from '../Custom/VBtn.vue';
import VIcon from '../Custom/VIcon.vue';
// utils
import { invertBoolean, isNullish, map } from '@/utils/helpers';
import { clip } from '@/utils/numeric';
import { ctrlOnly, hexTextEdited, pasteText } from '@/utils/browser';
import { useDragableElement } from '@/composables/useDragableElement';
import { MAX_NUM_OF_CARDS } from '@/constants/pltStore';
// store
import usePltStore from '@/features/usePltStore';
import { isValidHex, randRgbGen, rgb2hex } from '@/utils/colors';
// type
import type { CSSProperties } from 'vue';
import type { Position } from '@vueuse/core';

const isShowing = defineModel<boolean>(); // Show/Hide
const isPreview = ref<boolean>(true);

const pltState = usePltStore();

const original = ref<string[]>([]);
const colors = ref<string[]>([]);


// Dragging
const contentRef = ref<HTMLDivElement>();
const divPosition = ref<CSSProperties>({ top: 0, zIndex: 1 });
const draggingIdx = ref<number | null>(null);
const finalIdx = ref<number | null>(null);

const { start: startDragging } = (() => {
  let initPos: number | null = null;
  let divHeight: number | null = null; // in percentage

  const getIdx = (pos: Position) => {
    return clip(Math.floor(pos.y / 100 * colors.value.length), 0, colors.value.length - 1);
  };

  const setPosition = (pos: Position) => {
    if (!isNullish(initPos))
      divPosition.value.top = `${pos.y - initPos}%`;
  };

  const onStart = (pos: Position) => {
    draggingIdx.value = getIdx(pos);
    divHeight = 100 / colors.value.length;
    initPos = divHeight * (draggingIdx.value + 0.5);
    setPosition(pos);
  };
  const onMove = (pos: Position) => {
    if (isNullish(draggingIdx) || isNullish(initPos)) return;
    setPosition(pos);
    finalIdx.value = getIdx(pos);
  };
  const onEnd = () => {
    if (isNullish(draggingIdx)) return;
    if (draggingIdx.value !== finalIdx.value && !isNullish(finalIdx.value)) {
      const color = colors.value.splice(draggingIdx.value!, 1)[0];
      colors.value.splice(finalIdx.value!, 0, color);
    }
    draggingIdx.value = null;
    finalIdx.value = null;
    divPosition.value.top = 0;
  };
  return useDragableElement(contentRef, {
    containerElement: contentRef,
    binding: false,
    onStart,
    onMove,
    onEnd,
  });
})();


/**
 * Preview the palette (will restore when dialog is closed).
 */
const preview = () => {
  pltState.setPlt_(
    unref(isPreview) ? unref(colors) : unref(original)
  );
};

/** Overwrite current palette and close. (will not restore when dialog is closed) */
const comfirm = () => {
  pltState.setPlt_(unref(colors));
  // Overwrite `originalPalette`. Because close dialog will restore palette from
  // `originalPalette`.
  saveOrininal();
  invertBoolean(isShowing);
};
/**
 * Save original palette.
 * To restore palette when close dialog.
 */
const saveOrininal = () => {
  original.value = map(pltState.cards_, card => card.hex_);
};

watch(() => [unref(isPreview), unref(colors)], preview, { deep: true });
watch(isShowing, (newVal) => {
  if (newVal) {
    colors.value = map(pltState.cards_, card => card.hex_);
    saveOrininal();
    preview();
  } else
    pltState.setPlt_(unref(original)); // restore palette from `originalPalette`
}, { immediate: true });

/**
 * Finish Hex editing when input is blurred or press 'Enter'
 */
const handleHexEditingFinished = function(e: Event, idx: number) {
  const text = (e.currentTarget as HTMLInputElement).value;
  if (text !== colors.value[idx] && isValidHex(text)) {
    colors.value[idx] = text;
  }
};


// Append and delete
const addColor = () => {
  colors.value.push(rgb2hex(randRgbGen()));
};
const deleteColor = (idx: number) => {
  colors.value.splice(idx, 1);
};

const handlePaste = async (e: KeyboardEvent, idx: number) => {
  if (ctrlOnly(e) && e.key.toLowerCase() === 'v') {
    const text = await pasteText();
    if (text) {
      const palette: string[] = [];
      for (const str of text.split('-'))
        if (isValidHex(str)) palette.push(str.startsWith('#') ? str : '#' + str);
      do {
        colors.value.splice(idx++, 1, palette.shift()!);
      } while (idx < MAX_NUM_OF_CARDS && palette.length);
      if (idx < colors.value.length) {
        colors.value.splice(idx, colors.value.length - idx);
      }
    }
  }
};
</script>
