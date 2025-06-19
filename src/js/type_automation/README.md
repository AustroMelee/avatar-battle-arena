# Type Automation Module

## Overview

The Type Automation module is a developer tool designed to assist with the semi-automated annotation of the codebase with JSDoc types. It is **not** a runtime dependency of the application; rather, it's a set of scripts that can be run during development to parse JavaScript files, infer types, and generate JSDoc comment blocks.

The goal of this module is to reduce the manual effort required to maintain type safety in a large, JSDoc-based project.

## Architectural Constraints

- This module is a developer tool and should **never** be included in the main application bundle.
- It has no dependencies on the rest of the application's runtime code, though it does read the application's source files.
- It is designed to be run from the command line using a runner script (not yet implemented).

## Module Interaction

This module does not interact with the application at runtime. Its workflow is entirely at development time.

```mermaid
graph TD
    A[Developer] --> B[Runner Script (CLI)]
    B --> C{Type Automation Module}
    C --> D[Source Code Files]
    C --> E[Modified Source Code Files]
    E --> D

    subgraph Type Automation Module
        F[parser.js]
        G[inference.js]
        H[doc_generator.js]
        I[config.js]
    end

    B -- "Annotate 'engine.js'" --> C
    C -- "Reads" --> D
    F -- "Parses" --> D
    G -- "Infers types for" --> F
    H -- "Generates JSDoc for" --> G
    I -- "Provides config to" --> G
    C -- "Writes JSDoc to" --> E
```
1.  **Developer**: A developer runs a command-line script to process a file or directory.
2.  **Parser**: `parser.js` reads the specified file and uses regular expressions to find all function definitions.
3.  **Inference**: `inference.js` takes the parsed function signatures. It uses heuristics and the configuration in `config.js` to guess the types of the function's parameters (e.g., a parameter named `count` is inferred to be a `number`).
4.  **Doc Generator**: `doc_generator.js` takes the function signature and the inferred types and constructs a complete JSDoc comment block.
5.  **File Update**: The generated JSDoc block is then written back to the source file, above the corresponding function.

## Files

-   **`parser.js`**: Contains `parseFunctionSignatures`, which uses a series of regular expressions to find function declarations and arrow functions in a string of JavaScript code.
-   **`inference.js`**: Provides logic for guessing types. `inferParameterTypes` uses a set of common naming conventions (e.g., `id` -> `string`, `count` -> `number`) and module-specific configurations to determine the likely type for a given parameter name.
-   **`doc_generator.js`**: Contains `generateFunctionJSDoc`, which builds a complete JSDoc comment string, including `@param`, `@returns`, `@throws`, and other tags, based on a function's signature and the inferred types.
-   **`config.js`**: The configuration hub for the module. It contains `MODULE_TYPE_CONFIGS`, which hints at the common custom types used within certain modules (e.g., `engine_` files often use `Fighter` and `BattleState`), and `COMMON_TYPE_MAPPINGS` for common primitive types.

## Usage

This module is intended to be used via a command-line script.

**Note:** The runner script is not yet implemented. The following is a conceptual example.

```bash
# Example of how the tool might be used
node ./tools/type-annotator.js --file ./src/js/engine/damage_calculator.js --overwrite
```

**Conceptual `type-annotator.js`:**

```javascript
// tools/type-annotator.js
import fs from 'fs';
import { parseFunctionSignatures } from '../src/js/type_automation/parser.js';
import { generateFunctionJSDoc } from '../src/js/type_automation/doc_generator.js';

const filePath = process.argv[3]; // Get file path from command line
const code = fs.readFileSync(filePath, 'utf-8');

const signatures = parseFunctionSignatures(code);
let newCode = code;

for (const signature of signatures) {
    // A real implementation would need to be much more careful about replacing code
    // to avoid breaking existing JSDoc or the function itself.
    const jsdoc = generateFunctionJSDoc(signature, { addInputValidation: true, version: '2.0.0' });
    
    // This is a naive replacement and would need a more robust implementation.
    // It doesn't handle existing JSDoc blocks.
    const functionRegex = new RegExp(`function\\s+${signature.name}\\s*\\(`);
    newCode = newCode.replace(functionRegex, `${jsdoc}\nfunction ${signature.name}(`);
}

console.log(`Annotated ${signatures.length} functions in ${filePath}.`);
// In a real script, you would write `newCode` back to the file.
// fs.writeFileSync(filePath, newCode, 'utf-8');
``` 