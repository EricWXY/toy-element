import type { Component, ComputedRef, Ref } from "vue";

export type ButtonType = "primary" | "success" | "warning" | "danger" | "info";
export type NativeType = "button" | "reset" | "submit";
export type ButtonSize = "large" | "default" | "small";

export interface ButtonProps {
  /**
   * @property tag
   * @type string|Component
   * @description 自定义元素标签
   * @default "button"
   */
  tag?: string | Component;
  /**
   * @property type
   * @type ButtonType
   * @description 按钮类型
   * @default "info"
   */
  type?: ButtonType;
  /**
   * @description 按钮尺寸
   * @default "-"
   */
  size?: ButtonSize;
  /**
   * @description 原生 type 属性
   * @default "button"
   * @type 'button'|'reset'|'submit'
   */
  nativeType?: NativeType;
  /**
   * @description 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * @description 是否为加载中状态
   * @default false
   */
  loading?: boolean;
  /**
   * @description 按钮图标
   * @default "-"
   */
  icon?: string;
  /**
   * @description 是否为圆形按钮
   * @default false
   */
  circle?: boolean;
  /**
   * @description 是否为朴素按钮
   * @default false
   */
  plain?: boolean;
  /**
   * @description 是否为圆角按钮
   * @default false
   */
  round?: boolean;
  /**
   * @description 自定义加载中状态图标组件
   * @default "spinner"
   */
  loadingIcon?: string;
  /**
   * @description 自动聚焦(原生`autofocus`属性)
   * @default false
   */
  autofocus?: boolean;
  /**
   * @description 是否开启节流
   * @default true
   */
  useThrottle?: boolean;
  /**
   * @description 节流模式下，节流时间间隔(ms)
   * @default 500
   */
  throttleDuration?: number;
}

export interface ButtonGroupProps {
  size?: ButtonSize;
  type?: ButtonType;
  disabled?: boolean;
}

export interface ButtonGroupContext {
  size?: ButtonSize;
  type?: ButtonType;
  disabled?: boolean;
}

/**
 * @group Button
 */
export interface ButtonEmits {
  (e: "click", val: MouseEvent): void;
}

/**
 * @group Button
 */
export interface ButtonInstance {
  ref: Ref<HTMLButtonElement | void>;
  disabled: ComputedRef<boolean>;
  size: ComputedRef<ButtonSize | "">;
  type: ComputedRef<ButtonType | "">;
}
