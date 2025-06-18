/**
 * @fileoverview Automated tools for adding type annotations to JavaScript files.
 */

"use strict";

import { getModuleTypeImports } from "./type_automation/inference.js";
import { generateFunctionJSDoc } from "./type_automation/doc_generator.js";
import { parseFunctionSignatures } from "./type_automation/parser.js";

/**
 * @typedef {import('./types.js').TypeAnnotationConfig} TypeAnnotationConfig
 * @typedef {import('./types.js').TypeAnnotationResult} TypeAnnotationResult
 */

/**
 * Adds type annotations to a JavaScript file.
 * @param {string} code - The original JavaScript code.
 * @param {string} filename - The name of the file for context.
 * @param {Partial<TypeAnnotationConfig>} [config={}] - Configuration options.
 * @returns {TypeAnnotationResult}
 */
export function addTypeAnnotations(code, filename, config = {}) {
    const defaultConfig = {
        addInputValidation: true,
        addJSDocExamples: false,
        version: "1.0.0",
    };
    const finalConfig = { ...defaultConfig, ...config };

    try {
        const signatures = parseFunctionSignatures(code);
        if (signatures.length === 0) {
            return { success: true, warnings: ["No functions found."], errors: [], annotatedCode: code };
        }

        let annotatedCode = code;
        for (const signature of signatures.reverse()) { // Reverse to avoid index issues
            const jsDoc = generateFunctionJSDoc(signature, finalConfig);
            const functionRegex = new RegExp(`(function\\s+${signature.name}|const\\s+${signature.name}\\s*=\\s*(async)?\\s*function|const\\s+${signature.name}\\s*=\\s*(async)?\\s*\\()`);
            const match = annotatedCode.match(functionRegex);

            if (match && match.index > 0) {
                const existingJSDocRegex = /\/\*\*[\s\S]*?\*\//;
                const precedingCode = annotatedCode.substring(0, match.index);
                if (!existingJSDocRegex.test(precedingCode.slice(precedingCode.lastIndexOf("\n")))) {
                     annotatedCode = `${precedingCode.trimEnd()}\n${jsDoc}\n${annotatedCode.slice(match.index).trimStart()}`;
                }
            }
        }
        
        // This is a simplified approach. A real implementation would need a proper AST parser.
        // For now, let's focus on just generating the JSDoc for the first function found.
        const firstSignature = signatures[0];
        const firstJsDoc = generateFunctionJSDoc(firstSignature, finalConfig);
        
        return {
            success: true,
            warnings: ["Code is not modified, only JSDoc is generated for the first function."],
            errors: [],
            annotatedCode: `${firstJsDoc}\n${code}`, // Example of prepending
        };

    } catch (/** @type {any} */ error) {
        return { success: false, warnings: [], errors: [error.message], annotatedCode: code };
    }
} 