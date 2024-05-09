<script setup lang="ts">
import type { IconProps } from "./types";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { omit } from "lodash-es";
import { computed } from "vue";

defineOptions({
  name: "ErIcon",
  inheritAttrs: false,
});

const props = defineProps<IconProps>();
const filterProps = computed(() => omit(props, ["type", "color"]));
const customStyles = computed(() => ({ color: props.color ?? void 0 }));
</script>

<template>
  <i
    class="er-icon"
    :class="[`er-icon-${props.type}`]"
    :style="customStyles"
    v-bind="$attrs"
  >
    <font-awesome-icon v-bind="filterProps" />
  </i>
</template>

<style scoped>
.er-icon {
  --er-icon-color: inherit;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  fill: currentColor;
  color: var(--er-icon-color);
  font-size: inherit;
}

@each $val in primary, info, success, warning, danger {
  .er-icon--$(val) {
    --er-icon-color: var(--er-color-$(val));
  }
}
</style>
