/**
 * @fileoverview Type Annotation Automation Utilities
 * @description Automated tools for adding type annotations to JavaScript files
 * @version 1.0.0
 */

'use strict';

//# sourceURL=utils_type_automation.js

// --- TYPE IMPORTS ---
/**
 * @typedef {import('./types.js').ValidationResult} ValidationResult
 */

/**
 * @typedef {Object} TypeAnnotationConfig
 * @description Configuration for type annotation automation
 * @property {string[]} typeImports - Types to import from types.js
 * @property {boolean} addInputValidation - Whether to add input validation
 * @property {boolean} addJSDocExamples - Whether to add JSDoc examples
 * @property {string} moduleDescription - Module description for file header
 * @property {string} version - Module version
 */

/**
 * @typedef {Object} FunctionSignature
 * @description Parsed function signature information
 * @property {string} name - Function name
 * @property {string[]} parameters - Parameter names
 * @property {boolean} isExported - Whether function is exported
 * @property {boolean} isAsync - Whether function is async
 * @property {string} returnType - Inferred return type
 */

/**
 * @typedef {Object} TypeAnnotationResult
 * @description Result of type annotation process
 * @property {boolean} success - Whether annotation was successful
 * @property {string[]} warnings - Warning messages
 * @property {string[]} errors - Error messages
 * @property {string} annotatedCode - Code with type annotations added
 */

/**
 * Module-specific type import configurations
 * @type {Object<string, string[]>}
 */
const MODULE_TYPE_CONFIGS = {
    'engine_': ['Fighter', 'BattleState', 'PhaseState', 'BattleEvent', 'MoveResult'],
    'ui_': ['UIState', 'SelectionState', 'RenderState', 'AnimationState'],
    'utils_': ['ValidationResult', 'ConfigOptions', 'PerformanceMetrics'],
    'data_': ['Fighter', 'Move', 'Location', 'Effect'],
    'ai_': ['AiDecision', 'AiAnalysis', 'AiPersonality', 'AiMemory'],
    'battle_': ['BattleEvent', 'BattleState', 'BattleResult'],
    'config_': ['ConfigOptions', 'ValidationResult'],
    'constants_': []
};

/**
 * Common type mappings for parameter inference
 * @type {Object<string, string>}
 */
const COMMON_TYPE_MAPPINGS = {
    'id': 'string',
    'name': 'string',
    'text': 'string',
    'message': 'string',
    'url': 'string',
    'path': 'string',
    'count': 'number',
    'index': 'number',
    'value': 'number',
    'amount': 'number',
    'duration': 'number',
    'enabled': 'boolean',
    'visible': 'boolean',
    'active': 'boolean',
    'valid': 'boolean',
    'callback': 'Function',
    'handler': 'Function',
    'listener': 'Function',
    'element': 'HTMLElement',
    'button': 'HTMLButtonElement',
    'input': 'HTMLInputElement',
    'event': 'Event',
    'error': 'Error',
    'data': 'Object',
    'config': 'Object',
    'options': 'Object',
    'state': 'Object',
    'result': 'Object'
};

/**
 * Generates appropriate type imports for a module based on its filename
 * 
 * @param {string} filename - The filename to analyze
 * @param {string[]} [additionalTypes] - Additional types to import
 * 
 * @returns {string[]} Array of type names to import
 * 
 * @example
 * // Generate imports for battle engine module
 * const imports = getModuleTypeImports('engine_battle_core.js');
 * console.log(imports); // ['Fighter', 'BattleState', 'PhaseState', ...]
 * 
 * @since 1.0.0
 * @public
 */
export function getModuleTypeImports(filename, additionalTypes = []) {
    // Input validation
    if (typeof filename !== 'string' || filename.length === 0) {
        throw new TypeError('getModuleTypeImports: filename must be a non-empty string');
    }
    
    if (!Array.isArray(additionalTypes)) {
        throw new TypeError('getModuleTypeImports: additionalTypes must be an array');
    }

    /** @type {string[]} */
    let typeImports = [];

    // Find matching module pattern
    for (const [pattern, types] of Object.entries(MODULE_TYPE_CONFIGS)) {
        if (filename.startsWith(pattern)) {
            typeImports = [...types];
            break;
        }
    }

    // Add additional types
    typeImports.push(...additionalTypes);

    // Remove duplicates and sort
    return [...new Set(typeImports)].sort();
}

/**
 * Infers parameter types based on parameter names and context
 * 
 * @param {string[]} parameterNames - Array of parameter names
 * @param {string} functionName - Function name for context
 * @param {string} moduleType - Module type for context
 * 
 * @returns {Object<string, string>} Mapping of parameter names to types
 * 
 * @example
 * // Infer types for function parameters
 * const types = inferParameterTypes(['id', 'name', 'enabled'], 'createUser', 'utils_');
 * console.log(types); // { id: 'string', name: 'string', enabled: 'boolean' }
 * 
 * @since 1.0.0
 * @public
 */
export function inferParameterTypes(parameterNames, functionName, moduleType) {
    // Input validation
    if (!Array.isArray(parameterNames)) {
        throw new TypeError('inferParameterTypes: parameterNames must be an array');
    }
    
    if (typeof functionName !== 'string') {
        throw new TypeError('inferParameterTypes: functionName must be a string');
    }
    
    if (typeof moduleType !== 'string') {
        throw new TypeError('inferParameterTypes: moduleType must be a string');
    }

    /** @type {Object<string, string>} */
    const typeMap = {};

    parameterNames.forEach(paramName => {
        // Check for exact matches first
        if (COMMON_TYPE_MAPPINGS[paramName]) {
            typeMap[paramName] = COMMON_TYPE_MAPPINGS[paramName];
            return;
        }

        // Check for pattern matches
        if (paramName.endsWith('Id') || paramName.endsWith('ID')) {
            typeMap[paramName] = 'string';
        } else if (paramName.endsWith('Count') || paramName.endsWith('Index')) {
            typeMap[paramName] = 'number';
        } else if (paramName.startsWith('is') || paramName.startsWith('has') || paramName.startsWith('can')) {
            typeMap[paramName] = 'boolean';
        } else if (paramName.endsWith('Callback') || paramName.endsWith('Handler')) {
            typeMap[paramName] = 'Function';
        } else if (paramName.endsWith('Element')) {
            typeMap[paramName] = 'HTMLElement';
        } else if (paramName.endsWith('Event')) {
            typeMap[paramName] = 'Event';
        } else if (paramName.endsWith('Array') || paramName.endsWith('List')) {
            typeMap[paramName] = 'Array';
        } else {
            // Default to any for unknown patterns
            typeMap[paramName] = 'any';
        }
    });

    return typeMap;
}

/**
 * Generates a complete JSDoc annotation for a function
 * 
 * @param {FunctionSignature} signature - Function signature information
 * @param {string} moduleType - Module type for context
 * @param {TypeAnnotationConfig} [config] - Configuration options
 * 
 * @returns {string} Complete JSDoc annotation string
 * 
 * @example
 * // Generate JSDoc for a function
 * const signature = { name: 'calculateDamage', parameters: ['attacker', 'defender'], isExported: true };
 * const jsDoc = generateFunctionJSDoc(signature, 'engine_', { addInputValidation: true });
 * console.log(jsDoc); // Complete JSDoc string
 * 
 * @since 1.0.0
 * @public
 */
export function generateFunctionJSDoc(signature, moduleType, config = {}) {
    // Input validation
    if (!signature || typeof signature !== 'object') {
        throw new TypeError('generateFunctionJSDoc: signature must be an object');
    }
    
    if (typeof moduleType !== 'string') {
        throw new TypeError('generateFunctionJSDoc: moduleType must be a string');
    }

    /** @type {TypeAnnotationConfig} */
    const defaultConfig = {
        typeImports: [],
        addInputValidation: true,
        addJSDocExamples: true,
        moduleDescription: '',
        version: '1.0.0'
    };
    
    /** @type {TypeAnnotationConfig} */
    const finalConfig = { ...defaultConfig, ...config };

    /** @type {string[]} */
    const lines = [];
    
    // Start JSDoc
    lines.push('/**');
    
    // Description
    lines.push(` * ${signature.name} function`);
    lines.push(' * ');
    
    // Parameters
    if (signature.parameters && signature.parameters.length > 0) {
        const paramTypes = inferParameterTypes(signature.parameters, signature.name, moduleType);
        
        signature.parameters.forEach(param => {
            const type = paramTypes[param] || 'any';
            lines.push(` * @param {${type}} ${param} - ${param} parameter`);
        });
        lines.push(' * ');
    }
    
    // Return type
    if (signature.isAsync) {
        lines.push(` * @returns {Promise<${signature.returnType || 'void'}>} Promise result`);
    } else {
        lines.push(` * @returns {${signature.returnType || 'void'}} Function result`);
    }
    lines.push(' * ');
    
    // Error conditions
    if (finalConfig.addInputValidation) {
        lines.push(' * @throws {TypeError} When parameters are invalid');
        lines.push(' * ');
    }
    
    // Example
    if (finalConfig.addJSDocExamples) {
        lines.push(' * @example');
        lines.push(` * // Example usage of ${signature.name}`);
        const paramList = signature.parameters ? signature.parameters.join(', ') : '';
        lines.push(` * const result = ${signature.name}(${paramList});`);
        lines.push(' * ');
    }
    
    // Metadata
    lines.push(` * @since ${finalConfig.version}`);
    lines.push(` * @${signature.isExported ? 'public' : 'private'}`);
    lines.push(' */');
    
    return lines.join('\n');
}

/**
 * Parses JavaScript code to extract function signatures
 * 
 * @param {string} code - JavaScript code to parse
 * 
 * @returns {FunctionSignature[]} Array of function signatures found
 * 
 * @throws {TypeError} When code is not a string
 * 
 * @example
 * // Parse code for function signatures
 * const code = 'export function test(a, b) { return a + b; }';
 * const signatures = parseFunctionSignatures(code);
 * console.log(signatures[0].name); // 'test'
 * 
 * @since 1.0.0
 * @public
 */
export function parseFunctionSignatures(code) {
    // Input validation
    if (typeof code !== 'string') {
        throw new TypeError('parseFunctionSignatures: code must be a string');
    }

    /** @type {FunctionSignature[]} */
    const signatures = [];
    
    // Regular expressions for different function patterns
    /** @type {RegExp[]} */
    const patterns = [
        // export function name(params)
        /export\s+(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g,
        // function name(params)
        /^(?!.*export)\s*(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/gm,
        // export const name = function(params)
        /export\s+const\s+(\w+)\s*=\s*(async\s+)?function\s*\(([^)]*)\)/g,
        // const name = (params) => 
        /const\s+(\w+)\s*=\s*(async\s+)?\(([^)]*)\)\s*=>/g
    ];

    patterns.forEach(pattern => {
        /** @type {RegExpExecArray | null} */
        let match;
        
        while ((match = pattern.exec(code)) !== null) {
            /** @type {boolean} */
            const isAsync = match[1] ? match[1].trim() === 'async' : false;
            /** @type {string} */
            const name = match[2];
            /** @type {string} */
            const paramsString = match[3] || '';
            
            /** @type {string[]} */
            const parameters = paramsString
                .split(',')
                .map(p => p.trim().split('=')[0].trim()) // Remove default values
                .filter(p => p.length > 0);

            /** @type {boolean} */
            const isExported = match[0].startsWith('export');

            signatures.push({
                name,
                parameters,
                isExported,
                isAsync,
                returnType: 'any' // Would need more sophisticated analysis
            });
        }
    });

    return signatures;
}

/**
 * Adds type annotations to a JavaScript file
 * 
 * @param {string} code - Original JavaScript code
 * @param {string} filename - Filename for context
 * @param {TypeAnnotationConfig} [config] - Configuration options
 * 
 * @returns {TypeAnnotationResult} Result of annotation process
 * 
 * @throws {TypeError} When required parameters are invalid
 * 
 * @example
 * // Add type annotations to code
 * const result = addTypeAnnotations(originalCode, 'utils_math.js');
 * if (result.success) {
 *   console.log('Annotations added successfully');
 * }
 * 
 * @since 1.0.0
 * @public
 */
export function addTypeAnnotations(code, filename, config = {}) {
    // Input validation
    if (typeof code !== 'string') {
        throw new TypeError('addTypeAnnotations: code must be a string');
    }
    
    if (typeof filename !== 'string' || filename.length === 0) {
        throw new TypeError('addTypeAnnotations: filename must be a non-empty string');
    }

    /** @type {string[]} */
    const warnings = [];
    /** @type {string[]} */
    const errors = [];
    
    try {
        // Parse existing function signatures
        const signatures = parseFunctionSignatures(code);
        
        if (signatures.length === 0) {
            warnings.push('No function signatures found in code');
            return {
                success: true,
                warnings,
                errors,
                annotatedCode: code
            };
        }

        // Get module type for imports
        /** @type {string} */
        const modulePrefix = filename.split('_')[0] + '_';
        /** @type {string[]} */
        const typeImports = getModuleTypeImports(filename, config.typeImports || []);

        /** @type {string[]} */
        const codeLines = code.split('\n');
        /** @type {string[]} */
        const annotatedLines = [];

        // Add file header if not present
        if (!code.includes('@fileoverview')) {
            annotatedLines.push('/**');
            annotatedLines.push(` * @fileoverview ${config.moduleDescription || filename}`);
            annotatedLines.push(' * @description Auto-generated type annotations');
            annotatedLines.push(` * @version ${config.version || '1.0.0'}`);
            annotatedLines.push(' */');
            annotatedLines.push('');
            annotatedLines.push("'use strict';");
            annotatedLines.push('');
        }

        // Add type imports if not present
        if (typeImports.length > 0 && !code.includes('@typedef')) {
            annotatedLines.push('// --- TYPE IMPORTS ---');
            annotatedLines.push('/**');
            typeImports.forEach(type => {
                annotatedLines.push(` * @typedef {import('./types.js').${type}} ${type}`);
            });
            annotatedLines.push(' */');
            annotatedLines.push('');
        }

        // Process each line, adding JSDoc before function declarations
        for (let i = 0; i < codeLines.length; i++) {
            const line = codeLines[i];
            
            // Check if this line contains a function declaration
            const functionMatch = signatures.find(sig => 
                line.includes(`function ${sig.name}`) || 
                line.includes(`${sig.name} =`) ||
                line.includes(`${sig.name}(`)
            );

            if (functionMatch && !codeLines[i - 1]?.includes('/**')) {
                // Add JSDoc before function
                const jsDoc = generateFunctionJSDoc(functionMatch, modulePrefix, config);
                annotatedLines.push(jsDoc);
            }

            annotatedLines.push(line);
        }

        return {
            success: true,
            warnings,
            errors,
            annotatedCode: annotatedLines.join('\n')
        };

    } catch (error) {
        errors.push(error.message);
        return {
            success: false,
            warnings,
            errors,
            annotatedCode: code
        };
    }
} 