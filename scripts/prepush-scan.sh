#!/usr/bin/env bash
set -u

detect_codeql_language() {
  if [ -f "package.json" ]; then
    echo "javascript"
    return
  fi
  if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
    echo "python"
    return
  fi
  if [ -f "pom.xml" ] || [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]; then
    echo "java"
    return
  fi
  if [ -f "go.mod" ]; then
    echo "go"
    return
  fi
  if [ -f "Cargo.toml" ]; then
    echo "rust"
    return
  fi

  echo "javascript"
}

if ! command -v codeql >/dev/null 2>&1; then
  echo "⚠️ CodeQL CLI is not installed; skipping local pre-push CodeQL scan."
  echo "Install: https://docs.github.com/code-security/codeql-cli/getting-started-with-the-codeql-cli"
  exit 0
fi

LANGUAGE="$(detect_codeql_language)"
echo "Running CodeQL analysis for language: ${LANGUAGE}"

rm -rf codeql-db results.sarif

if ! codeql database create codeql-db --language="${LANGUAGE}" --source-root=. >/tmp/codeql-db-create.log 2>&1; then
  echo "❌ CodeQL database creation failed. Check /tmp/codeql-db-create.log"
  exit 1
fi

if ! codeql database analyze codeql-db codeql/"${LANGUAGE}"-queries --format=sarifv2.1.0 --output=results.sarif >/tmp/codeql-db-analyze.log 2>&1; then
  echo "❌ CodeQL analysis failed. Check /tmp/codeql-db-analyze.log"
  exit 1
fi

if [ ! -s results.sarif ]; then
  echo "✅ CodeQL: No issues found."
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "⚠️ Node.js not found to parse SARIF. Falling back to simple match."
  if rg '"ruleId"' results.sarif >/dev/null 2>&1; then
    echo "❌ CodeQL findings detected in results.sarif. Install Node.js to print detailed findings."
    exit 1
  fi
  echo "✅ CodeQL: No issues found."
  exit 0
fi

sarif_summary="$(node -e '
  const fs = require("fs");
  try {
    const raw = fs.readFileSync("results.sarif", "utf8");
    if (!raw || !raw.trim()) {
      process.stdout.write("clean");
      process.exit(0);
    }
    const data = JSON.parse(raw);
    const findings = [];
    for (const run of data.runs || []) {
      for (const res of run.results || []) {
        const ruleId = res.ruleId || "unknown-rule";
        const msg = (res.message && res.message.text) || "No message";
        findings.push(`${ruleId} :: ${msg}`);
      }
    }
    if (findings.length === 0) {
      process.stdout.write("clean");
    } else {
      process.stdout.write(findings.join("\n"));
    }
  } catch (e) {
    process.stdout.write("clean");
  }
')"

if [ "$sarif_summary" = "clean" ] || [ -z "$sarif_summary" ]; then
  echo "✅ CodeQL: No issues found."
  exit 0
fi

echo "❌ CodeQL findings detected. Fix before pushing:"
printf "%s\n" "$sarif_summary"
exit 1
