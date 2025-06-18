/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    /*
    This is an array of rules that can be used to explicitly forbid dependencies.
    Examples:
    {
      name: 'no-circular',
      severity: 'warn',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: '\\.d\\.ts$'
      },
      to: {},
    },
    {
      name: 'no-deprecated-core',
      comment: 'This rule forbids use of deprecated node core modules',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: [
          'core'
        ],
        path: '^(punycode|domain|constants|sys|_linklist|util|freelist)$'
      }
    }
    */
    {
      name: 'no-circular-dependencies',
      severity: 'warn',
      from: { path: '^src/js' },
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: '\\.d\\.ts$',
      },
      to: {},
    },
    {
      name: 'engine-cannot-import-ui',
      severity: 'error',
      from: { path: '^src/js/engine' },
      to: { path: '^src/js/ui' },
    },
    {
      name: 'ai-cannot-import-ui',
      severity: 'error',
      from: { path: '^src/js/ai' },
      to: { path: '^src/js/ui' },
    },
    {
      name: 'data-cannot-import-logic',
      severity: 'error',
      from: { path: '^src/js/data' },
      to: { path: ['^src/js/engine', '^src/js/ai', '^src/js/ui'] },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    moduleSystems: ['es6'],
    tsConfig: {
      fileName: 'jsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
      mainFields: ["main", "module", "browser"],
    },
  },
};