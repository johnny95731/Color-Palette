import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';

import CondWrapper from '@/components/Custom/CondWrapper.vue';


test('isWrap', () => {
  const innerText = '123';
  const wrapper = mount(CondWrapper, {
    slots: {
      default: innerText,
    },
  });
  const wrapper2 = mount(CondWrapper, {
    props: {
      isWrap: false,
    },
    slots: {
      default: innerText,
    },
  });
  expect(wrapper.html()).toBe(`<div>${innerText}</div>`);
  expect(wrapper2.html()).toBe(innerText);
});

test('tag', () => {
  const innerText = '123';
  const tag = 'span';
  const wrapper = mount(CondWrapper, {
    props: {
      tag,
    },
    slots: {
      default: innerText,
    },
  });
  const wrapper2 = mount(CondWrapper, {
    props: {
      tag,
      isWrap: false,
    },
    slots: {
      default: innerText,
    },
  });
  const wrapper3 = mount(CondWrapper, {
    global: {
      components: {
        CondWrapper,
      },
    },
    props: {
      tag: 'CondWrapper',
    },
    slots: {
      default: `<CondWrapper>${innerText}</CondWrapper>`,
    },
  });
  expect(wrapper.html()).toBe(`<${tag}>${innerText}</${tag}>`);
  expect(wrapper2.html()).toBe(innerText);
  expect(wrapper3.html().replace(/\s/g, ''))
    .toBe(`<div><div>${innerText}</div></div>`);
});
