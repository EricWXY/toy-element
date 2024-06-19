"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const lodashEs = require("lodash-es");
const shell = require("shelljs");
function hooksPlugin({
  rmFiles = [],
  beforeBuild,
  afterBuild
}) {
  return {
    name: "hooks-plugin",
    buildStart() {
      lodashEs.each(rmFiles, (fName) => shell.rm("-rf", fName));
      lodashEs.isFunction(beforeBuild) && beforeBuild();
    },
    buildEnd(err) {
      !err && lodashEs.isFunction(afterBuild) && afterBuild();
    }
  };
}
exports.hooksPlugin = hooksPlugin;
