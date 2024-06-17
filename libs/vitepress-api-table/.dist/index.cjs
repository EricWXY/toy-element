'use strict';

var MarkdownIt = require('markdown-it');
var container = require('markdown-it-container');
var fs = require('fs');
var url = require('url');
var path = require('path');
var lodashEs = require('lodash-es');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var MarkdownIt__default = /*#__PURE__*/_interopDefaultLegacy(MarkdownIt);
var container__default = /*#__PURE__*/_interopDefaultLegacy(container);

var md = new MarkdownIt__default["default"]();
var _readFile = function (filename) {
    var __filename = url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('index.cjs', document.baseURI).href)));
    var __dirname = path.dirname(__filename);
    return fs.readFileSync(path.resolve(__dirname, "../../../packages/" + filename)).toString("utf8");
};
var render = function (tokens, idx) {
    var _a, _b, _c;
    var token = tokens[idx];
    var filePath = (_c = (_b = (_a = token.info.trim()) === null || _a === void 0 ? void 0 : _a.split(" ").slice(1)[0]) === null || _b === void 0 ? void 0 : _b.trim()) === null || _c === void 0 ? void 0 : _c.split("=")[1];
    var result = "";
    if (token.nesting === 1) {
        var fileContent = _readFile(filePath);
        // 正则表达式匹配接口名称
        var interfaceRegex = /export\s+interface\s+(\w+)/g;
        // 执行匹配并存储所有接口名称
        var match = null;
        while ((match = interfaceRegex.exec(fileContent)) !== null) {
            result += md.render(generateMarkdownDocumentation(fileContent, match[1]));
        }
    }
    return result;
};
var apiTableMdPlugin = function (md) {
    md.use(container__default["default"], "api-table", { render: render });
};
function generateMarkdownDocumentation(content, interfaceName) {
    var regex = new RegExp("export interface ".concat(interfaceName, " {([\\s\\S]*?)}"), "m");
    var match = content.match(regex);
    if (!match)
        return "No interface found";
    var propertiesBlock = match[1];
    var markdownTable = "## ".concat(interfaceName, "\n\n| Property | Type | Default | Description |\n| --- | --- | --- | --- |\n");
    var properties = parsePropertyComments(propertiesBlock);
    lodashEs.each(properties, function (propertie) {
        markdownTable += "| ".concat(propertie.propertyName, " | ").concat(propertie.propertyType, " | ").concat(propertie.defaultValue, " | ").concat(propertie.description, " |\n");
    });
    return markdownTable;
}
// 解析注释和属性
function parsePropertyComments(propertyStr) {
    var props = propertyStr.trim().split(";");
    var properties = [];
    lodashEs.each(props, function (prop) {
        var propInfo = {
            propertyName: "",
            propertyType: "",
            description: "",
        };
        var propNameRegex = /@property\s*(.*?)\s*(?:\n\s*\*\s*@|\*\/)/s;
        var propNameMatch = prop.match(propNameRegex);
        var descriptionRegex = /@description\s*(.*?)\s*(?:\n\s*\*\s*@|\*\/)/s;
        var descMatch = prop.match(descriptionRegex);
        var defaultValueRegex = /@default\s*(.*?)\s*(?:\n\s*\*\s*@|\*\/)/s;
        var defaultValueMatch = prop.match(defaultValueRegex);
        if (propNameMatch) {
            propInfo.propertyName = propNameMatch[1].trim();
        }
        if (descMatch) {
            propInfo.description = descMatch[1].trim();
        }
        if (defaultValueMatch) {
            propInfo.defaultValue = defaultValueMatch[1].trim();
        }
        if (propInfo.propertyName)
            properties.push(propInfo);
    });
    return properties;
}

module.exports = apiTableMdPlugin;
