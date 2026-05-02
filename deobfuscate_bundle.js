#!/usr/bin/env node
/*
 * Readability-focused deobfuscator for the Lilith Bun bundle.
 * It resolves the top-level string decoder and in-scope aliases such as:
 *   var J = p;
 *   return { metadata: { name: J(1234) } }
 */

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const t = require("@babel/types");

function decodeTableString(value) {
  const decoded = Buffer.from(value, "base64").toString("utf8");
  try {
    return decodeURIComponent(
      Array.from(decoded, (ch) =>
        "%" + ch.charCodeAt(0).toString(16).padStart(2, "0"),
      ).join(""),
    );
  } catch {
    return decoded;
  }
}

function extractDecoder(source) {
  const offsetMatch = source.match(/function\s+b\(Z,\s*J\)\s*\{\s*Z\s*=\s*Z\s*-\s*(\d+);/);
  if (!offsetMatch) {
    throw new Error("Could not find decoder offset in function b()");
  }
  const offset = Number(offsetMatch[1]);

  const qrStart = source.indexOf("function QR()");
  if (qrStart === -1) {
    throw new Error("Could not find QR() string table");
  }
  const arrayStart = source.indexOf("[", qrStart);
  const arrayEnd = source.indexOf("];", arrayStart);
  if (arrayStart === -1 || arrayEnd === -1) {
    throw new Error("Could not locate QR() array literal");
  }

  const arrayLiteral = source.slice(arrayStart, arrayEnd + 1);
  // The table is a plain array of string literals.
  const encoded = Function(`"use strict"; return (${arrayLiteral});`)();
  const decoded = encoded.map(decodeTableString);

  return {
    offset,
    decode(index) {
      return decoded[index - offset];
    },
    count: decoded.length,
  };
}

function hasDecoderBinding(path, name) {
  const binding = path.scope.getBinding(name);
  if (!binding) {
    return name === "p" || name === "b";
  }

  const declarator = binding.path;
  if (declarator.isVariableDeclarator()) {
    const init = declarator.node.init;
    return (
      t.isIdentifier(init, { name: "p" }) || t.isIdentifier(init, { name: "b" })
    );
  }

  return false;
}

function main() {
  const input = process.argv[2];
  const output = process.argv[3];
  if (!input || !output) {
    throw new Error("usage: deobfuscate_bundle.js <input.js> <output.js>");
  }

  const source = fs.readFileSync(input, "utf8");
  const decoder = extractDecoder(source);
  const ast = parser.parse(source, {
    sourceType: "module",
    plugins: ["importMeta", "topLevelAwait"],
    errorRecovery: true,
  });

  let replacements = 0;
  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      if (!t.isIdentifier(node.callee)) {
        return;
      }
      if (node.arguments.length !== 1 || !t.isNumericLiteral(node.arguments[0])) {
        return;
      }
      if (!hasDecoderBinding(path, node.callee.name)) {
        return;
      }

      const decoded = decoder.decode(node.arguments[0].value);
      if (typeof decoded !== "string") {
        return;
      }

      path.replaceWith(t.stringLiteral(decoded));
      replacements += 1;
    },
  });

  const banner = [
    "/*",
    " * Readability-focused deobfuscation output.",
    ` * Input: ${path.resolve(input)}`,
    ` * Decoder strings: ${decoder.count}`,
    ` * Replaced decoder call sites: ${replacements}`,
    " */",
    "",
  ].join("\n");

  const generated = generate(
    ast,
    {
      comments: true,
      compact: false,
      retainLines: false,
      jsescOption: { minimal: true },
    },
    source,
  );

  fs.writeFileSync(output, banner + generated.code);
  process.stderr.write(
    `decoded ${decoder.count} strings, replaced ${replacements} call sites\n`,
  );
}

main();
