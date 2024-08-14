<script setup lang="ts">
import type {
  FormItemContext,
  FormItemProps,
  FormValidateFailuer,
  FormValidateCallback,
  ValidateStatus,
  FormItemInstance,
  FormItemRule,
} from "./types";

import Schema, { type RuleItem } from "async-validator";
import { FORM_CTX_KEY, FORM_ITEM_CTX_KEY } from "./constants";
import {
  inject,
  onMounted,
  ref,
  reactive,
  toRefs,
  computed,
  onUnmounted,
  type Ref,
  provide,
} from "vue";
import {
  isNil,
  get,
  isString,
  size,
  filter,
  map,
  includes,
  keys,
  isArray,
  cloneDeep,
} from "lodash-es";
import { nextTick } from "process";

defineOptions({ name: "ErFormItem" });

const props = withDefaults(defineProps<FormItemProps>(), {
  required: void 0,
  showMessage: true,
});
const slots = defineSlots();
const ctx = inject(FORM_CTX_KEY);

const validateStatus: Ref<ValidateStatus> = ref("init");
const errMsg = ref("");
const getValByProp = (target: Record<string, any> | void) => {
  if (target && props.prop && !isNil(get(target, props.prop))) {
    return get(target, props.prop);
  }
  return null;
};

const isDisabled = computed(() => ctx?.disabled || props.disabled);
const innerVal = computed(() => {
  const model = ctx?.model;
  return getValByProp(model);
});
const propString = computed(() => {
  if (!props.prop) return "";
  return isString(props.prop) ? props.prop : props.prop.join(".");
});

const itemRules = computed(() => {
  const { required } = props;
  const rules: FormItemRule[] = [];

  if (props.rules) {
    rules.push(...props.rules);
  }
  const formRules = ctx?.rules;
  if (formRules && props.prop) {
    const _rules = getValByProp(formRules);
    if (_rules) {
      rules.push(...rules);
    }
  }

  if (!isNil(required)) {
    const requiredRules = filter(
      map(rules, (rule, i) => [rule, i]),
      (item: [FormItemRule, number]) => includes(keys(item[0]), "required")
    );

    if (size(requiredRules)) {
      for (const item of requiredRules) {
        const [rule, i] = item as [FormItemRule, number];
        if (rule.required === required) continue;
        rules[i] = { ...rule, required };
      }
    } else {
      rules.push({ required });
    }
  }

  return rules;
});

let initialVal: any = null;
let isResetting: boolean = false;

function getTriggeredRules(trigger: string) {
  const rules = itemRules.value;
  if (!rules) return [];
  return filter(rules, (r) => {
    if (!r?.trigger || !trigger) return true;
    if (isArray(r.trigger)) {
      return r.trigger.includes(trigger);
    }
    return r.trigger === trigger;
  }).map(({ trigger, ...rule }) => rule as RuleItem);
}

async function doValidate(rules: RuleItem[]) {
  const modleName = propString.value;
  const validator = new Schema({ [modleName]: rules });
  return validator
    .validate({ [modleName]: innerVal.value }, { firstFields: true })
    .then(() => {
      validateStatus.value = "success";
      ctx?.emits("validate", props, true, "");
      return true;
    })
    .catch((err: FormValidateFailuer) => {
      const { errors } = err;
      validateStatus.value = "error";
      errMsg.value = errors && size(errors) > 0 ? errors[0].message ?? "" : "";
      ctx?.emits("validate", props, false, errMsg.value);
      return Promise.reject(err);
    });
}

const validate: FormItemInstance["validate"] = async function (
  trigger: string,
  callback?: FormValidateCallback
) {
  if (isResetting || !props.prop || isDisabled.value) return false;

  if (!validateStatus.value) {
    callback?.(false);
    return false;
  }

  const rules = getTriggeredRules(trigger);
  if (!size(rules)) {
    callback?.(true);
    return true;
  }

  validateStatus.value = "validating";
  return doValidate(rules)
    .then(() => {
      callback?.(true);
      return true;
    })
    .catch((err: FormValidateFailuer) => {
      const { fields } = err;
      callback?.(false, fields);
      return Promise.reject(fields);
    });
};

const resetField: FormItemInstance["resetField"] = function () {
  const model = ctx?.model;
  if (model && propString.value && !isNil(get(model, propString.value))) {
    isResetting = true;
    model[propString.value] = cloneDeep(initialVal);
  }
  nextTick(() => clearValidate());
};

const clearValidate: FormItemInstance["clearValidate"] = function () {
  validateStatus.value = "init";
  errMsg.value = "";
  isResetting = false;
};

const formItemCtx: FormItemContext = reactive({
  ...toRefs(props),
  disabled: isDisabled.value,
  validate,
  resetField,
  clearValidate,
  addInputId: () => {},
  removeInputId: () => {},
});

onMounted(() => {
  if (!props.prop) return;
  ctx?.addField(formItemCtx);
  initialVal = innerVal.value;
});

onUnmounted(() => {
  if (!props.prop) return;
  ctx?.removeField(formItemCtx);
});

provide<FormItemContext>(FORM_ITEM_CTX_KEY, formItemCtx);

defineExpose<FormItemInstance>({
  validateMessage: errMsg,
  validateStatus,
  validate,
  resetField,
  clearValidate,
});
</script>

<template>
  <div class="er-form-item">
    <div class="er-form-item__content">
      <slot></slot>
      <div class="er-form-item_error-msg" v-if="validateStatus === 'error'">
        <template v-if="ctx?.showMessage && showMessage">
          <slot name="error" :error="errMsg">{{ errMsg }}</slot>
        </template>
      </div>
    </div>
  </div>
</template>
