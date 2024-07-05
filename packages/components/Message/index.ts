import Message from "./methods";
import { withInstallFunction } from "@toy-element/utils";

export const ErMessage = withInstallFunction(Message, "$message");

export * from "./types";
