<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ErMessage, type FormInstance } from "toy-element";

const formRef = ref<FormInstance>();
const form = reactive({
  name: "",
  desc: "",
});

const rules = reactive({
  name: [{ required: true, message: "请输入活动名称", trigger: "blur" }],
  desc: [{ required: true, message: "请填写活动形式", trigger: "blur" }],
});

const onSubmit = () => {
  formRef.value?.validate().then((valid) => {
    if (valid) {
      ErMessage.success("submit!");
    }
  });
};

const onReset = () => {
  formRef.value?.resetFields();
};
</script>

<template>
  <er-form ref="formRef" :model="form" :rules="rules">
    <er-form-item label="Activity name" prop="name">
      <er-input v-model="form.name" />
    </er-form-item>
    <er-form-item label="Activity form" prop="desc">
      <er-input v-model="form.desc" type="textarea" />
    </er-form-item>
    <er-form-item>
      <er-button type="primary" @click="onSubmit">Create</er-button>
      <er-button @click="onReset">Reset</er-button>
    </er-form-item>
  </er-form>
</template>
