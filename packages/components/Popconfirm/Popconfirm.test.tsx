import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PopConfirm from "./Popconfirm.vue";
import type { PopconfirmProps } from "./types";
import { each, get } from "lodash-es";

describe("Popconfirm.vue", () => {
  const props = {
    title: "Test Title",
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    confirmButtonType: "primary",
    cancelButtonType: "info",
    icon: "check-circle",
    iconColor: "green",
    hideIcon: false,
    hideAfter: 500,
    width: 200,
  } as PopconfirmProps;

  it("should accept all props", () => {
    const wrapper = mount(PopConfirm, {
      props,
    });

    each(props, (value, key) => {
      expect(get(wrapper.props(), key)).toBe(value);
    });
  });

  it("should render slot content correctly", () => {
    const slotContent = "Slot Content";
    const wrapper = mount(PopConfirm, {
      props,
      slots: {
        default: slotContent,
      },
    });

    expect(wrapper.text()).toContain(slotContent);
  });
});
