module.exports = {
  meta: {
    type: "problem",
    docs: { description: "Disallow DialogueLogEntry outside UnifiedBattleLog" },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const isDialogue = /DialogueLogEntry(\.tsx?|$)/.test(node.source.value);
        const isUnified = context.getFilename().includes("UnifiedBattleLog");
        if (isDialogue && !isUnified) {
          context.report({
            node,
            message:
              "Importing DialogueLogEntry outside UnifiedBattleLog is forbidden. Use SingleLogEntry instead.",
          });
        }
      },
    };
  },
};
