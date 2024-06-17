import MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { each } from 'lodash-es';

var md = new MarkdownIt();
var _readFile = function (filename) {
    var __filename = fileURLToPath(import.meta.url);
    var __dirname = dirname(__filename);
    return readFileSync(resolve(__dirname, "../../../packages/" + filename)).toString("utf8");
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
    md.use(container, "api-table", { render: render });
};
function generateMarkdownDocumentation(content, interfaceName) {
    var regex = new RegExp("export interface ".concat(interfaceName, " {([\\s\\S]*?)}"), "m");
    var match = content.match(regex);
    if (!match)
        return "No interface found";
    var propertiesBlock = match[1];
    var markdownTable = "## ".concat(interfaceName, "\n\n| Property | Type | Default | Description |\n| --- | --- | --- | --- |\n");
    var properties = parsePropertyComments(propertiesBlock);
    each(properties, function (propertie) {
        markdownTable += "| ".concat(propertie.propertyName, " | ").concat(propertie.propertyType, " | ").concat(propertie.defaultValue, " | ").concat(propertie.description, " |\n");
    });
    return markdownTable;
}
// 解析注释和属性
function parsePropertyComments(propertyStr) {
    var props = propertyStr.trim().split(";");
    var properties = [];
    each(props, function (prop) {
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

export { apiTableMdPlugin as default };
