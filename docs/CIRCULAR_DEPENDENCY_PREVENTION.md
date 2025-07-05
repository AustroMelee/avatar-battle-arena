# Circular Dependency Prevention Guide

## Quick Reference

### 🚨 Red Flags (Avoid These)
```typescript
// ❌ DON'T: Eager module instantiation
export const myService = new MyService();

// ❌ DON'T: Bidirectional imports
// fileA.ts imports fileB.ts
// fileB.ts imports fileA.ts

// ❌ DON'T: Complex dependency chains
// serviceA → serviceB → serviceC → serviceA
```

### ✅ Best Practices (Use These)
```typescript
// ✅ DO: Lazy initialization
let instance: MyService | null = null;
export function getMyService(): MyService {
  if (!instance) {
    instance = new MyService();
  }
  return instance;
}

// ✅ DO: Factory functions
export function createService(config: Config): Service {
  return new Service(config);
}

// ✅ DO: Dependency injection
export class MyService {
  constructor(private dependency: DependencyService) {}
}
```

---

## Architecture Rules

### 1. **Dependency Direction**
```
Core → Services → Controllers → Components
```
- Dependencies should flow in one direction only
- Higher-level modules should not depend on lower-level modules

### 2. **Service Layer Rules**
- Services should be independent of each other
- Use interfaces to decouple implementations
- Avoid service-to-service imports when possible

### 3. **Module Loading**
- Keep module initialization lightweight
- Defer complex operations until runtime
- Use dynamic imports for breaking circular dependencies

---

## Detection Commands

### Check for Circular Dependencies
```bash
# Install madge globally
npm install -g madge

# Check for circular dependencies
madge --circular src/

# Generate dependency graph
madge --image dependency-graph.png src/
```

### TypeScript Compilation Check
```bash
# Check for compilation issues
npx tsc --noEmit --skipLibCheck
```

### ESLint Rules
```json
{
  "rules": {
    "import/no-cycle": "error",
    "import/no-self-import": "error",
    "import/no-useless-path-segments": "error"
  }
}
```

---

## Common Patterns

### Lazy Singleton Pattern
```typescript
let instance: MyService | null = null;

export function getMyService(): MyService {
  if (!instance) {
    instance = new MyService();
  }
  return instance;
}
```

### Dynamic Import Pattern
```typescript
export class MyService {
  private dependency: any;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    const { DependencyService } = await import('./DependencyService');
    this.dependency = new DependencyService();
  }

  async doSomething(): Promise<void> {
    await this.initPromise;
    // Use this.dependency
  }
}
```

### Factory Pattern
```typescript
export function createService(config: ServiceConfig): Service {
  return new Service(config);
}
```

---

## Testing Import Chains

### Module Loading Test
```typescript
// test/module-loading.test.ts
describe('Module Loading', () => {
  it('should load narrative service without circular dependencies', () => {
    expect(() => {
      require('../src/features/battle-simulation/services/narrative');
    }).not.toThrow();
  });

  it('should load battle services without circular dependencies', () => {
    expect(() => {
      require('../src/features/battle-simulation/services/battle');
    }).not.toThrow();
  });
});
```

---

## Emergency Fixes

### 1. **Immediate Fix: Lazy Initialization**
```typescript
// Replace this:
export const service = new Service();

// With this:
let serviceInstance: Service | null = null;
export function getService(): Service {
  if (!serviceInstance) {
    serviceInstance = new Service();
  }
  return serviceInstance;
}
```

### 2. **Dynamic Import Fix**
```typescript
// Replace this:
import { DependencyService } from './DependencyService';

// With this:
const { DependencyService } = await import('./DependencyService');
```

### 3. **Interface Decoupling**
```typescript
// Create interface
export interface INarrativeService {
  generateNarrative(): string;
}

// Use interface instead of concrete class
export class MyService {
  constructor(private narrativeService: INarrativeService) {}
}
```

---

## Monitoring Checklist

- [ ] Run `madge --circular src/` weekly
- [ ] Check TypeScript compilation errors
- [ ] Review new service imports
- [ ] Test module loading in CI/CD
- [ ] Document service dependencies
- [ ] Regular architecture reviews

---

## When to Refactor

1. **Multiple circular dependencies detected**
2. **Module loading takes too long**
3. **Services are tightly coupled**
4. **Testing becomes difficult**
5. **Code becomes hard to maintain**

---

**Remember**: Prevention is better than cure. Always design with dependency direction in mind! 