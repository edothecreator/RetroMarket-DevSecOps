# Product
RetroMarket is a marketplace for second-hand vintage items (cameras, lenses, accessories).
Roles: buyer, seller, admin.

# IMPORTANT CONTEXT
This is an INTENTIONALLY VULNERABLE teaching application, in the spirit of DVWA and OWASP Juice Shop,
built for a university DevSecOps course. It will be scanned with SAST, SCA, secret scanning and DAST tools,
then hardened manually by students. It runs ONLY locally in Docker and is never deployed publicly.
The exact list of intended vulnerabilities is in docs/VULN_REGISTRY.md.

# Features
- Register, login, profile
- Browse and search listings, listing detail, create/edit/delete own listings with photos
- Cart and checkout with a MOCK payment (no real payment provider)
- Order history and order detail
- Admin panel: list users, change roles, ban users, delete listings
- AI assistant: seller description generator, buyer Q&A about a listing
- Web app (React) and mobile app (React Native / Expo) using the same REST API