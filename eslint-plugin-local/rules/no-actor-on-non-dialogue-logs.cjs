module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow actor property in non-dialogue log creators',
      category: 'log-hygiene',
      recommended: true,
    },
    schema: [],
    messages: {
      noActor: 'Only logDialogue may have an actor property. Remove actor from {{func}} call.'
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === 'Identifier' &&
          ['logStory', 'logMechanics', 'logSystem'].includes(callee.name)
        ) {
          const arg = node.arguments[0];
          if (arg && arg.type === 'ObjectExpression') {
            for (const prop of arg.properties) {
              if (
                prop.type === 'Property' &&
                prop.key.type === 'Identifier' &&
                prop.key.name === 'actor'
              ) {
                context.report({
                  node: prop,
                  messageId: 'noActor',
                  data: { func: callee.name },
                });
              }
            }
          }
        }
      }
    };
  }
}; 