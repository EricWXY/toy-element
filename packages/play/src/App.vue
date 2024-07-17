<script lang="ts" setup>
import { reactive } from "vue";

const form = reactive({
  name: "",
  desc: "",
});
</script>

<template>
  <er-input v-model="form.name" show-password type="password" />
  <er-input v-model="form.desc" type="textarea" />
</template>
