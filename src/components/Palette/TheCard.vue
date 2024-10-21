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
      :isSmall="media.isSmall"
      @remove="$emit('remove')"
      @dragging="$emit('dragging', $event)"
    />
    <div
      :class="$style.textDisplay"
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
      v-model="roundedColor"
      v-model:show="showEditor"
      @tabOffDialog="hexTextRef?.$el.focus();"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { asyncComputed, toValue } from '@vueuse/core';
import $style from './TheCard.module.scss';
// Components
import TheBtn from '@/components/Custom/TheBtn.vue';
import TheIcon from '../Custom/TheIcon.vue';
import ToolBar from './ToolBar.vue';
import EditingDialog from './EditingDialog.vue';
// Utils
import { round } from '@/utils/numeric';
import { rgb2gray, getClosestNamed, hex2rgb, unzipCssNamed } from '@/utils/colors';
import { copyText } from '@/utils/browser';
import { useElementBounding } from '@/composables/useElementBounding';
// Stores
import usePltStore from '@/features/stores/usePltStore';
import media from '@/composables/useMedia';
// Types
import type { CSSProperties } from 'vue';
import type { CardType } from '@/features/types/pltStore';

const container = ref<HTMLElement>();
const hexTextRef = ref<InstanceType<typeof TheBtn>>();

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
  (e: 'dragging', val: PointerEvent): void
}>();

const pltState = usePltStore();

const isLight = computed(() => rgb2gray(hex2rgb(props.card.hex)) > 127);

const roundedColor = computed({
  get() {
    return props.card.color.map((val) => round(val));
  },
  set(newColorArr: number[]) {
    pltState.editCard(props.cardIdx, newColorArr);
  }
});

const showEditor = computed({
  get() {
    return pltState.editingIdx === props.cardIdx;
  },
  set() {
    pltState.setEditingIdx(props.cardIdx);
  }
});

const closestNamed = asyncComputed<string | undefined>(
  () => pltState.colorSpace === 'name' ?
    getClosestNamed(props.card.color) :
    undefined,
  'white'
);
const detail = computed(() => {
  return pltState.colorSpace === 'name' ?
    unzipCssNamed(closestNamed.value as string) :
    `${pltState.colorSpace}(${toValue(roundedColor).toString()})`;
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

watch(() => pltState.numOfCards, () =>
  Object.assign(cardStyle, props.cardDisplay)
);

const style = computed<CSSProperties>(function() {
  return {
    ...props.styleInSettings,
    color: toValue(isLight) ? '#000' : '#fff',
    backgroundColor: props.card.hex,
    [media.isSmall ? 'height' : 'width']: cardStyle.size,
    [media.pos]: cardStyle.position,
    transitionProperty: toValue(transProperty),
  };
});

const { rect } = useElementBounding(container, { filter: ['left', 'width'] });
const editingDialogPos = computed<InstanceType<typeof EditingDialog>['pos']>(
  () => `${round(rect.left + rect.width / 2, 2)}px`
);
</script>
