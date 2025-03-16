import { describe, expect, test } from 'vitest';
import { shallowMount, mount } from '@vue/test-utils';
import VBtn from '@/components/Custom/VBtn.vue';
import type { VueWrapper } from '@vue/test-utils';

const text = 'TestBtn';
const createBtn = <T extends Record<string, unknown>>(
  options?: T,
  shallow: boolean = true
) => {
  return (shallow ? shallowMount : mount)(VBtn, {
    props: {
      text,
    },
    ...options
  });
};

describe('props', () => {
  test('type', async () => {
    for (const buttonType of ['button', 'submit', 'reset'] as const) {
      const btn = shallowMount(VBtn, {
        props: {
          type: buttonType,
          text,
        },
      });
      expect(btn.attributes('type')).toBe(buttonType);
    }
  });

  test('text', () => {
    const btn = createBtn();
    // Has markup
    expect(
      btn.text() ||
      btn.attributes('title') ||
      btn.attributes('aria-label') ||
      btn.attributes('aria-labelledby')
    ).toBeTruthy();
  });

  test('ripple', async () => {
    const btn = createBtn(undefined, false);
    // Without ripple
    await btn.setProps({ ripple: false });
    expect(btn.find('.ripple').exists()).toBeFalsy();
    // With ripple
    await btn.setProps({ ripple: true });
    expect(btn.find('.ripple').exists()).toBeTruthy();
  });

  test('append/prepend slot and prop(icon)', () => {
    const testSlot = async (btn?: VueWrapper<InstanceType<typeof VBtn>>) => {
      const withSlot = createBtn({
        props: {
          ...btn?.props(),
        },
        slots: {
          prepend: '<div id="testPrepend">test prepend</div>',
          append: '<div id="testAppend">test append</div>',
        },
      }, false);
      // Slot has higher priority than prop(prependIcon/appendIcon)
      expect(withSlot.find('.btn__prepend > #testPrepend').text())
        .toBe('test prepend');
      expect(withSlot.find('.btn__append > #testAppend').text())
        .toBe('test append');
      return withSlot;
    };
    // Test slot
    testSlot();
    // Test prop
    const btn = createBtn();
    expect(btn.find('.btn__prepend').exists()).toBeFalsy();
    expect(btn.find('.btn__append').exists()).toBeFalsy();
    const withoutSlot = createBtn({
      props: {
        prependIcon: 'test prepend',
        appendIcon: 'test append',
      }
    });
    expect(withoutSlot.find('.btn__prepend > v-icon-stub').exists()).toBeTruthy();
    expect(withoutSlot.find('.btn__prepend > v-icon-stub').attributes('type'))
      .toBe('test prepend');
    expect(withoutSlot.find('.btn__append > v-icon-stub').exists()).toBeTruthy();
    expect(withoutSlot.find('.btn__append > v-icon-stub').attributes('type'))
      .toBe('test append');
    // Slot has higher priority than prop(prependIcon/appendIcon)
    testSlot(withoutSlot)
      // slot will cover prop content
      .then((withSlot) => {
        expect(withSlot.find('.btn__prepend > v-icon-stub').exists()).toBeFalsy();
        expect(withSlot.find('.btn__append > v-icon-stub').exists()).toBeFalsy();
      });
  });

  test('variant', async () => {
    const btn = createBtn({
      props: { variant: 'flat' }
    }, false);
    expect(btn.find('.btn__overlay').exists()).toBeFalsy();
    await btn.setProps({ variant: 'std' });
    expect(btn.find('.btn__overlay').exists()).toBeTruthy();
  });

  test('icon', async () => {
    const btn = createBtn({
      props: { icon: 'test content' }
    });
    expect(btn.find('.btn--icon').exists()).toBeTruthy();
    // No inner text when `icon` prop is set.
    expect(btn.find('.btn__content').text()).toBeFalsy();
    expect(btn.find('.btn__content v-icon-stub').exists()).toBeTruthy();
    expect(btn.find('.btn__content v-icon-stub').attributes('type'))
      .toBe('test content');
    // Slot has higher than prop (icon and text)
    const withSlot = shallowMount(VBtn, {
      props: {
        ...btn.props(),
      },
      slots: {
        default: '<div id="test">test default</div>',
      }
    });
    expect(withSlot.find('.btn--icon').exists()).toBeTruthy();
    expect(withSlot.find('.btn__content').html())
      .toMatch('<div id="test">test default</div>');
  });
});
