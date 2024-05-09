import { makeInstaller } from "@toy-element/utils";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import components from "./components";
import "@toy-element/theme/index.css";

library.add(fas);
const installer = makeInstaller(components);

export * from "@toy-element/components";
export default installer;
