import type {
  MessageBoxAction,
  MessageBoxOptions,
  MessageBoxData,
  MessageBoxCallback,
  MessageBoxProps,
  IErMessageBox,
} from "./types";
import type { ComponentPublicInstance, VNode, VNodeProps, Ref } from "vue";
import { createVNode, isVNode, ref, render, nextTick } from "vue";
import {
  isString,
  isFunction,
  each,
  set,
  isObject,
  isUndefined,
  assign,
} from "lodash-es";

import MessageBoxConstructor from "./MessageBox.vue";

const messageInstanceMap = new Map<
  ComponentPublicInstance<{ doClose: () => void }>,
  {
    options: MessageBoxOptions;
    callback: MessageBoxCallback | void;
    resolve: (res: any) => void;
    reject: (res: any) => void;
  }
>();

function initInstance(props: MessageBoxProps, container: HTMLElement) {
  const visible = ref(false);
  const isVNodeMsg = isFunction(props?.message) || isVNode(props?.message);

  const genDefaultSlot = (msg: VNode | (() => VNode)) =>
    isFunction(msg) ? msg : () => msg;

  const vnode = createVNode(
    MessageBoxConstructor,
    {
      ...props,
      visible,
    } as VNodeProps,
    isVNodeMsg ? { default: genDefaultSlot(props.message as VNode) } : void 0
  );

  render(vnode, container);
  document.body.appendChild(container.firstElementChild!);
  return vnode.component;
}

function createMessage(options: MessageBoxOptions) {
  const container = document.createElement("div");
  const props: MessageBoxProps = {
    ...options,
    doClose: () => {
      vm.visible.value = false;
    },
    doAction: (action: MessageBoxAction, inputVal: string) => {
      const currentMsg = messageInstanceMap.get(vm);
      let resolve:
        | MessageBoxAction
        | { value: string; action: MessageBoxAction };

      nextTick(() => vm.doClose());
      if (options.showInput) {
        resolve = { value: inputVal, action };
      } else {
        resolve = action;
      }
      if (options.callback) {
        options.callback(resolve);
        return;
      }
      if (action === "cancel" || action === "close") {
        currentMsg?.reject(action);
        return;
      }
      currentMsg?.resolve(resolve);
    },
    destroy: () => {
      render(null, container);
      messageInstanceMap.delete(vm);
    },
  };

  const instance = initInstance(props as MessageBoxProps, container);
  const vm = instance?.proxy as ComponentPublicInstance<{
    doClose: () => void;
    visible: Ref<boolean>;
  }>;

  vm.visible.value = true;
  return vm;
}

async function MessageBox(options: MessageBoxOptions): Promise<MessageBoxData>;
function MessageBox(options: MessageBoxOptions | string | VNode): Promise<any> {
  let callback: MessageBoxCallback | void;
  if (isString(options) || isVNode(options)) {
    options = {
      message: options,
    };
  } else {
    callback = options.callback;
  }
  return new Promise((resolve, reject) => {
    const instance = createMessage(options);
    messageInstanceMap.set(instance, { options, callback, resolve, reject });
  });
}

const MESSAGE_BOX_VARIANTS = ["alert", "confirm", "prompt"] as const;
const MESSAGE_BOX_DEFAULT_OPTS: Record<
  (typeof MESSAGE_BOX_VARIANTS)[number],
  Partial<MessageBoxOptions>
> = {
  alert: { closeOnClickModal: false },
  confirm: { showCancelButton: true },
  prompt: { showCancelButton: true, showInput: true },
};

each(MESSAGE_BOX_VARIANTS, (type) =>
  set(MessageBox, type, messageBoxFactory(type))
);

function messageBoxFactory(boxType: (typeof MESSAGE_BOX_VARIANTS)[number]) {
  return (
    message: string | VNode,
    title: string | MessageBoxOptions,
    options: MessageBoxOptions
  ) => {
    let titleOrOpts = "";
    if (isObject(title)) {
      options = title as MessageBoxOptions;
      titleOrOpts = "";
    } else if (isUndefined(title)) {
      titleOrOpts = "";
    } else {
      titleOrOpts = title as string;
    }

    return MessageBox(
      assign(
        {
          title: titleOrOpts,
          message,
          type: "",
          boxType,
          ...MESSAGE_BOX_DEFAULT_OPTS[boxType],
        },
        options
      )
    );
  };
}

set(MessageBox, "close", () => {
  messageInstanceMap.forEach((_, vm) => {
    vm.doClose();
  });
  messageInstanceMap.clear();
});

export default MessageBox as IErMessageBox;
