/**
 * Change   logNarrative("Aang", "text")
 *      →   logDialogue(aangVar, "text")
 *
 * Heuristic: any call where 1st arg is Aang|Azula|p1Name|p2Name gets flagged.
 */
module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  return j(fileInfo.source)
    .find(j.CallExpression, { callee: { name: "logNarrative" } })
    .forEach(path => {
      const [actorArg] = path.value.arguments;
      if (
        actorArg.type === "Literal" &&  // "Aang"
        /Aang|Azula/i.test(actorArg.value)
      ) {
        actorArg.raw = actorArg.value.toLowerCase();   // quick fix
        path.value.callee.name = "logDialogue";
      }
    })
    .toSource();
};
