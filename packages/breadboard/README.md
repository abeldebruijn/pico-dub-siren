# Breadboard compiler

Pure TypeScript compiler for Breadboard descriptions. It runs in Node and browsers, has no DOM dependency, and exposes one public interface.

The settled language extension is documented in [V0.2-SPEC.md](V0.2-SPEC.md).

## Interface

```ts
import { compile } from "@dub-siren/breadboard";

const result = compile(`breadboard Demo rows 2 columns 2\n`);

if (result.status === "valid") {
  console.log(result.model);
  console.log(result.svg);
}
```

Every result contains the recoverable Surface AST and ordered diagnostics:

- `valid`: Canonical Breadboard Model and byte-canonical SVG are available.
- `invalid`: language errors prevent a model and SVG.
- `unsupported`: valid input exceeds a safe numeric or resource limit.

Warnings do not prevent valid output. `compile(source)` is deterministic and performs no I/O.

## Conformance fixtures

Fixtures live in [`test/conformance/`](test/conformance/):

- `.bd` contains source input;
- `.diagnostics.json` contains normative ordered diagnostics;
- `.svg` exists for valid inputs and contains exact expected bytes.

The suite covers parsing and recovery, semantic resolution, routing, colours, serialization, and the approved Raspberry Pi Pico split-workbench specimen.

## Development

From the repository root:

```sh
pnpm --filter @dub-siren/breadboard test
pnpm --filter @dub-siren/breadboard build
pnpm --filter @dub-siren/breadboard generate:grammar
```

The generated railroad document is checked for freshness by the test command. Regenerate it only when the executable grammar changes.

This package is workspace-private. npm publication is intentionally out of scope.

## CLI

After building, a `breadboard` executable is available at `dist/cli/index.js`. Any workspace package that depends on `@dub-siren/breadboard` gets it linked into `node_modules/.bin/breadboard`; otherwise run it directly with Node:

```sh
pnpm --filter @dub-siren/breadboard build
node packages/breadboard/dist/cli/index.js <file.bd>
```

It compiles a `.bd` file (or `--text "<source>"`, or `-` for stdin), prints diagnostics with a one-line fix for each, and can emit the rendered SVG, Surface AST, or Canonical Breadboard Model:

```sh
breadboard diagram.bd --svg out/diagram.svg --model out/model.json
breadboard diagram.bd --suppress route.overlap,connection.duplicate
breadboard --explain component.polarity-warning
breadboard --help
```

Warnings (but not errors) can be suppressed by diagnostic code with `--suppress`. Run `breadboard --list-codes` for every documented diagnostic code, or `breadboard --explain <code>` for its cause and fix. See `breadboard --help` for the full option list.

## Editor integration

The course editor imports this package through the pnpm workspace and is available at `#/breadboard`. It keeps source in browser-local storage, retains the latest valid preview while new input is invalid, exposes Surface AST and Canonical Breadboard Model inspection, and downloads Canonical SVG without a backend.
