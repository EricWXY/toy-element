<script setup lang="ts">
import type {
  SelectProps,
  SelectEmits,
  SelectContext,
  SelectInstance,
  SelectStates,
  SelectOptionProps,
} from "./types";
import type { TooltipInstance } from "../Tooltip/types";
import type { InputInstance } from "../Input/types";

import {
  computed,
  ref,
  reactive,
  provide,
  watch,
  nextTick,
  type VNode,
} from "vue";
import { useId, useFocusController, useClickOutside } from "@toy-element/hooks";
import { POPPER_OPTIONS, SELECT_CTX_KEY } from "./constants";
import { each, eq, filter, find, get, size, noop, isFunction } from "lodash-es";

import ErOption from "./Option.vue";
import ErTooltip from "../Tooltip/Tooltip.vue";
import ErInput from "../Input/Input.vue";
import ErIcon from "../Icon/Icon.vue";

defineOptions({ name: "ErSelect" });

const props = withDefaults(defineProps<SelectProps>(), {
  options: () => [],
});
const emits = defineEmits<SelectEmits>();
const slots = defineSlots();

const selectRef = ref<HTMLElement>();
const tooltipRef = ref<TooltipInstance>();
const inputRef = ref<InputInstance>();

const isDropdownVisible = ref(false);

const initialOption = findOption(props.modelValue);

const selectStates = reactive<SelectStates>({
  inputValue: initialOption?.label ?? "",
  selectedOption: initialOption,
  mouseHover: false,
  loading: false,
  highlightedIndex: -1,
});

const isDisabled = computed(() => props.disabled);
const children = computed(() =>
  filter(slots?.default?.(), (child) => eq(child.type, ErOption))
);
const hasChildren = computed(() => size(children.value) > 0);
const showClear = computed(
  () =>
    props.clearable && selectStates.mouseHover && selectStates.inputValue !== ""
);

const highlightedLine = computed(() => {
  let result: SelectOptionProps | void;
  if (hasChildren.value) {
    const node = children.value[selectStates.highlightedIndex];
    result = node?.props?.value;
  } else {
    result = props.options[selectStates.highlightedIndex];
  }

  return result;
});

const inputId = useId().value;
const {
  wrapperRef: inputWrapperRef,
  isFocused,
  handleBlur,
  handleFocus,
} = useFocusController(inputRef);

useClickOutside(selectRef, (e) => handleClickOutside(e));
const focus: SelectInstance["focus"] = function () {
  inputRef.value?.focus();
};

const blur: SelectInstance["blur"] = function () {
  handleClickOutside();
};

function handleClickOutside(e?: Event) {
  if (isFocused.value) {
    nextTick(() => handleBlur(new FocusEvent("focus", e)));
  }
}

function controlVisible(visible: boolean) {
  if (!tooltipRef.value) return;
  get(tooltipRef, ["value", visible ? "show" : "hide"])?.();
  isDropdownVisible.value = visible;
  emits("visible-change", visible);

  selectStates.highlightedIndex = -1;
}

function toggleVisible() {
  if (isDisabled.value) return;
  console.log("toggleVisible");
  controlVisible(!isDropdownVisible.value);
}

function handleClear() {
  inputRef.value?.clear();
  selectStates.inputValue = "";
  selectStates.selectedOption = null;

  emits("clear");
  each(["change", "update:modelValue"], (k) => emits(k as any, ""));
}

function findOption(value: string) {
  return find(props.options, (opt) => opt.value === value);
}

function handleSelect(opt: SelectOptionProps) {
  if (opt.disabled) return;

  selectStates.inputValue = opt.label;
  selectStates.selectedOption = opt;
  each(["change", "update:modelValue"], (k) => emits(k as any, opt.value));
  controlVisible(false);
  inputRef.value?.focus();
}

function renderLabel(opt: SelectOptionProps): VNode | string {
  if (isFunction(props.renderLabel)) {
    return props.renderLabel(opt);
  }
  return opt.label;
}

function setSelected() {
  const opt = findOption(props.modelValue);
  if (!opt) return;
  selectStates.inputValue = opt.label;
  selectStates.selectedOption = opt;
}

watch(
  () => props.modelValue,
  () => {
    // 表单校验 逻辑 change
    setSelected();
  }
);

provide<SelectContext>(SELECT_CTX_KEY, {
  handleSelect,
  selectStates,
  renderLabel,
  highlightedLine,
});

defineExpose<SelectInstance>({
  focus,
  blur,
});
</script>

<template>
  <div
    ref="selectRef"
    class="er-select"
    :class="{
      'is-disabled': isDisabled,
    }"
    @click.stop="toggleVisible"
    @mouseenter="selectStates.mouseHover = true"
    @mouseleave="selectStates.mouseHover = false"
  >
    <er-tooltip
      ref="tooltipRef"
      placement="bottom-start"
      :popper-options="POPPER_OPTIONS"
      @click-outside="controlVisible(false)"
      manual
    >
      <template #default>
        <div ref="inputWrapperRef">
          <er-input
            ref="inputRef"
            v-model="selectStates.inputValue"
            :id="inputId"
            :disabled="isDisabled"
            :placeholder="placeholder"
            :readonly="!filterable || !isDropdownVisible"
            @focus="handleFocus"
            @blur="handleBlur"
          >
            <template #suffix>
              <er-icon
                v-if="showClear"
                icon="circle-xmark"
                class="er-input__clear"
                @click.stop="handleClear"
                @mousedown.prevent="noop"
              />
              <er-icon
                v-else
                class="header-angle"
                icon="angle-down"
                :class="{ 'is-active': isDropdownVisible }"
              />
            </template>
          </er-input>
        </div>
      </template>
      <template #content>
        <ul class="er-select__menu">
          <template v-if="!hasChildren">
            <er-option
              v-for="item in options"
              :key="item.value"
              v-bind="item"
            />
          </template>
          <template v-else>
            <slot name="default"></slot>
          </template>
        </ul>
      </template>
    </er-tooltip>
  </div>
</template>

<style scoped>
@import './style.css';
</style>