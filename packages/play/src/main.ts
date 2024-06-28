import { createApp } from "vue";
import App from "./App.vue";
import ToyElement, { zhCn } from "toy-element";
import "toy-element/dist/index.css";

createApp(App).use(ToyElement, { locale: zhCn }).mount("#app");
