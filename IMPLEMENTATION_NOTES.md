# Implementation Notes — Issue #172

**Issue:** [DevOps] Interactive Swagger/OpenAPI V3 API Documentation
**Upstream:** https://github.com/BETAIL-BOYS/TradeFlow-API/issues/172

## Acceptance Criteria

**Description:** Implement a fully interactive API documentation site using the OpenAPI 3.0 specification, hosted dynamically on the API server itself (e.g., at `/api-docs`).
**Context / Motivation:** External developers integrating TradeFlow into their dApps or wallets need a clear, executable reference for our REST endpoints. A self-updating Swagger UI is the industry standard for developer onboarding.
**Acceptance Criteria:** - [ ] Write the `openapi.yaml` (or JSON/TS equivalent) detailing all public routes, request bodies, and response schemas.
- [ ] Integrate `swagger-ui-express` (or similar) to serve the documentation.
- [ ] Ensure JWT Bearer token authorization is configured in the Swagger UI so developers can test authenticated routes directly from their browser.
**Technical Pointers:** Consider using decorators or auto-generation tools (like `tsoa` or `swagger-autogen`) if the routing architecture supports it, minimizing the manual overhead of keeping the docs synced with code changes.

---
_Delete this file before merging._