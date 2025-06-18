/**
 * @fileoverview JSDoc block generation for the type automation utility.
 */

"use strict";

import { inferParameterTypes } from "./inference.js";

/**
 * @typedef {import('../types.js').FunctionSignature} FunctionSignature
 * @typedef {import('../types.js').TypeAnnotationConfig} TypeAnnotationConfig
 */

/**
 * Generates a complete JSDoc annotation for a function.
 * @param {FunctionSignature} signature
 * @param {TypeAnnotationConfig} config
 * @returns {string}
 */
export function generateFunctionJSDoc(signature, config) {
    const lines = ["/**"];
    lines.push(` * @summary ${signature.name}`); // Simple summary
    lines.push(" *");

    if (signature.parameters.length > 0) {
        const paramTypes = inferParameterTypes(signature.parameters);
        for (const param of signature.parameters) {
            lines.push(` * @param {${paramTypes[param] || "any"}} ${param}`);
        }
        lines.push(" *");
    }

    const returnType = signature.returnType || "void";
    lines.push(` * @returns {${signature.isAsync ? `Promise<${returnType}>` : returnType}}`);
    lines.push(" *");

    if (config.addInputValidation) {
        lines.push(" * @throws {TypeError} If any parameter is of the wrong type.");
        lines.push(" *");
    }

    lines.push(` * @since ${config.version || "1.0.0"}`);
    lines.push(` * @${signature.isExported ? "public" : "private"}`);
    lines.push(" */");

    return lines.join("\n");
} 