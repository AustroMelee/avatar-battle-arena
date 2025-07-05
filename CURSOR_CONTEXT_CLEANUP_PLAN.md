# .cursorcontext Compliance Cleanup Plan

## 🚨 Critical Issues Found

### 1. TypeScript Errors (81 errors in 31 files)
- **Unused imports**: 25+ unused import statements
- **Unused variables**: 30+ unused variable declarations
- **Unused parameters**: 20+ unused function parameters

### 2. Type Safety Violations
- **`any` type usage**: 15+ instances without `@ts-expect-error`
- **Unsafe type assertions**: Multiple instances in narrative services

### 3. Code Quality Issues
- **Console.log statements**: 50+ debug statements in production code
- **TODO/FIXME comments**: 10+ incomplete features
- **Unused code**: Multiple orphaned functions and variables

## 📋 Cleanup Priority Matrix

### 🔴 HIGH PRIORITY (Fix Immediately)
1. **TypeScript Errors** - Blocking compilation
2. **`any` type usage** - Type safety violations
3. **Unused imports** - Code hygiene

### 🟡 MEDIUM PRIORITY (Fix This Week)
1. **Console.log statements** - Remove debug code
2. **Unused variables** - Clean up dead code
3. **Unused parameters** - Fix function signatures

### 🟢 LOW PRIORITY (Fix When Time Permits)
1. **TODO/FIXME comments** - Complete incomplete features
2. **Code organization** - Improve structure
3. **Documentation** - Update comments

## 🛠️ Implementation Plan

### Phase 1: TypeScript Errors (Immediate)
- [ ] Remove all unused imports
- [ ] Fix unused variable declarations
- [ ] Add underscore prefix to unused parameters
- [ ] Remove unused function parameters

### Phase 2: Type Safety (Today)
- [ ] Replace `any` types with proper interfaces
- [ ] Add `@ts-expect-error` where necessary
- [ ] Create proper type definitions for narrative services

### Phase 3: Code Quality (This Week)
- [ ] Remove console.log statements
- [ ] Clean up TODO/FIXME comments
- [ ] Remove dead code and orphaned functions

### Phase 4: Documentation (Ongoing)
- [ ] Update JSDoc comments
- [ ] Improve inline documentation
- [ ] Create migration guides

## 📊 Current Status

### Files with Issues
- **31 files** have TypeScript errors
- **15 files** have `any` type usage
- **20+ files** have console.log statements
- **10+ files** have TODO/FIXME comments

### Compliance Score
- **TypeScript Strictness**: 6/10 (81 errors)
- **Type Safety**: 7/10 (15 any types)
- **Code Quality**: 8/10 (debug statements)
- **Documentation**: 9/10 (good JSDoc coverage)

## 🎯 Target Compliance Score
- **TypeScript Strictness**: 10/10 (0 errors)
- **Type Safety**: 10/10 (0 any types)
- **Code Quality**: 10/10 (no debug code)
- **Documentation**: 10/10 (complete coverage)

## 📁 Files Requiring Immediate Attention

### TypeScript Errors
1. `src/features/battle-simulation/services/battle/attackMove.service.ts`
2. `src/features/battle-simulation/services/battle/battleContext.service.ts`
3. `src/features/battle-simulation/services/battle/BattleLogger.ts`
4. `src/features/battle-simulation/services/narrative/core/BattleNarrationStrategyService.ts`
5. `src/features/battle-simulation/services/narrative/core/CharacterNarrativeRouter.ts`

### Type Safety Issues
1. `src/features/battle-simulation/services/narrative/stateDrivenNarrativePool.ts`
2. `src/features/battle-simulation/services/narrative/enhancedTemplateGenerator.ts`
3. `src/features/battle-simulation/services/narrative/core/emotions/EmotionalStateManager.ts`
4. `src/features/battle-simulation/services/narrative/core/EmotionalStateManager.ts`

### Debug Code
1. `src/features/battle-simulation/services/utils/moveUtils.ts`
2. `src/features/battle-simulation/services/narrative/utilityManager.ts`
3. `src/features/battle-simulation/services/battleSimulator.service.ts`
4. `src/features/battle-simulation/services/ai/tacticalAI.service.ts`

## 🔧 Next Steps
1. Start with Phase 1 (TypeScript errors)
2. Move to Phase 2 (Type safety)
3. Continue with Phase 3 (Code quality)
4. Complete with Phase 4 (Documentation)

## 📈 Success Metrics
- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] No `any` types without `@ts-expect-error`
- [ ] No console.log statements in production code
- [ ] All TODO/FIXME items addressed or documented
- [ ] 100% type coverage for all functions 