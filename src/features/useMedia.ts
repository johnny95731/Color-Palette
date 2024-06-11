import { reactive } from 'vue';
import type { MediaContextType } from './types/mediaType.ts';

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

const media = reactive<MediaContextType>(initialState);

const body = document.body;
const handleWindowResize = () => {
  const windowSize: [number, number] = [body.offsetHeight, body.clientWidth];
  const isSmall = windowSize[1] <= maxSmallSize;
  const headerHeight = Number( // Get var(--header-height) in css.
    getComputedStyle(document.documentElement)
      .getPropertyValue('--header-height')
      .slice(0, -2),
  );
  // Mobile browser 100vh including toolbar.
  // window.innerHeight did not include toolbar.
  document.documentElement.style
    .setProperty('--app-height', `${window.innerHeight}px`);
  // update
  Object.assign(media, {
    windowSize,
    headerHeight,
    isSmall,
    pos: isSmall ? 'top' : 'left',
    clientPos: isSmall ? 'clientY' : 'clientX',
    bound: isSmall ? [headerHeight, windowSize[0]] : [0, windowSize[1]],
  });
};
window.addEventListener('resize', handleWindowResize);
handleWindowResize();
export default media;
