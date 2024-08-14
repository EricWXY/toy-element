import { createApp } from "vue";
import App from "./App.vue";
import { ErButton, ErAlert } from "toy-element";
// import "toy-element/dist/index.css";
import "toy-element/dist/theme/Button.css";
import "toy-element/dist/theme/Alert.css";

createApp(App).use(ErButton).use(ErAlert).mount("#app");
