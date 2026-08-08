#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { compile } from "../compile.js";
import type { Diagnostic } from "../types.js";
import { diagnosticHelp, DIAGNOSTIC_HELP } from "./diagnostics-help.js";

const HELP_TEXT = `Usage: breadboard [options] <file>
       breadboard [options] --text "<source>"
       breadboard [options] -            (read source from stdin)

Compile a Breadboard (.bd) source file and report diagnostics.

Input:
  <file>                  Path to a .bd source file
  --text <source>         Compile inline source text instead of a file
  -                       Read source from stdin

Output:
  --svg <path>            Write the rendered Canonical SVG to <path>
                           (parent directories are created as needed)
  --ast [path]             Print the Surface AST as JSON, or write it to <path>
  --model [path]           Print the Canonical Breadboard Model as JSON,
                           or write it to <path> (alias: --canonical)
  --json                  Print diagnostics as JSON instead of formatted text

Diagnostics:
  --suppress <codes>      Comma-separated list of warning codes to suppress
                           (error codes cannot be suppressed)
  --explain <code>        Print documentation for a diagnostic code and exit
  --list-codes             List every known diagnostic code with a summary

Other:
  --no-color               Disable ANSI colour in formatted output
  -h, --help                Show this help and exit

Exit codes:
  0   compiled without errors
  1   compiled with errors, or the input is unsupported
  2   usage error (bad arguments, missing file, etc.)
`;

type ParsedArgs = Readonly<{
  input: string | null;
  text: string | null;
  stdin: boolean;
  svgPath: string | null;
  astPath: string | null | undefined;
  modelPath: string | null | undefined;
  suppress: readonly string[];
  explain: string | null;
  listCodes: boolean;
  json: boolean;
  color: boolean;
  help: boolean;
}>;

class UsageError extends Error {}

function parseArgs(argv: readonly string[]): ParsedArgs {
  let input: string | null = null;
  let text: string | null = null;
  let stdin = false;
  let svgPath: string | null = null;
  let astPath: string | null | undefined;
  let modelPath: string | null | undefined;
  let suppress: string[] = [];
  let explain: string | null = null;
  let listCodes = false;
  let json = false;
  let color = process.stdout.isTTY === true;
  let help = false;

  const next = (flag: string, index: number): string => {
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("-")) {
      throw new UsageError(`Missing value for ${flag}`);
    }
    return value;
  };

  // An option's value is optional only when the following argument is
  // absent or itself looks like another flag.
  const optionalNext = (index: number): string | null => {
    const value = argv[index + 1];
    return value === undefined || value.startsWith("-") ? null : value;
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] as string;
    switch (arg) {
      case "-h":
      case "--help":
        help = true;
        break;
      case "--text":
        text = next(arg, index);
        index += 1;
        break;
      case "--svg":
        svgPath = next(arg, index);
        index += 1;
        break;
      case "--ast": {
        const value = optionalNext(index);
        astPath = value;
        if (value !== null) index += 1;
        break;
      }
      case "--model":
      case "--canonical": {
        const value = optionalNext(index);
        modelPath = value;
        if (value !== null) index += 1;
        break;
      }
      case "--suppress":
        suppress = next(arg, index)
          .split(",")
          .map((code) => code.trim())
          .filter((code) => code.length > 0);
        index += 1;
        break;
      case "--explain":
        explain = next(arg, index);
        index += 1;
        break;
      case "--list-codes":
        listCodes = true;
        break;
      case "--json":
        json = true;
        break;
      case "--no-color":
        color = false;
        break;
      case "-":
        stdin = true;
        break;
      default:
        if (arg.startsWith("-")) {
          throw new UsageError(`Unknown option: ${arg}`);
        }
        if (input !== null) {
          throw new UsageError(`Unexpected extra argument: ${arg}`);
        }
        input = arg;
        break;
    }
  }

  return {
    input,
    text,
    stdin,
    svgPath,
    astPath,
    modelPath,
    suppress,
    explain,
    listCodes,
    json,
    color,
    help,
  };
}

const ESC = "\u001b";

function paint(color: boolean, code: string, value: string): string {
  return color ? `${ESC}[${code}m${value}${ESC}[0m` : value;
}

function formatDiagnostic(diagnostic: Diagnostic, color: boolean): string {
  const { severity, code, message, range } = diagnostic;
  const location = `${range.start.line}:${range.start.column}`;
  const label = paint(
    color,
    severity === "error" ? "31;1" : "33;1",
    severity === "error" ? "error" : "warning",
  );
  const help = diagnosticHelp(code);
  const lines = [`${location} ${label} ${paint(color, "2", `[${code}]`)} ${message}`];
  if (help !== null) {
    lines.push(`    fix: ${help.fix}`);
  }
  return lines.join("\n");
}

function suppressDiagnostics(
  diagnostics: readonly Diagnostic[],
  codes: readonly string[],
): readonly Diagnostic[] {
  if (codes.length === 0) return diagnostics;
  const suppressible = new Set(codes);
  return diagnostics.filter(
    (diagnostic) =>
      !(diagnostic.severity === "warning" && suppressible.has(diagnostic.code)),
  );
}

async function writeOutput(path: string, content: string): Promise<void> {
  const dir = dirname(path);
  if (dir !== "." && dir !== "") {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(path, content, "utf8");
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function printExplain(code: string): number {
  const help = diagnosticHelp(code);
  if (help === null) {
    process.stderr.write(`Unknown diagnostic code: ${code}\n`);
    return 2;
  }
  process.stdout.write(
    `${code} - ${help.title}\n\nCause:\n  ${help.cause}\n\nFix:\n  ${help.fix}\n`,
  );
  return 0;
}

function printListCodes(): number {
  const codes = Object.keys(DIAGNOSTIC_HELP).sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  for (const code of codes) {
    process.stdout.write(`${code} - ${DIAGNOSTIC_HELP[code]?.title}\n`);
  }
  return 0;
}

async function main(argv: readonly string[]): Promise<number> {
  let args: ParsedArgs;
  try {
    args = parseArgs(argv);
  } catch (error) {
    if (error instanceof UsageError) {
      process.stderr.write(`${error.message}\n\n${HELP_TEXT}`);
      return 2;
    }
    throw error;
  }

  if (args.help) {
    process.stdout.write(HELP_TEXT);
    return 0;
  }

  if (args.listCodes) {
    return printListCodes();
  }

  if (args.explain !== null) {
    return printExplain(args.explain);
  }

  const sources = [args.input !== null, args.text !== null, args.stdin].filter(
    Boolean,
  ).length;
  if (sources === 0) {
    process.stderr.write(`No input provided.\n\n${HELP_TEXT}`);
    return 2;
  }
  if (sources > 1) {
    process.stderr.write(`Provide only one of: <file>, --text, or -.\n\n${HELP_TEXT}`);
    return 2;
  }

  const astToStdout = args.astPath === null;
  const modelToStdout = args.modelPath === null;
  if (astToStdout && modelToStdout) {
    process.stderr.write(
      `Cannot print both --ast and --model to stdout at once; give at least one an output path.\n`,
    );
    return 2;
  }
  const dataToStdout = astToStdout || modelToStdout;

  let source: string;
  try {
    source =
      args.text !== null
        ? args.text
        : args.stdin
          ? await readStdin()
          : await readFile(args.input as string, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Could not read input: ${message}\n`);
    return 2;
  }

  const result = compile(source);
  const diagnostics = suppressDiagnostics(result.diagnostics, args.suppress);

  // Reserve stdout for the requested AST/model JSON document when one is
  // printed without a path; diagnostics move to stderr so stdout stays a
  // single valid JSON document.
  const diagnosticsStream = dataToStdout ? process.stderr : process.stdout;
  if (args.json) {
    diagnosticsStream.write(
      `${JSON.stringify({ status: result.status, diagnostics }, null, 2)}\n`,
    );
  } else {
    for (const diagnostic of diagnostics) {
      diagnosticsStream.write(`${formatDiagnostic(diagnostic, args.color)}\n`);
    }
    if (diagnostics.length === 0) {
      diagnosticsStream.write(paint(args.color, "32", "No errors or warnings.\n"));
    }
  }

  // The Surface AST is available regardless of status, so honour --ast
  // even for invalid or unsupported input. The Canonical Model and SVG
  // only exist for valid results.
  if (args.astPath !== undefined) {
    const content = `${JSON.stringify(result.ast, null, 2)}\n`;
    if (args.astPath === null) {
      process.stdout.write(content);
    } else {
      await writeOutput(args.astPath, content);
    }
  }

  if (result.status === "unsupported") {
    process.stderr.write(`Unsupported input: ${result.reason.message}\n`);
    return 1;
  }

  if (result.status === "invalid") {
    return 1;
  }

  if (args.modelPath !== undefined) {
    const content = `${JSON.stringify(result.model, null, 2)}\n`;
    if (args.modelPath === null) {
      process.stdout.write(content);
    } else {
      await writeOutput(args.modelPath, content);
    }
  }

  if (args.svgPath !== null) {
    await writeOutput(args.svgPath, result.svg);
  }

  const hasErrors = diagnostics.some((diagnostic) => diagnostic.severity === "error");
  return hasErrors ? 1 : 0;
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    process.stderr.write(`Internal error: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    process.exitCode = 1;
  },
);
