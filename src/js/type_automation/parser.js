/**
 * @fileoverview Code parsing for the type automation utility.
 */

"use strict";

/**
 * @typedef {import('../types.js').FunctionSignature} FunctionSignature
 */

const FUNCTION_PATTERNS = [
    /export\s+(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g,
    /^(?!.*export)\s*(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/gm,
    /export\s+const\s+(\w+)\s*=\s*(async\s+)?function\s*\(([^)]*)\)/g,
    /const\s+(\w+)\s*=\s*(async\s+)?\(([^)]*)\)\s*=>/g,
];

/**
 * Parses JavaScript code to extract function signatures.
 * @param {string} code
 * @returns {FunctionSignature[]}
 */
export function parseFunctionSignatures(code) {
    const signatures = [];
    for (const pattern of FUNCTION_PATTERNS) {
        let match;
        while ((match = pattern.exec(code)) !== null) {
            const [fullMatch, asyncKeyword, name, paramsString] = match;
            const parameters = (paramsString || "")
                .split(",")
                .map(p => p.trim().split("=")[0].trim())
                .filter(Boolean);
            
            signatures.push({
                name,
                parameters,
                isExported: fullMatch.startsWith("export"),
                isAsync: !!asyncKeyword,
                returnType: "any", // Advanced inference is out of scope for pure regex
            });
        }
    }
    return signatures;
} 