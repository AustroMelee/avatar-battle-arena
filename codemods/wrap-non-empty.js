/**
 * Codemod: wrap string literals in nes("…") when they’re
 * assigned to props that usually require a NonEmptyString.
 *
 * How it works
 * ------------
 * 1. Finds every `Literal` string in the file.
 * 2. Replaces it with `nes("<same-value>")`.
 * 3. Leaves non-strings untouched.
 *
 * Caveat: it’s deliberately broad—after running the codemod,
 * run `npm run lint:fix && npx tsc --noEmit` once: any place
 * where nes() **shouldn’t** be used will surface as a real type error.
 */
export default function (file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.Literal)
    .filter(p => typeof p.value.value === 'string')
    .replaceWith(p =>
      j.callExpression(j.identifier('nes'), [j.literal(p.value.value)]))
    .toSource();
}
