// @ts-nocheck
const { API, FileInfo, Options } = require('jscodeshift');

/**
 * Codemod to remove `actor` property from non-dialogue log creators (logStory, logMechanics, logSystem).
 * Only logDialogue is allowed to have an actor property.
 */
module.exports = function transformer(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Remove actor from logStory, logMechanics, logSystem calls
  root
    .find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: (name) => ['logStory', 'logMechanics', 'logSystem'].includes(name),
      },
    })
    .forEach(path => {
      const arg = path.node.arguments[0];
      if (arg && arg.type === 'ObjectExpression') {
        arg.properties = arg.properties.filter(
          prop => !(prop.type === 'ObjectProperty' && prop.key.type === 'Identifier' && prop.key.name === 'actor')
        );
      }
    });

  return root.toSource({ quote: 'single' });
}; 