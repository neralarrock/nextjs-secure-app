#!/usr/bin/env bash
set -u

if [ "${CI:-}" = "true" ]; then
  echo "CI=true detected, skipping local pre-commit secret scan."
  exit 0
fi

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "❌ Gitleaks is not installed. Install it first:"
  echo "   Ubuntu/Debian: sudo apt install gitleaks"
  echo "   macOS (Homebrew): brew install gitleaks"
  echo "Then run: git add . && git commit"
  exit 1
fi

echo "Running Gitleaks staged scan..."
scan_output="$(gitleaks detect --no-banner --redact --staged --config .gitleaks.toml 2>&1)"
scan_exit=$?

if [ $scan_exit -ne 0 ]; then
  echo "$scan_output"
  first_finding="$(printf "%s\n" "$scan_output" | awk '/File:|Secret:|RuleID:|StartLine:/{print}' | head -n 4)"
  if [ -n "$first_finding" ]; then
    echo "❌ Secret detected! Fix before committing."
    echo "$first_finding"
  else
    echo "❌ Secret detected! Fix before committing."
    echo "Remove secrets and use environment variables or a secrets manager. Then run: git add . && git commit"
  fi
  exit 1
fi

echo "✅ No secrets found."
exit 0
