# Rules for the intentionally vulnerable baseline

1. Implement EXACTLY the vulnerabilities listed in docs/VULN_REGISTRY.md, each one realistic and exploitable end to end.
2. Everything NOT in the registry must follow secure best practice: parameterized queries, ownership checks,
   output escaping, input validation, proper error handling. This keeps scanner findings clean and traceable to the registry.
3. Do NOT fix, harden, mitigate or warn about a registry vulnerability, even if you consider it bad practice.
   Do not add helmet, rate limiting, sanitizers, parameterization or ownership checks where the registry says they are absent.
   If a requirement seems ambiguous or contradictory, ask instead of deciding.
4. Code must look like ordinary production code. No comments, variable names, log lines or TODOs that mention
   vulnerabilities, insecurity, "VULN", "unsafe" or "hack". Documentation of vulnerabilities lives only in docs/VULN_REGISTRY.md.
5. Secrets: FAKE values only, never real credentials, never values from my machine or environment.
   Allowed fake values are listed in the registry (V05).
6. The app binds to localhost / the Docker network only. README must start with a bold warning that the app
   is intentionally vulnerable and must never be exposed publicly.
7. Only standard OWASP vulnerability classes. No malware, no persistence, no self-propagation,
   no code that targets third-party systems.
8. Write functional happy-path tests only. Do NOT write security tests or exploit scripts; the team writes those.
9. After every spec, update docs/VULN_REGISTRY.md: the file, route and function where each vulnerability lives, and how to trigger it in one line.
10. Never refactor files outside the current spec's scope.