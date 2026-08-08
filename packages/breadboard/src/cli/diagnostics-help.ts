export type DiagnosticHelp = Readonly<{
  title: string;
  cause: string;
  fix: string;
}>;

export const DIAGNOSTIC_HELP: Readonly<Record<string, DiagnosticHelp>> = {
  "syntax.bom": {
    title: "Byte-order mark is not allowed",
    cause: "The file starts with a UTF-8 byte-order mark (U+FEFF).",
    fix: "Re-save the file as UTF-8 without a byte-order mark. Most editors offer an \"UTF-8 (no BOM)\" encoding option.",
  },
  "syntax.unexpected-token": {
    title: "Unexpected token",
    cause: "A token appears where the grammar does not expect it — often a typo, stray character, or misplaced keyword.",
    fix: "Check the reported line for typos or misplaced punctuation. Compare the statement against the grammar in V0.2-SPEC.md.",
  },
  "syntax.unexpected-eof": {
    title: "Unexpected end of input",
    cause: "The file ends before a statement is complete, such as a missing value or a trailing partial line.",
    fix: "Finish the last statement in the file — check for a missing value, name, or closing member.",
  },
  "syntax.invalid-alias": {
    title: "Invalid pin alias",
    cause: "A pin alias inside a `pin` member is not a valid identifier.",
    fix: "Use a valid alias: letters, digits, `_`, or `-`, and do not start with a digit.",
  },
  "syntax.invalid-identifier": {
    title: "Invalid identifier",
    cause: "A declared name does not match the identifier pattern (letters/digits/`_`/`-`, not starting with a digit).",
    fix: "Rename it using only letters, digits, underscores, and hyphens, starting with a letter or underscore.",
  },
  "syntax.reserved-name": {
    title: "Reserved name",
    cause: "The name collides with a language keyword (for example `wire`, `led`, or `chip`).",
    fix: "Choose a different, non-reserved name for the component or instance.",
  },
  "syntax.invalid-integer": {
    title: "Invalid integer literal",
    cause: "An integer has leading zeroes or non-digit characters.",
    fix: "Write positive integers without leading zeroes, e.g. `12`, not `012`.",
  },
  "syntax.invalid-percentage": {
    title: "Invalid percentage literal",
    cause: "A percentage is outside 0%-100% or is not written as digits followed by `%`.",
    fix: "Use an integer percentage between 0% and 100%, e.g. `50%`.",
  },
  "syntax.invalid-decimal": {
    title: "Invalid decimal literal",
    cause: "A decimal number has leading zeroes or an unexpected format.",
    fix: "Write decimals without leading zeroes, e.g. `0`, `0.5`, `12.34`.",
  },
  "syntax.invalid-resistance": {
    title: "Invalid resistance literal",
    cause: "An ohm value has spaces, leading zeroes, or an unsupported suffix.",
    fix: "Write ohm values like `220`, `4.7k`, or `1M` — no spaces, no leading zeroes.",
  },
  "syntax.invalid-colour": {
    title: "Unknown colour",
    cause: "A named colour is not one of the supported names.",
    fix: "Use a supported name (black, red, brown, orange, yellow, green, forest, blue, cyan, purple, grey, white) or a hex colour such as `#ff0000`.",
  },
  "syntax.statement-order": {
    title: "Statement appears after a later document section",
    cause: "Breadboard documents follow a fixed section order: board, then chip definitions/placements/components, then wires, then annotations.",
    fix: "Move the statement into its correct section, or reorder surrounding statements to match: `breadboard` -> definitions/components -> `wire` -> `annotation`.",
  },
  "syntax.place-singleton": {
    title: "A singleton chip cannot be placed again",
    cause: "A chip declared inline with `chip` is a singleton and was also referenced by a separate `place` statement.",
    fix: "Either declare the chip with `chip-definition` and `place` it, or remove the redundant `place` statement.",
  },
  "document.multiple-boards": {
    title: "Only one breadboard declaration is allowed",
    cause: "The document declares more than one `breadboard` statement.",
    fix: "Keep a single `breadboard` declaration and remove or merge the duplicates.",
  },
  "name.duplicate": {
    title: "Name is already declared",
    cause: "Two declarations share the same name, compared case-insensitively.",
    fix: "Rename one of the declarations so every name in the document is unique.",
  },
  "name.forward-reference": {
    title: "Declared later in the document",
    cause: "A name is used before its declaration, which appears further down the file.",
    fix: "Move the declaration above its first use, or reorder the surrounding statements.",
  },
  "chip.member-order": {
    title: "Chip member appears out of order",
    cause: "Chip members must appear in the order: height, width, color, then pins.",
    fix: "Reorder the members to height -> width -> color -> pin.",
  },
  "chip.duplicate-property": {
    title: "Duplicate chip property",
    cause: "`height`, `width`, or `color` is declared more than once on the same chip.",
    fix: "Remove the duplicate line and keep a single declaration of the property.",
  },
  "chip.duplicate-pin": {
    title: "Duplicate pin declaration",
    cause: "The same pin number is declared twice on one chip.",
    fix: "Remove or renumber the duplicate `pin` entry.",
  },
  "chip.pin-order": {
    title: "Pin declarations must be ascending",
    cause: "In a chip definition, `pin` entries must be listed in strictly ascending numeric order.",
    fix: "Reorder the `pin` entries so their numbers ascend from top to bottom.",
  },
  "chip.duplicate-alias": {
    title: "Duplicate alias on one pin",
    cause: "The same alias name is assigned to more than one pin.",
    fix: "Rename one of the aliases so each alias is unique across the chip.",
  },
  "chip.height-not-inferable": {
    title: "Chip height cannot be inferred",
    cause: "The chip has no explicit `height` member, and either it has no pins, or its highest pin number is odd (a placed `chip` block can only infer height from an even highest pin number).",
    fix: "Add an explicit `height N` member, or make sure the highest pin number is even.",
  },
  "chip.width-out-of-range": {
    title: "Chip width exceeds the breadboard terminals",
    cause: "The declared (or default) width is less than 2 or greater than twice the breadboard's column count.",
    fix: "Set `width` between 2 and `columns * 2`, or increase the breadboard's `columns`.",
  },
  "chip.pin-out-of-range": {
    title: "Pin number exceeds the chip height",
    cause: "A `pin` entry's number is greater than `height * 2`.",
    fix: "Increase the chip's `height`, or renumber/remove the offending pin.",
  },
  "placement.unknown-chip": {
    title: "Unknown chip definition",
    cause: "A `place` statement references a chip-definition name that does not exist.",
    fix: "Check the spelling, or add a matching `chip <Name> { ... }` definition above the placement.",
  },
  "placement.row-overflow": {
    title: "Placement exceeds the breadboard rows",
    cause: "The component's footprint, starting at its declared row, extends past the last row of the breadboard.",
    fix: "Choose a lower starting row, or increase the breadboard's `rows`.",
  },
  "placement.overlap": {
    title: "Footprint overlaps an earlier placement",
    cause: "The component's holes overlap holes already used by another component or wire terminal.",
    fix: "Move the component to a free row, or remove/relocate the earlier conflicting placement.",
  },
  "selector.out-of-range": {
    title: "Selector is outside the breadboard",
    cause: "A rail row, terminal row/column, or annotation target references a position outside the breadboard's grid.",
    fix: "Use a row/column that exists on the board, or increase the breadboard's `rows`/`columns`.",
  },
  "selector.exact-hole-unavailable": {
    title: "Exact hole is unavailable",
    cause: "An explicitly numbered rail or terminal hole is already occupied by another component or wire.",
    fix: "Pick a different explicit hole, or remove/relocate whatever already occupies it.",
  },
  "selector.no-free-hole": {
    title: "Selector has no free hole",
    cause: "An unqualified selector (missing column, or a pin alias/number) could not find any free matching hole to allocate.",
    fix: "Free up a hole by removing conflicting wiring, or narrow the selector to an exact row/column or pin.",
  },
  "selector.unknown-instance": {
    title: "Unknown component instance",
    cause: "An endpoint references a component instance name that has not been declared.",
    fix: "Check the spelling, or add the missing component/placement declaration.",
  },
  "selector.unknown-pin": {
    title: "Unknown physical pin",
    cause: "A numeric pin reference does not exist on the target component or chip definition.",
    fix: "Use a pin number that exists on the component, or check its chip definition's `height`/`pin` entries.",
  },
  "selector.unknown-alias": {
    title: "Unknown pin alias",
    cause: "The referenced alias is not declared on any pin of the target chip.",
    fix: "Check the spelling, or add the alias to the chip definition's `pin` member.",
  },
  "selector.invalid-form": {
    title: "Wire endpoints are malformed",
    cause: "A `wire` statement does not have two well-formed endpoints (a `from` and a `to`).",
    fix: "Give the wire exactly two valid endpoints, e.g. `wire from ... to ...`.",
  },
  "selector.no-valid-pair": {
    title: "Wire endpoints cannot form a valid connection",
    cause: "No combination of candidate holes from the two endpoints can be legally connected.",
    fix: "Narrow the endpoint selectors (side/row/column, or an exact pin) so a specific valid pair of holes can be resolved.",
  },
  "route.point-not-exact": {
    title: "Route point is not exact",
    cause: "A `via` waypoint does not fully specify side and row (and column, for terminal points).",
    fix: "Give every `via` waypoint an explicit side, row, and (for terminal points) column.",
  },
  "route.point-not-hole": {
    title: "Route point is outside the breadboard",
    cause: "A `via` waypoint's row or column falls outside the breadboard's grid.",
    fix: "Use coordinates within the breadboard's `rows`/`columns`.",
  },
  "route.duplicate-point": {
    title: "Route repeats a point",
    cause: "Two consecutive points along the wire's path (from, via, or to) resolve to the same physical location.",
    fix: "Remove the redundant `via` point, or change it so it actually moves the route.",
  },
  "route.no-path": {
    title: "No automatic route is available",
    cause: "The automatic router could not find a path between the two exact endpoints.",
    fix: "Add explicit `via` waypoints that trace a valid path, or move one of the endpoints.",
  },
  "route.overlap": {
    title: "Wire route overlaps an earlier wire",
    cause: "This wire's rendered path runs along the same segment as an earlier wire. This is a warning only — it does not affect connectivity.",
    fix: "Add `via` waypoints to reroute the wire if you want a cleaner diagram, or leave it as-is if the overlap is acceptable.",
  },
  "connection.duplicate": {
    title: "Earlier wires already connect these electrical groups",
    cause: "This wire electrically connects two groups that an earlier wire already connects, making it redundant. This is a warning only.",
    fix: "Remove the redundant wire, or keep it if the duplicate connection is intentional (for example, for diagram clarity).",
  },
  "wire.redundant": {
    title: "Wire endpoints cannot form a valid connection",
    cause: "Both endpoints are fully specified (exact side/row/column or pin) but already resolve to the same electrical group, so no new connection is possible.",
    fix: "Point the wire at two different exact holes, or remove the wire.",
  },
  "component.same-group": {
    title: "Component endpoints resolve to the same electrical group",
    cause: "An LED, capacitor, or resistor's two endpoints resolve to holes that are already electrically connected — the component would short itself.",
    fix: "Choose endpoints on different rows or rails so the component actually spans a connection.",
  },
  "component.same-polarity-rail": {
    title: "Component endpoints cannot both use the same-polarity rail",
    cause: "Both terminals of a two-terminal component resolved to rails of the same polarity (both positive, or both ground).",
    fix: "Connect one terminal to the positive rail and the other to ground, or to a terminal row.",
  },
  "component.duplicate-property": {
    title: "Component property is declared more than once",
    cause: "A button, potentiometer, or switch declares the same property (for example `on`, `resistance`, or `options`) twice.",
    fix: "Remove the duplicate declaration and keep a single one per property.",
  },
  "component.polarity-warning": {
    title: "Polarity is directly connected to the opposite rail",
    cause: "An LED's cathode (or a polarized capacitor's negative lead) is wired directly to the positive rail, or its anode/positive lead directly to ground — the usual sign of reversed polarity. This is a warning only.",
    fix: "Double check the component's orientation. Swap the `from`/`to` endpoints if the polarity is actually reversed, or ignore the warning if this wiring is intentional.",
  },
  "led.duplicate-property": {
    title: "Component property cannot be repeated",
    cause: "An LED declares the same property (for example `color`, `on`, or `display-legs`) more than once.",
    fix: "Remove the duplicate declaration and keep a single one per property.",
  },
  "capacitor.duplicate-property": {
    title: "Component property cannot be repeated",
    cause: "A capacitor declares the same property (for example `type`, `color`, `capacitance`) more than once.",
    fix: "Remove the duplicate declaration and keep a single one per property.",
  },
  "resistor.duplicate-property": {
    title: "Component property cannot be repeated",
    cause: "A resistor declares the same property (for example `value`, `bands`) more than once.",
    fix: "Remove the duplicate declaration and keep a single one per property.",
  },
  "capacitor.invalid-capacitance": {
    title: "capacitance must be a positive value",
    cause: "The capacitor's `capacitance` value is missing, zero, negative, or otherwise not representable.",
    fix: "Give `capacitance` a positive decimal value, e.g. `capacitance 100`.",
  },
  "capacitor.invalid-max-voltage": {
    title: "max-voltage must be a positive value",
    cause: "The capacitor's `max-voltage` value is missing, zero, negative, or otherwise not representable.",
    fix: "Give `max-voltage` a positive decimal value, e.g. `max-voltage 16`.",
  },
  "capacitor.duplicate-displayed-value": {
    title: "Displayed value cannot be repeated",
    cause: "The same entry (`capacitance` or `max-voltage`) appears more than once in a capacitor's `displayed` list.",
    fix: "List each value at most once in `displayed`.",
  },
  "capacitor.displayed-not-declared": {
    title: "Displayed value must be declared",
    cause: "A capacitor's `displayed` list names a value (`capacitance` or `max-voltage`) that the capacitor does not itself declare.",
    fix: "Declare the corresponding property on the capacitor before listing it in `displayed`, or remove it from `displayed`.",
  },
  "resistor.value-required": {
    title: "Resistor value is required",
    cause: "The resistor has no `value` member.",
    fix: "Add a `value` member with a positive resistance, e.g. `value 220`.",
  },
  "resistor.invalid-value": {
    title: "value must be a positive value",
    cause: "The resistor's `value` is missing, zero, negative, or otherwise not representable.",
    fix: "Give `value` a positive resistance, e.g. `value 4.7k`.",
  },
  "resistor.invalid-bands": {
    title: "Resistor bands must be 4, 5, or 6",
    cause: "The resistor's `bands` member is not 4, 5, or 6.",
    fix: "Set `bands` to 4, 5, or 6, or remove it to use the default of 4.",
  },
  "resistor.value-not-representable": {
    title: "Value cannot be represented by the selected band count",
    cause: "The resistor's resistance cannot be expressed exactly with the chosen number of colour bands.",
    fix: "Round the value to something representable at this band count, or use a band count (`bands 5` or `bands 6`) with more precision.",
  },
  "control.invalid-pins-per-side": {
    title: "Button pins-per-side must be a positive integer",
    cause: "A button's `pins-per-side` member is missing, zero, or negative.",
    fix: "Give `pins-per-side` a positive integer, e.g. `pins-per-side 2`.",
  },
  "control.invalid-resistance": {
    title: "Potentiometer resistance must be greater than zero",
    cause: "A potentiometer's `resistance` member is missing, zero, or negative.",
    fix: "Give `resistance` a positive value, e.g. `resistance 10k`.",
  },
  "control.invalid-value": {
    title: "Control value is out of range",
    cause: "A potentiometer's `value` is not between 0 and 1, or a switch's `value` does not select one of its declared `options`.",
    fix: "For a potentiometer, use a decimal from 0 through 1. For a switch, use an integer from 1 through `options`.",
  },
  "control.invalid-options": {
    title: "Switch options must be at least 2",
    cause: "A switch's `options` member is missing or less than 2.",
    fix: "Give `options` an integer of 2 or more.",
  },
  "annotation.duplicate-number": {
    title: "Annotation number is already declared",
    cause: "Two `annotation` statements use the same number.",
    fix: "Renumber one of the annotations so every annotation number is unique.",
  },
  "annotation.target-not-exact": {
    title: "Annotation target must identify an exact endpoint",
    cause: "The annotation's target does not resolve to exactly one physical hole — it is missing a side/column, or a pin alias resolves to more than one pin.",
    fix: "Target an exact rail/terminal position, or a pin/alias that resolves to a single physical pin.",
  },
};

export function diagnosticHelp(code: string): DiagnosticHelp | null {
  return DIAGNOSTIC_HELP[code] ?? null;
}
