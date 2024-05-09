## 本期内容

- 补充 nvm (v18.17.0)
<!-- - eslint + prettier + husky (后续以文档或视频的形式补充 弹幕投票) -->
- 需求分析
- 初始化 vitest
- 书写测试用例
- 书写 Button 组件 (type,size,disabled,plain,round,circle,nativeType,tag)


### 大模型工具推荐

- ChatGPT
- Poe

> 下面两个不用科学上网
- Chandler
- Kimi **

### 需求分析 提示词

三板斧 “身份定位，前提条件，输出限定”

```md
# 身份定位
- **角色**：互联网产品经理
- **目标**：产品需求分析和功能点设计

# 需求
以"[XXX]"形式定义变量用于对话中不同任务的触发指令
以"/help" 为触发关键词，列出所有定义的变量`**XXX**`以及代表的任务

对话过程用中文交流，专业术语可用英文或缩写。

- [XQFX]:(需求分析) 根据给出的内容输出需求分析文档（md）
- [GNSJ]:(功能设计) 以上文中的 "需求分析文档" 为依据

# 背景

（项目文档地址：https://ericwxy.github.io/eric-ui/components/button.html ）

首次可补充提问来完善背景

# 输出规范
- **需求分析**[XQFX]
  - **格式**：用户调研摘要、竞品对比报告、市场趋势分析。
  - **内容**：用户痛点、期望功能、安全性需求。
- **功能点设计**[GNSJ]
  - **格式**：功能描述、api 设计、交互关系。
  - **内容**：功能实现细节、用户操作流程、异常处理。
# 示例指令
- **需求分析**：[XQFX]组件库按钮组件。
- **功能点设计**：[GNSJ]

请在后续对话中使用上述结构和示例指令来指导任务执行。
```

### vitest config

```typescript
// vitest.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    globals: true,
    environment: 'jsdom'
  }
})

// "test": "vitest --coverage"
```

```tsx
import { describe, test, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

import Icon from "../Icon/Icon.vue";
import Button from "./Button.vue";
import ButtonGroup from "./ButtonGroup.vue";

describe("Button.vue", () => {
  const onClick = vi.fn();
  test("basic button", async () => {
    const wrapper = mount(() => (
      <Button type="primary" {...{ onClick }}>
        button content
      </Button>
    ));

    // class
    expect(wrapper.classes()).toContain("er-button--primary");

    // slot
    expect(wrapper.get("button").text()).toBe("button content");

    // events
    await wrapper.get("button").trigger("click");
    expect(onClick).toHaveBeenCalledOnce();
  });

  test("disabled button", async () => {
    const wrapper = mount(() => (
      <Button disabled {...{ onClick }}>
        disabled button
      </Button>
    ));

    // class
    expect(wrapper.classes()).toContain("is-disabled");

    // attrs
    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.find("button").element.disabled).toBeTruthy();

    // events
    await wrapper.get("button").trigger("click");
    expect(onClick).toHaveBeenCalledOnce();
    expect(wrapper.emitted("click")).toBeUndefined();
  });

  test("loading button", () => {
    const wrapper = mount(Button, {
      props: {
        loading: true,
      },
      slots: {
        default: "loading button",
      },
      global: {
        stubs: ["ErIcon"],
      },
    });

    // class
    expect(wrapper.classes()).toContain("is-loading");

    // attrs
    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.find("button").element.disabled).toBeTruthy();

    // events
    wrapper.get("button").trigger("click");
    expect(wrapper.emitted()).not.toHaveProperty("click");

    // icon
    const iconElement = wrapper.findComponent(Icon);
    expect(iconElement.exists()).toBeTruthy();
    expect(iconElement.attributes("icon")).toBe("spinner");
  });

  test("icon button", () => {
    const wrapper = mount(Button, {
      props: {
        icon: "arrow-up",
      },
      slots: {
        default: "icon button",
      },
      global: {
        stubs: ["ErIcon"],
      },
    });

    const iconElement = wrapper.findComponent(Icon);
    expect(iconElement.exists()).toBeTruthy();
    expect(iconElement.attributes("icon")).toBe("arrow-up");
  });

  // Props: type
  it("should has the correct type class when type prop is set", () => {
    const types = ["primary", "success", "warning", "danger", "info"];
    types.forEach((type) => {
      const wrapper = mount(Button, {
        props: { type: type as any },
      });
      expect(wrapper.classes()).toContain(`er-button--${type}`);
    });
  });

  // Props: size
  it("should has the correct size class when size prop is set", () => {
    const sizes = ["large", "default", "small"];
    sizes.forEach((size) => {
      const wrapper = mount(Button, {
        props: { size: size as any },
      });
      expect(wrapper.classes()).toContain(`er-button--${size}`);
    });
  });

  // Props: plain, round, circle
  it.each([
    ["plain", "is-plain"],
    ["round", "is-round"],
    ["circle", "is-circle"],
    ["disabled", "is-disabled"],
    ["loading", "is-loading"],
  ])(
    "should has the correct class when prop %s is set to true",
    (prop, className) => {
      const wrapper = mount(Button, {
        props: { [prop]: true },
        global: {
          stubs: ["ErIcon"],
        },
      });
      expect(wrapper.classes()).toContain(className);
    }
  );

  it("should has the correct native type attribute when native-type prop is set", () => {
    const wrapper = mount(Button, {
      props: { nativeType: "submit" },
    });
    expect(wrapper.element.tagName).toBe("BUTTON");
    expect((wrapper.element as any).type).toBe("submit");
  });

  // Test the click event with and without throttle
  it.each([
    ["withoutThrottle", false],
    ["withThrottle", true],
  ])("emits click event %s", async (_, useThrottle) => {
    const clickSpy = vi.fn();
    const wrapper = mount(() => (
      <Button
        onClick={clickSpy}
        {...{
          useThrottle,
          throttleDuration: 400,
        }}
      />
    ));

    await wrapper.get("button").trigger("click");
    expect(clickSpy).toHaveBeenCalled();
  });

  // Props: tag
  it("should renders the custom tag when tag prop is set", () => {
    const wrapper = mount(Button, {
      props: { tag: "a" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("a");
  });

  // Events: click
  it("should emits a click event when the button is clicked", async () => {
    const wrapper = mount(Button, {});
    await wrapper.trigger("click");
    expect(wrapper.emitted().click).toHaveLength(1);
  });

  // Exception Handling: loading state
  it("should display loading icon and not emit click event when button is loading", async () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      global: {
        stubs: ["ErIcon"],
      },
    });
    const iconElement = wrapper.findComponent(Icon);

    expect(wrapper.find(".loading-icon").exists()).toBe(true);
    expect(iconElement.exists()).toBeTruthy();
    expect(iconElement.attributes("icon")).toBe("spinner");
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeUndefined();
  });
});

describe("ButtonGroup.vue", () => {
  test("basic button group", async () => {
    const wrapper = mount(() => (
      <ButtonGroup>
        <Button>button 1</Button>
        <Button>button 2</Button>
      </ButtonGroup>
    ));

    expect(wrapper.classes()).toContain("er-button-group");
  });

  test("button group size", () => {
    const sizes = ["large", "default", "small"];
    sizes.forEach((size) => {
      const wrapper = mount(() => (
        <ButtonGroup size={size as any}>
          <Button>button 1</Button>
          <Button>button 2</Button>
        </ButtonGroup>
      ));

      const buttonWrapper = wrapper.findComponent(Button);
      expect(buttonWrapper.classes()).toContain(`er-button--${size}`);
    });
  });

  test("button group type", () => {
    const types = ["primary", "success", "warning", "danger", "info"];
    types.forEach((type) => {
      const wrapper = mount(() => (
        <ButtonGroup type={type as any}>
          <Button>button 1</Button>
          <Button>button 2</Button>
        </ButtonGroup>
      ));

      const buttonWrapper = wrapper.findComponent(Button);
      expect(buttonWrapper.classes()).toContain(`er-button--${type}`);
    });
  });

  test("button group disabled", () => {
    const wrapper = mount(() => (
      <ButtonGroup disabled>
        <Button>button 1</Button>
        <Button>button 2</Button>
      </ButtonGroup>
    ));

    const buttonWrapper = wrapper.findComponent(Button);
    expect(buttonWrapper.classes()).toContain(`is-disabled`);
  });
});

```