<script setup lang="ts">
import { ref, computed } from "vue";
import { addUnit } from "@toy-element/utils";
import type { TooltipInstance } from "../Tooltip";
import type { PopconfirmProps, PopconfirmEmits } from "./types";

import ErTooltip from "../Tooltip/Tooltip.vue";
import ErButton from "../Button/Button.vue";
import ErIcon from "../Icon/Icon.vue";

defineOptions({
  name: "ErPopconfirm",
});

const props = withDefaults(defineProps<PopconfirmProps>(), {
  title: "",
  confirmButtonType: "primary",
  confirmButtonText: "Yes",
  cancelButtonText: "No",
  icon: "question-circle",
  iconColor: "#f90",
  hideAfter: 200,
  width: 150,
});

const emits = defineEmits<PopconfirmEmits>();
const tooltipRef = ref<TooltipInstance>();
const style = computed(() => ({ width: addUnit(props.width) }));

function hidePopper() {
  tooltipRef.value?.hide();
}

function confrim(e: MouseEvent) {
  emits("confirm", e);
  hidePopper();
}

function cancel(e: MouseEvent) {
  emits("cancel", e);
  hidePopper();
}
</script>

<template>
  <er-tooltip ref="tooltipRef" trigger="click" :hide-timeout="hideAfter">
    <template #content>
      <div class="er-popconfirm" :style="style">
        <div class="er-popconfirm__main">
          <er-icon v-if="!hideIcon && icon" :icon="icon" :color="iconColor" />
          {{ title }}
        </div>
        <div class="er-popconfirm__action">
          <er-button class="er-popconfirm__cancel" size="small" :type="cancelButtonType" @click="cancel">
            {{ cancelButtonText }}
          </er-button>
          <er-button class="er-popconfirm__confirm" size="small" :type="confirmButtonType" @click="confrim">
            {{ confirmButtonText }}
          </er-button>
        </div>
      </div>
    </template>

    <template v-if="$slots.default" #default>
      <slot name="default"></slot>
    </template>

    <template v-if="$slots.reference" #default>
      <slot name="reference"></slot>
    </template>
  </er-tooltip>
</template>

<style scoped>
@import "./style.css";
</style>
