import TheIcon from '@/components/Custom/TheIcon.vue';
import { expect, test } from 'vitest';
import { mount } from '@vue/test-utils';

test('type', () => {
  const icon = mount(TheIcon, {
    props: {
      type: 'test'
    }
  });
  expect(icon.classes()).toContain('bi-test');
});
