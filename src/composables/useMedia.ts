import { shallowReactive } from 'vue';

import { getPropertyValue } from '@/utils/browser';


type MediaContext = {
  /**
   * The device is small (width <= 900px) or not.
   */
  isSmall_: boolean
  /**
   * Card pos along flow direction. For getting data from event.
   */
  cardPos_: 'left' | 'top'
  /**
   * Main axis of card.
   */
  cardSize_: 'width' | 'height'
};

/**
 * Device is small if device width <= (maxSmallSize)px.
 */
const maxSmallSize = getPropertyValue('--small-view');

const initialState: MediaContext = {
  isSmall_: true,
  cardPos_: 'left',
  cardSize_: 'width',
};

const media = shallowReactive<MediaContext>(initialState);
const handleWindowResize = () => {
  const isSmall_ = document.body.offsetWidth <= maxSmallSize;
  // Mobile browser 100vh including toolbar.
  // window.innerHeight did not include toolbar.
  document.documentElement.style
    .setProperty('--app-height', `${window.innerHeight}px`);
  // update
  Object.assign(media, {
    isSmall_,
    cardPos_: isSmall_ ? 'top' : 'left',
    cardSize_: isSmall_ ? 'height' : 'width',
  } satisfies MediaContext);
};

addEventListener('resize', handleWindowResize, { capture: true });
handleWindowResize();
export default media;
