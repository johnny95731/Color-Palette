import VIcon from '@/components/Custom/VIcon.vue';
import { expect, test } from 'vitest';
import { mount } from '@vue/test-utils';

test('type', () => {
  const icon = mount(VIcon, {
    props: {
      icon: 'test'
    }
  });
  expect(icon.classes()).toContain('bi-test');
});
