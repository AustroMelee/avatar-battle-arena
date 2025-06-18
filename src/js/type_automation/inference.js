/**
 * @fileoverview Type inference for the type automation utility.
 */

"use strict";

import { MODULE_TYPE_CONFIGS, COMMON_TYPE_MAPPINGS } from "./config.js";

/**
 * Generates appropriate type imports for a module based on its filename.
 * @param {string} filename
 * @param {string[]} [additionalTypes=[]]
 * @returns {string[]}
 */
export function getModuleTypeImports(filename, additionalTypes = []) {
    let typeImports = [];
    for (const [pattern, types] of Object.entries(MODULE_TYPE_CONFIGS)) {
        if (filename.startsWith(pattern)) {
            typeImports = [...types];
            break;
        }
    }
    typeImports.push(...additionalTypes);
    return [...new Set(typeImports)].sort();
}

/**
 * Infers parameter types based on their names.
 * @param {string[]} parameterNames
 * @returns {Object<string, string>}
 */
export function inferParameterTypes(parameterNames) {
    const typeMap = {};
    for (const paramName of parameterNames) {
        if (COMMON_TYPE_MAPPINGS[paramName]) {
            typeMap[paramName] = COMMON_TYPE_MAPPINGS[paramName];
            continue;
        }
        typeMap[paramName] = inferTypeFromPattern(paramName);
    }
    return typeMap;
}

function inferTypeFromPattern(paramName) {
    if (paramName.endsWith("Id") || paramName.endsWith("ID")) return "string";
    if (paramName.endsWith("Count") || paramName.endsWith("Index")) return "number";
    if (paramName.startsWith("is") || paramName.startsWith("has")) return "boolean";
    if (paramName.endsWith("Callback") || paramName.endsWith("Handler")) return "Function";
    if (paramName.endsWith("Element")) return "HTMLElement";
    if (paramName.endsWith("Event")) return "Event";
    if (paramName.endsWith("Array") || paramName.endsWith("List")) return "any[]";
    return "any";
} 