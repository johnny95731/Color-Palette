import { shallowReactive } from 'vue';
import { getPropertyValue } from '@/utils/browser';

type MediaContext = {
  /**
   * The device size, [height, width].
   */
  windowSize_: [number, number];
  /**
   * Height of header.
   */
  headerHeight_: number;
  /**
   * The device is small (width <= 900px) or not.
   */
  isSmall_: boolean;
  /**
   * Card pos along flow direction. For getting data from event.
   */
  pos_: 'left' | 'top';
  /**
   * Cursor pos direction along flow direction. For getting data from event.
   */
  clientPos_: 'clientX' | 'clientY';
  /**
   * For adjusting card position or varifying valid cursor position.
   * Along y-direction if isSmall else x-direction.
   */
  bound_: [number, number];
}

/**
 * Device is small if device width <= (maxSmallSize)px.
 */
const maxSmallSize = getPropertyValue('--small-view');

const initialState: MediaContext = {
  windowSize_: [1, 1],
  headerHeight_: 0,
  isSmall_: true,
  pos_: 'left',
  clientPos_: 'clientX',
  bound_: [0, 1],
};

const media = shallowReactive<MediaContext>(initialState);
const handleWindowResize = () => {
  const windowSize: [number, number] = [
    document.body.offsetHeight,
    document.body.offsetWidth
  ];
  const isSmall = windowSize[1] <= maxSmallSize;
  const headerHeight = getPropertyValue('--header-height');
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

addEventListener('resize', handleWindowResize, { capture: true });
handleWindowResize();
export default media;
