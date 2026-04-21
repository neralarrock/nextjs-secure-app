# Next.js security demo

Minimal [Next.js](https://nextjs.org/) app (Pages Router + TypeScript) with environment-variable hygiene, GitHub CodeQL analysis, and notes on secret scanning.

## Run locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy the example env file and adjust values:

   ```bash
   cp .env.example .env.local
   ```

   Never commit `.env.local` — it is listed in `.gitignore`.

3. **Development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Production build**

   ```bash
   npm run build
   npm start
   ```

## Project layout

| Path | Purpose |
|------|---------|
| `pages/index.tsx` | Homepage (heading + button calling the API) |
| `pages/api/hello.ts` | Example API route (reads env on the server only) |
| `components/` | Reusable UI (e.g. `DemoButton`) |
| `.github/workflows/codeql.yml` | CodeQL on push/PR to `main` |
| `.env.example` | Documented template — safe to commit |

## How CodeQL works (short)

[CodeQL](https://codeql.github.com/) builds a database of your code and runs queries to find security issues and bugs. This repo’s workflow checks out the code, initializes CodeQL for JavaScript/TypeScript, installs dependencies, runs `npm run build` so the analyzer sees a full compile, then uploads results to GitHub’s **Security** tab (if the repo has permission to write security events).

Enable **Code scanning** under **Settings → Security → Code security and analysis** if it is not already on.

## GitHub Secret Scanning — what it is

**Secret Scanning** (for private repos and public repos on supported plans) detects known patterns (API keys, tokens, etc.) in pushes and often in pull requests. When it finds a match, GitHub can alert you and (for partners) notify the provider to revoke the credential.

### How to enable it

1. Open the repository on GitHub → **Settings**.
2. Go to **Security** → **Code security and analysis**.
3. Turn on **Secret scanning** (and optionally **Push protection** so risky commits are blocked before they land).

Org owners can enforce policies org-wide from organization settings.

### Why not commit `.env.local`

`.env.local` usually holds real secrets and machine-specific values. If it is committed:

- Anyone with repo access can read the history (including after “deleting” the file).
- Clones and forks spread the secret.
- Attackers who gain read access to the repo gain the keys.

**Example of a leaked key (fake — do not use):**

```text
sk_live_51AbCdEfGhIjKlMnOpQrStUvWxYz0123456789
```

If that were a real Stripe **live** secret key, an attacker could charge cards, refund money, or exfiltrate customer data. Rotating the key and auditing API usage would be required immediately.

Keep secrets in environment variables configured on the host (CI, Vercel, etc.), not in source control.

## Next.js security tips (basics)

- Prefer **server-only** variables for anything sensitive: names without `NEXT_PUBLIC_` are not exposed in the browser bundle; `NEXT_PUBLIC_*` is embedded in client-side code by design.
- Validate and sanitize all **API** and **form** inputs; never trust the client.
- Use **HTTPS** in production; set secure **cookie** flags for sessions.
- Keep **dependencies** updated (`npm audit`, Dependabot).
- Use this repo’s **CodeQL** workflow and enable **Secret scanning** on GitHub.

---

This project is intentionally small so you can extend it without fighting boilerplate.
