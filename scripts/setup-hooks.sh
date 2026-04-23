#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
HOOK_DIR="${REPO_ROOT}/.git/hooks"

mkdir -p "${REPO_ROOT}/scripts" "${HOOK_DIR}"

cat > "${HOOK_DIR}/pre-commit" <<'EOF'
#!/usr/bin/env bash
"$(git rev-parse --show-toplevel)/scripts/precommit-scan.sh"
exit $?
EOF

cat > "${HOOK_DIR}/pre-push" <<'EOF'
#!/usr/bin/env bash
"$(git rev-parse --show-toplevel)/scripts/prepush-scan.sh"
exit $?
EOF

chmod +x "${REPO_ROOT}/scripts/precommit-scan.sh"
chmod +x "${REPO_ROOT}/scripts/prepush-scan.sh"
chmod +x "${REPO_ROOT}/scripts/setup-hooks.sh"
chmod +x "${HOOK_DIR}/pre-commit"
chmod +x "${HOOK_DIR}/pre-push"

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "⚠️ Gitleaks not found."
  echo "   Install with: sudo apt install gitleaks"
  echo "   Or on macOS: brew install gitleaks"
fi

if ! command -v codeql >/dev/null 2>&1; then
  echo "⚠️ CodeQL CLI not found."
  echo "   Install guide: https://docs.github.com/code-security/codeql-cli/getting-started-with-the-codeql-cli"
fi

echo "✅ Security hooks installed successfully"
