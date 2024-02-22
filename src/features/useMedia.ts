import {ref} from 'vue';
import type {MediaContextType} from './types/mediaType.ts';

/**
 * Device is small if device width <= (maxSmallSize)px.
 */
const maxSmallSize = Number( // Get var(--smallSize) in css.
    getComputedStyle(document.documentElement)
        .getPropertyValue('--small-view')
        .slice(0, -2),
);

const initialState: MediaContextType = {
  windowSize: [1, 1],
  headerHeight: 0,
  isSmall: true,
  pos: 'left',
  clientPos: 'clientX',
  bound: [0, 1],
};

const mediaContent = ref<MediaContextType>(initialState);

const body = document.body;
export const handleWindowResize = () => {
  const windowSize: [number, number] = [body.clientHeight, body.clientWidth];
  const isSmall = windowSize[1] <= maxSmallSize;
  const headerHeight = Number( // Get var(--headerHeight) in css.
      getComputedStyle(document.documentElement)
          .getPropertyValue('--headerHeight')
          .slice(0, -2),
  );
  mediaContent.value = {
    windowSize,
    headerHeight,
    isSmall,
    pos: isSmall ? 'top' : 'left',
    clientPos: isSmall ? 'clientY' : 'clientX',
    bound: isSmall ? [headerHeight, windowSize[0]] : [0, windowSize[1]],
  };
};
window.addEventListener('resize', handleWindowResize);
handleWindowResize();
export default mediaContent;
