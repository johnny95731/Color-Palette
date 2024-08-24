<template>
  <div
    ref="container"
    :class="[
      $style.cardContainer,
      cardIdx === 0 && $style.first,
      cardIdx === pltState.numOfCards-1 && $style.last,
    ]"
    :style="style"
    @transitionend="$emit('transitionend')"
  >
    <ToolBar
      :cardIdx="cardIdx"
      :card="card"
      :fgFilter="fgFilter"
      :isSmall="media.isSmall"
      @remove="$emit('remove')"
      @dragging="$emit('dragging', $event)"
    />
    <div
      :class="$style.textDisplay"
      :style="fgFilter"
    >
      <div
        :class="$style.hexText"
        @click="copyText(card.hex.slice(1))"
      >
        <TheIcon
          type="copy"
        />
        <TheBtn
          ref="hexTextRef"
          class="ripple ripple-focus"
          :text="card.hex"
        />
      </div>
      <div
        :class="$style.detailText"

        @click="copyText(detail)"
      >
        <TheIcon
          type="copy"
        />
        <TheBtn
          class="ripple ripple-focus"
          :text="detail"
        />
      </div>
    </div>
    <EditingDialog
      :cardIdx="cardIdx"
      :card="card"
      :detail="detail"
      :colorSpace="pltState.colorSpace"
      :roundedColor="roundedColor"
      :pos="editingDialogPos"
      v-model:show="showEditor"
      @tabOffDialog="hexTextRef?.focus()"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import $style from './TheCard.module.scss';
// Components
import TheBtn from '@/components/Custom/TheBtn.vue';
import TheIcon from '../TheIcon.vue';
import ToolBar from './ToolBar.vue';
import EditingDialog from './EditingDialog.vue';
// Utils
import { round } from '@/utils/helpers';
import { rgb2gray, namedColors } from '@/utils/colors';
import { copyText } from '@/utils/eventHandler';
// Stores
import usePltStore from '@/features/stores/usePltStore';
import media from '@/features/useMedia';
// Types
import type { CSSProperties } from 'vue';
import type { CardType } from '@/features/types/pltType';

const container = ref<HTMLElement>();
const hexTextRef = ref<HTMLButtonElement>();

type Props = {
  cardIdx: number;
  card: CardType;
  cardDisplay: {
    size: string
    position: string;
  }
  styleInSettings: CSSProperties
};
const props = defineProps<Props>();

defineEmits<{
  (e: 'transitionend'): void,
  (e: 'remove'): void,
  (e: 'dragging', val: MouseEvent | TouchEvent): void
}>();

const pltState = usePltStore();

const isLight = computed(() => {
  const { inverter } = pltState.spaceInfos;
  const rgb = inverter(props.card.color);
  return rgb2gray(rgb) > 127;
});
const roundedColor = computed(() => {
  return props.card.color.map((val) => Math.round(val));
});
const fgFilter = computed<CSSProperties>(() => {
  return {
    filter: isLight.value ? undefined : 'invert(1)',
  };
});

const showEditor = computed({
  get() {
    return pltState.editingIdx === props.cardIdx;
  },
  set() {
    pltState.setEditingIdx(props.cardIdx);
  }
});

const detail = computed(() => {
  return pltState.colorSpace === 'name' ?
    namedColors.fullNames[namedColors.getClosestIdx(props.card.color)] :
    `${pltState.colorSpace}(${roundedColor.value.toString()})`;
});

// states for dealing transition.
const cardStyle = reactive<{
  size: string,
  position: string,
}>({ ...props.cardDisplay });
function setSize(newVal: string) { Object.assign(cardStyle, { size: newVal }); }
function setPos(newVal: string) { Object.assign(cardStyle, { position: newVal }); }

const transProperty = ref<'none' | ''>('');
function setTransProperty(newVal: 'none' | 'reset') {
  if (newVal === 'none') {
    transProperty.value = 'none';
  } else {
    transProperty.value = '';
  }
}

defineExpose({
  setSize,
  setPos,
  setTransProperty,
});

watch(() => pltState.numOfCards, () => {
  Object.assign(cardStyle, props.cardDisplay);
});

const style = computed<CSSProperties>(function() {
  return {
    ...props.styleInSettings,
    backgroundColor: props.card.hex,
    [media.isSmall ? 'height' : 'width']: cardStyle.size,
    [media.pos]: cardStyle.position,
    transitionProperty: transProperty.value,
  };
});

const editingDialogPos = ref<InstanceType<typeof EditingDialog>['pos']>(
  { [media.pos]: '50%' } as InstanceType<typeof EditingDialog>['pos']
);

watch(showEditor, () => {
  const rect = container.value?.getBoundingClientRect();
  if (!rect) return;
  editingDialogPos.value = {
    [media.pos]: `${
      round(rect.left + rect.width / 2, 0)
    }px`
  } as InstanceType<typeof EditingDialog>['pos'];
});
</script>
