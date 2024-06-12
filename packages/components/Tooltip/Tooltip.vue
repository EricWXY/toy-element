<script setup lang="ts">
import type { TooltipProps, TooltipEmits, TooltipInstance } from "./types";
import { createPopper, type Instance } from "@popperjs/core";
import { bind, debounce, isNil, type DebounceFunc } from "lodash-es";
import { ref, watchEffect, watch, computed, onUnmounted, type Ref } from "vue";
import { useClickOutside } from "@toy-element/hooks";

defineOptions({
  name: "ErTooltip",
});
const props = withDefaults(defineProps<TooltipProps>(), {
  placement: "bottom",
  trigger: "hover",
  transition: "fade",
  showTimeout: 0,
  hideTimeout: 200,
});

const emits = defineEmits<TooltipEmits>();
const visible = ref(false);

const events: Ref<Record<string, EventListener>> = ref({});
const outerEvents: Ref<Record<string, EventListener>> = ref({});
const dropdownEvents: Ref<Record<string, EventListener>> = ref({});

const containerNode = ref<HTMLElement>();
const popperNode = ref<HTMLElement>();
const triggerNode = ref<HTMLElement>();

const popperOptions = computed(() => ({
  placement: props.placement,
  modifiers: [
    {
      name: "offset",
      options: {
        offset: [0, 9],
      },
    },
  ],
  ...props.popperOptions,
}));

const openDelay = computed(() =>
  props.trigger === "hover" ? props.showTimeout : 0
);
const closeDelay = computed(() =>
  props.trigger === "hover" ? props.hideTimeout : 0
);

const triggerStrategyMap: Map<string, () => void> = new Map();
triggerStrategyMap.set("hover", () => {
  events.value["mouseenter"] = openFinal;
  outerEvents.value["mouseleave"] = closeFinal;
  dropdownEvents.value["mouseenter"] = openFinal;
});
triggerStrategyMap.set("click", () => {
  events.value["click"] = togglePopper;
});
triggerStrategyMap.set("contextmenu", () => {
  events.value["contextmenu"] = (e) => {
    e.preventDefault();
    openFinal();
  };
});

let openDebounce: DebounceFunc<() => void> | void;
let closeDebounce: DebounceFunc<() => void> | void;

function openFinal() {
  closeDebounce?.cancel();
  openDebounce?.();
}

function closeFinal() {
  openDebounce?.cancel();
  closeDebounce?.();
}

function togglePopper() {
  visible.value ? closeFinal() : openFinal();
}

function setVisibel(val: boolean) {
  if (props.disabled) return;
  visible.value = val;
  emits("visible-change", val);
}

function attachEvents() {
  if (props.disabled || props.manual) return;

  triggerStrategyMap.get(props.trigger)?.();
}

let popperInstance: null | Instance;

function destroyPopperInstance() {
  if (isNil(popperInstance)) return;

  popperInstance.destroy();
  popperInstance = null;
}

function resetEvents() {
  events.value = {};
  outerEvents.value = {};
  dropdownEvents.value = {};

  attachEvents();
}

const show: TooltipInstance["show"] = openFinal;
const hide: TooltipInstance["hide"] = function () {
  openDebounce?.cancel();
  setVisibel(false);
};

watch(
  visible,
  (val) => {
    if (!val) return;
    if (triggerNode.value && popperNode.value) {
      popperInstance = createPopper(
        triggerNode.value,
        popperNode.value,
        popperOptions.value
      );
    }
  },
  { flush: "post" }
);

watch(
  () => props.manual,
  (isManual) => {
    if (isManual) {
      resetEvents();
      return;
    }
    attachEvents();
  }
);

watch(
  () => props.trigger,
  (val, oldVal) => {
    if (val === oldVal) return;
    openDebounce?.cancel();
    visible.value = false;
    emits("visible-change", false);
    resetEvents();
  }
);

watchEffect(() => {
  if (!props.manual) {
    attachEvents();
  }
  openDebounce = debounce(bind(setVisibel, null, true), openDelay);
  closeDebounce = debounce(bind(setVisibel, null, false), closeDelay);
});

useClickOutside(containerNode, () => {
  emits("click-outside");
  if (props.trigger === "hover" || props.manual) return;

  visible.value && closeFinal();
});

onUnmounted(() => {
  destroyPopperInstance();
});

defineExpose<TooltipInstance>({
  show,
  hide,
});
</script>

<template>
  <div class="er-tooltip" ref="containerNode" v-on="outerEvents">
    <div
      class="er-tooltip__trigger"
      ref="triggerNode"
      v-on="events"
      v-if="!virtualTriggering"
    >
      <slot></slot>
    </div>
    <slot name="default" v-else></slot>

    <transition :name="transition" @after-leave="destroyPopperInstance">
      <div
        class="er-tooltip__popper"
        ref="popperNode"
        v-on="dropdownEvents"
        v-if="visible"
      >
        <slot name="content">
          {{ content }}
        </slot>
        <div id="arrow" data-popper-arrow></div>
      </div>
    </transition>
  </div>
</template>
