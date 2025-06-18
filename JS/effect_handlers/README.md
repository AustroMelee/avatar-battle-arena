# Effect Handlers - Modular System

This directory contains the modular effect handlers system for the Avatar Battle Arena game engine. The system has been refactored from a monolithic file into specialized modules following the Single Responsibility Principle.

## File Structure

### Core Files

- **`index.js`** - Central export and handler map. Import this file to access the complete effect system.
- **`context.js`** - Unified context creator and mock context for testing.

### Handler Modules

- **`statHandlers.js`** - Stat-based effects (damage, heal, energy, momentum, stun, environmental)
- **`modifierHandlers.js`** - Modifier effects (evasion, damage, defense, accuracy modifiers)
- **`outcomeHandlers.js`** - Outcome effects (instant KO, conditional KO, trait toggle, curbstomp rules)
- **`narrativeHandlers.js`** - Narrative effects (AI profile adjustments, narrative events)
- **`compositeHandler.js`** - Composite effects that chain multiple sub-effects

### Configuration & Testing

- **`statChangeConfig.js`** - Configuration-driven stat change handlers
- **`test.js`** - Automated testing framework for all effect handlers

## Usage

### Basic Usage

```javascript
import { effectHandlers, createEffectContext } from './effect_handlers/index.js';

// Get a handler
const handler = effectHandlers.get('DAMAGE');

// Create context and apply effect
const context = createEffectContext(effect, actor, target, primaryTarget, battleState, oldValues, events);
const result = handler(context);
```

### Dynamic Registration

```javascript
import { registerEffectHandler, unregisterEffectHandler } from './effect_handlers/index.js';

// Register a custom effect
registerEffectHandler('MY_CUSTOM_EFFECT', (ctx) => {
    // Your custom logic here
    return { success: true, message: 'Custom effect applied!' };
});

// Unregister an effect
unregisterEffectHandler('MY_CUSTOM_EFFECT');
```

### Testing

```javascript
import { runAllEffectHandlerTests, testEffectHandler } from './effect_handlers/index.js';

// Test all handlers
const results = runAllEffectHandlerTests(effectHandlers);

// Test specific handler
const result = testEffectHandler('DAMAGE', effectHandlers, { value: 50 });
```

### Composite Effects

```javascript
// Create a "fireball" effect that does damage, applies burn, and causes knockback
const fireballEffect = {
    type: 'COMPOSITE_EFFECT',
    description: 'A devastating fireball attack',
    effects: [
        { type: 'DAMAGE', value: 30 },
        { type: 'DAMAGE_MODIFIER', value: -10, duration: 3 }, // Burn effect
        { type: 'STUN', duration: 1 } // Knockback
    ]
};
```

## Adding New Effects

1. **Simple stat effect**: Add configuration to `statChangeConfig.js`
2. **Complex effect**: Create handler in appropriate module
3. **Register**: Add to `index.js` effectHandlers Map
4. **Test**: Use testing framework to validate

## Benefits of Modular Structure

- **Maintainability**: Each file has a single responsibility
- **Extensibility**: Easy to add new effect types
- **Testability**: Isolated handlers are easier to test
- **Performance**: Faster imports, better tree-shaking
- **Team Development**: Multiple developers can work on different effect types
- **Code Discovery**: Clear file structure makes finding code intuitive

## Migration Notes

The old monolithic `engine_effect_handlers.js` has been split into this modular system while maintaining full backward compatibility. All existing effects continue to work unchanged. 