module.exports = {
  meta: {
    type: "problem",
    docs: { description: "Disallow actor property on non-dialogue log creators (logMechanics, logSystem)" },
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (
          callee.type === 'Identifier' &&
          (callee.name === 'logMechanics' || callee.name === 'logSystem')
        ) {
          const arg = node.arguments[0];
          if (arg && arg.type === 'ObjectExpression') {
            const hasActor = arg.properties.some(
              prop => prop.type === 'Property' && prop.key.name === 'actor'
            );
            if (hasActor) {
              context.report({
                node: arg,
                message: `Passing 'actor' to ${callee.name} is forbidden unless type is 'dialogue'.`,
              });
            }
          }
        }
      },
    };
  },
}; 