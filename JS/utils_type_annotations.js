/**
 * @fileoverview Type Annotation Utilities
 * @description Utilities to help add comprehensive type annotations to the codebase
 * @version 1.0.0
 */

'use strict';

/**
 * @typedef {Object} TypeAnnotationConfig
 * @description Configuration for type annotation generation
 * @property {string[]} commonImports - Common type imports to add
 * @property {boolean} addInputValidation - Whether to add input validation
 * @property {boolean} addExamples - Whether to add usage examples
 * @property {string} modulePrefix - Module prefix for logging
 */

/**
 * Common type imports template for battle system modules
 * @type {string[]}
 */
export const COMMON_BATTLE_IMPORTS = [
    "Fighter",
    "BattleState", 
    "PhaseState",
    "BattleEvent",
    "BattleResult",
    "MoveResult",
    "Effect"
];

/**
 * Common type imports template for UI modules
 * @type {string[]}
 */
export const COMMON_UI_IMPORTS = [
    "UIState",
    "SelectionState", 
    "RenderState",
    "AnimationState",
    "InteractionState"
];

/**
 * Common type imports template for utility modules
 * @type {string[]}
 */
export const COMMON_UTILITY_IMPORTS = [
    "ValidationResult",
    "ConfigOptions",
    "ErrorContext",
    "LogContext"
];

/**
 * Generates type import statements for a module
 * 
 * @param {string[]} typeNames - Array of type names to import
 * @returns {string} Generated import statements
 * 
 * @example
 * // Generate imports for battle module
 * const imports = generateTypeImports(['Fighter', 'BattleState']);
 * console.log(imports);
 * // Output:
 * // /**
 * //  * @typedef {import('./types.js').Fighter} Fighter
 * //  * @typedef {import('./types.js').BattleState} BattleState
 * //  *\/
 */
export function generateTypeImports(typeNames) {
    if (!Array.isArray(typeNames) || typeNames.length === 0) {
        return '';
    }

    const imports = typeNames.map(typeName => 
        ` * @typedef {import('./types.js').${typeName}} ${typeName}`
    ).join('\n');

    return `/**\n${imports}\n */`;
}

/**
 * Generates a complete function annotation template
 * 
 * @param {string} functionName - Name of the function
 * @param {Object[]} parameters - Function parameters
 * @param {string} parameters[].name - Parameter name
 * @param {string} parameters[].type - Parameter type
 * @param {string} [parameters[].description] - Parameter description
 * @param {boolean} [parameters[].optional] - Whether parameter is optional
 * @param {string} returnType - Return type
 * @param {string} [returnDescription] - Return value description
 * @param {string[]} [throwsTypes] - Error types that can be thrown
 * @param {string} [description] - Function description
 * @param {string} [version] - Version when function was added
 * @param {boolean} [isPublic=true] - Whether function is public
 * 
 * @returns {string} Generated JSDoc annotation
 * 
 * @example
 * // Generate annotation for a battle function
 * const annotation = generateFunctionAnnotation('calculateDamage', [
 *   { name: 'attacker', type: 'Fighter', description: 'Attacking fighter' },
 *   { name: 'defender', type: 'Fighter', description: 'Defending fighter' },
 *   { name: 'move', type: 'Move', description: 'Move being used' }
 * ], 'MoveResult', 'Result of move calculation');
 */
export function generateFunctionAnnotation(
    functionName, 
    parameters = [], 
    returnType = 'void', 
    returnDescription = '',
    throwsTypes = [],
    description = '',
    version = '1.0',
    isPublic = true
) {
    // Input validation
    if (typeof functionName !== 'string') {
        throw new TypeError('functionName must be a string');
    }
    if (!Array.isArray(parameters)) {
        throw new TypeError('parameters must be an array');
    }
    if (typeof returnType !== 'string') {
        throw new TypeError('returnType must be a string');
    }

    const lines = ['/**'];
    
    // Description
    if (description) {
        lines.push(` * @description ${description}`);
    }
    
    // Parameters
    parameters.forEach(param => {
        const optional = param.optional ? '[]' : '';
        const typeAnnotation = `{${param.type}} ${optional}`;
        const desc = param.description || `${param.name} parameter`;
        lines.push(` * @param ${typeAnnotation} ${param.name} - ${desc}`);
    });
    
    // Return type
    if (returnType !== 'void') {
        const retDesc = returnDescription || `${returnType} result`;
        lines.push(` * @returns {${returnType}} ${retDesc}`);
    } else {
        lines.push(' * @returns {void}');
    }
    
    // Throws
    throwsTypes.forEach(errorType => {
        lines.push(` * @throws {${errorType}} When validation fails`);
    });
    
    // Example placeholder
    lines.push(' * @example');
    lines.push(` * // Example usage of ${functionName}`);
    lines.push(` * const result = ${functionName}(${parameters.map(p => p.name).join(', ')});`);
    
    // Metadata
    lines.push(` * @since ${version}`);
    lines.push(` * @${isPublic ? 'public' : 'private'}`);
    lines.push(' */');
    
    return lines.join('\n');
}

/**
 * Generates input validation code for function parameters
 * 
 * @param {Object[]} parameters - Function parameters to validate
 * @param {string} parameters[].name - Parameter name
 * @param {string} parameters[].type - Expected parameter type
 * @param {boolean} [parameters[].optional] - Whether parameter is optional
 * @param {string} [parameters[].customValidation] - Custom validation logic
 * @param {string} [functionName] - Function name for error messages
 * 
 * @returns {string} Generated validation code
 * 
 * @example
 * // Generate validation for battle function
 * const validation = generateInputValidation([
 *   { name: 'fighter', type: 'object', customValidation: 'fighter.id' },
 *   { name: 'damage', type: 'number' }
 * ], 'dealDamage');
 */
export function generateInputValidation(parameters, functionName = 'function') {
    if (!Array.isArray(parameters)) {
        return '';
    }

    /** @type {string[]} */
    const validationLines = [];
    
    parameters.forEach(param => {
        if (param.optional) {
            validationLines.push(`    // Optional parameter: ${param.name}`);
            validationLines.push(`    if (${param.name} !== undefined) {`);
        }

        const indent = param.optional ? '        ' : '    ';
        
        switch (param.type.toLowerCase()) {
            case 'string':
                validationLines.push(`${indent}if (typeof ${param.name} !== 'string' || ${param.name}.length === 0) {`);
                validationLines.push(`${indent}    throw new TypeError('${functionName}: ${param.name} must be a non-empty string');`);
                validationLines.push(`${indent}}`);
                break;
                
            case 'number':
                validationLines.push(`${indent}if (typeof ${param.name} !== 'number' || isNaN(${param.name})) {`);
                validationLines.push(`${indent}    throw new TypeError('${functionName}: ${param.name} must be a valid number');`);
                validationLines.push(`${indent}}`);
                break;
                
            case 'boolean':
                validationLines.push(`${indent}if (typeof ${param.name} !== 'boolean') {`);
                validationLines.push(`${indent}    throw new TypeError('${functionName}: ${param.name} must be a boolean');`);
                validationLines.push(`${indent}}`);
                break;
                
            case 'array':
                validationLines.push(`${indent}if (!Array.isArray(${param.name})) {`);
                validationLines.push(`${indent}    throw new TypeError('${functionName}: ${param.name} must be an array');`);
                validationLines.push(`${indent}}`);
                break;
                
            case 'object':
                validationLines.push(`${indent}if (!${param.name} || typeof ${param.name} !== 'object') {`);
                validationLines.push(`${indent}    throw new TypeError('${functionName}: ${param.name} must be an object');`);
                validationLines.push(`${indent}}`);
                
                if (param.customValidation) {
                    validationLines.push(`${indent}if (!${param.customValidation}) {`);
                    validationLines.push(`${indent}    throw new TypeError('${functionName}: ${param.name} validation failed');`);
                    validationLines.push(`${indent}}`);
                }
                break;
                
            case 'function':
                validationLines.push(`${indent}if (typeof ${param.name} !== 'function') {`);
                validationLines.push(`${indent}    throw new TypeError('${functionName}: ${param.name} must be a function');`);
                validationLines.push(`${indent}}`);
                break;
        }
        
        if (param.optional) {
            validationLines.push('    }');
        }
        
        validationLines.push(''); // Empty line for readability
    });
    
    return validationLines.join('\n');
}

/**
 * Generates a complete module header with type imports and file documentation
 * 
 * @param {string} fileName - File name
 * @param {string} description - Module description
 * @param {string[]} typeImports - Types to import
 * @param {string} [version='1.0'] - Module version
 * 
 * @returns {string} Generated module header
 */
export function generateModuleHeader(fileName, description, typeImports, version = '1.0') {
    const header = [
        '/**',
        ` * @fileoverview ${fileName}`,
        ` * @description ${description}`,
        ` * @version ${version}`,
        ' */',
        '',
        "'use strict';",
        '',
        '//# sourceURL=' + fileName,
        ''
    ];
    
    if (typeImports && typeImports.length > 0) {
        header.push('// --- TYPE IMPORTS ---');
        header.push(generateTypeImports(typeImports));
        header.push('');
    }
    
    return header.join('\n');
}

/**
 * Configuration templates for different module types
 * @type {Object<string, TypeAnnotationConfig>}
 */
export const MODULE_CONFIGS = {
    battle: {
        commonImports: COMMON_BATTLE_IMPORTS,
        addInputValidation: true,
        addExamples: true,
        modulePrefix: '[Battle Engine]'
    },
    ui: {
        commonImports: COMMON_UI_IMPORTS,
        addInputValidation: true,
        addExamples: true,
        modulePrefix: '[UI]'
    },
    utility: {
        commonImports: COMMON_UTILITY_IMPORTS,
        addInputValidation: true,
        addExamples: true,
        modulePrefix: '[Utility]'
    },
    data: {
        commonImports: [],
        addInputValidation: false,
        addExamples: false,
        modulePrefix: '[Data]'
    }
};

/**
 * Quick helper to get type annotation patterns for common scenarios
 * @type {Object<string, string>}
 */
export const QUICK_ANNOTATIONS = {
    // Common parameter patterns
    fighter: '@param {Fighter} fighter - Fighter object',
    battleState: '@param {BattleState} battleState - Current battle state',
    moveResult: '@returns {MoveResult} Move execution result',
    
    // Common validation patterns
    stringValidation: 'if (typeof param !== "string") throw new TypeError("Expected string");',
    numberValidation: 'if (typeof param !== "number") throw new TypeError("Expected number");',
    objectValidation: 'if (!param || typeof param !== "object") throw new TypeError("Expected object");'
};

// Export the module
export default {
    generateTypeImports,
    generateFunctionAnnotation,
    generateInputValidation,
    generateModuleHeader,
    MODULE_CONFIGS,
    QUICK_ANNOTATIONS,
    COMMON_BATTLE_IMPORTS,
    COMMON_UI_IMPORTS,
    COMMON_UTILITY_IMPORTS
}; 