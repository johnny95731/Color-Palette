<template>
  <img
    :src="urls[type]"
    :alt="type"
    class="icon"
    draggable="false"
    @click="onClick ? onClick($event) : $emit('click', $event)"
  >
</template>

<script setup lang='ts'>
import CloseUrl from '@/assets/icons/x-lg.svg?url';
import DelUrl from '@/assets/icons/trash3-fill.svg?url';
import LockUrl from '@/assets/icons/lock-fill.svg?url';
import UnlockUrl from '@/assets/icons/unlock-fill.svg?url';
import FavUrl from '@/assets/icons/star-fill.svg?url';
import UnfavUrl from '@/assets/icons/star.svg?url';
import DrapUrl from '@/assets/icons/arrows.svg?url';
import RefreshUrl from '@/assets/icons/arrow-clockwise.svg?url';
import SliderUrl from '@/assets/icons/sliders.svg?url';
import CopyUrl from '@/assets/icons/copy.svg?url';
import SortUrl from '@/assets/icons/sort-down.svg?url';
import InsertUrl from '@/assets/icons/file-earmark-plus.svg?url';
import AppendtUrl from '@/assets/icons/arrows-expand-vertical.svg?url';
import FavPalleteUrl from '@/assets/icons/bookmark-plus.svg?url';
import UnfavPalleteUrl from '@/assets/icons/bookmark-dash.svg?url';
import BookmarkUrl from '@/assets/icons/bookmarks.svg?url';
import ListUrl from '@/assets/icons/list.svg?url';
import caretUrl from '@/assets/icons/caret-left-fill.svg?url';
import SettingUrl from '@/assets/icons/gear.svg?url';
import PlayUrl from '@/assets/icons/play.svg?url';
import PauseUrl from '@/assets/icons/pause-fill.svg?url';

const urls = {
  close: CloseUrl,
  del: DelUrl,
  lock: LockUrl,
  unlock: UnlockUrl,
  fav: FavUrl,
  unfav: UnfavUrl,
  move: DrapUrl,
  refresh: RefreshUrl,
  edit: SliderUrl,
  copy: CopyUrl,
  sort: SortUrl,
  blend: InsertUrl,
  insert: AppendtUrl,
  favorPallete: FavPalleteUrl,
  unfavorPallete: UnfavPalleteUrl,
  bookmark: BookmarkUrl,
  list: ListUrl,
  caret: caretUrl,
  setting: SettingUrl,
  play: PlayUrl,
  pause: PauseUrl,
} as const;
export type IconType = keyof typeof urls;

type Prop = {
  type: IconType;
  onClick?: (e?: MouseEvent) => any
}

defineProps<Prop>();
defineEmits<{
  (e: 'click', val?: MouseEvent): void
}>();
</script>

<style lang='scss'>
.icon {
  height: 100%;
  cursor: pointer;
}
</style>
