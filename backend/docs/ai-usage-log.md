# AI Usage Log

## Day 0
- Tool: Kiro
- Purpose: Repository and security configuration
- Prompt used: "Check if the Day 0 setup checklist is complete, then fix the local gaps."
- What was reviewed: Git repo and remote state, steering files, docs (VULN_REGISTRY, threat-model, ai-usage-log), README warning, ESLint security config, CODEOWNERS and PR template.
- What was changed manually:
  - Fixed `.github/CODEOWNERS` to assign an actual owner (`@edothecreator`); the previous file had a path with no owner and assigned no reviewers.
  - Added `.gitleaks.toml` secret-scanning config (extends default rules; exempts only `docs/VULN_REGISTRY.md` so planted secrets in source are still reported).
  - Added `.github/workflows/security-scan.yml` to run Gitleaks and eslint-plugin-security on push/PR to `main`.
  - Added a `lint` script to `package.json`.
  - Renamed `README` to `README.md` so it renders on GitHub.
- Not done by AI (requires GitHub web/API access): branch protection on `main` and "require PR review" must be set in GitHub repo settings.
