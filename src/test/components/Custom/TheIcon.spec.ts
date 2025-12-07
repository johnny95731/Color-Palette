import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';

import VIcon from '@/components/Custom/VIcon.vue';


test('type', () => {
  const icon = mount(VIcon, {
    props: {
      icon: 'test',
    },
  });
  expect(icon.classes()).toContain('bi-test');
});
