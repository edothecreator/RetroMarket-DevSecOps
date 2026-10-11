# Threat Model: RetroMarket (Baseline v0)

## 1. System Architecture & Trust Boundaries
RetroMarket is structured as a local multi-tier application running via Docker Compose[cite: 1]:
* **Clients**: React Web App (browser local storage) and React Native Mobile App (Expo, plaintext AsyncStorage).
* **API Perimeter**: Node.js/Express REST API handling requests, business logic, file uploads (`./uploads`), and a mock LLM client.
* **Database Layer**: PostgreSQL 15 running plain SQL via the `pg` driver.

### Trust Boundaries
1. **Client to API**: Untrusted public/local network traffic interfacing with Express endpoints.
2. **API to File System / External**: Local storage handling unvalidated file uploads and server-side image fetching (SSRF target vector).
3. **API to Database**: Direct SQL execution layer containing intended injection and access-control vulnerabilities.

---

## 2. STRIDE Threat Analysis (Day 0 Baseline)

| Threat Category | System Component | Potential Threat Description | Registry Reference / Status |
|---|---|---|---|
| **Spoofing (S)** | Authentication & Tokens | Attackers could forge or reuse tokens due to weak secrets, lack of expiration, or insecure client-side token storage. | V04, M01[cite: 1] |
| **Tampering (T)** | User Profile & Checkout | Users can manipulate request bodies during updates or checkout to alter user roles or order calculations (zero/negative values). | V03, V11[cite: 1] |
| **Repudiation (R)** | Logging & Monitoring | Administrative actions, failed login attempts, and access denials lack proper logging and audit traces. | V12[cite: 1] |
| **Information Disclosure (I)** | Configuration & AI Module | Hardcoded credentials (DB password, AWS examples, internal AI keys) and verbose stack traces exposing application internals. | V05, V09, V13[cite: 1] |
| **Denial of Service (DoS)** | Auth, Checkout, & AI Endpoints | Absence of rate limiting or account lockout controls on resource-intensive or security-sensitive routes. | V08[cite: 1] |
| **Elevation of Privilege (EoP)** | Orders, Admin, & LLM Tools | Users can access/modify other users' orders via IDOR, bypass admin checks via unverified token decoding, or abuse AI tools without authorization. | V02, V04, V13[cite: 1] |

---

## 3. Key Attack Vectors & Intentional Vulnerabilities
Per our project specifications, the baseline intentionally incorporates baseline security flaws across layers to be remediated post-freeze (`v0-vulnerable`), including:
* **Injection flaws**: SQL injection via search/sort parameters[cite: 1] (V01) and Stored XSS via raw description rendering[cite: 1] (V10).
* **Supply Chain & Infrastructure**: Pinned vulnerable `lodash` version[cite: 1] (V06), unrestricted file uploads[cite: 1] (V07), and insecure container settings running as root[cite: 1] (V16).
* **Mobile Specifics**: Cleartext HTTP traffic, hardcoded config secrets, and unvalidated WebView deep links[cite: 1] (M02, M03, M04).