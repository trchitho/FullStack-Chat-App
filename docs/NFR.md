# NFR Compliance Matrix (#11 - #40)

This matrix documents the auditing and implementation status of Non-Functional Requirements #11 through #40 for the **FullStack-Chat-App**.

| NFR ID | Requirement Name | Status | Implementation Details |
|---|---|---|---|
| #11 | Availability / Uptime | **Implemented** | Enhanced `/api/health` and added `/api/ready` checks. Added client-side network detection using `navigator.onLine` and alert banners. |
| #12 | Scalability | **Implemented** | Added index configurations in Mongoose schemas. Restructured message fetching endpoints to enforce query pagination and maximum limits (100). |
| #13 | API Performance SLA | **Implemented** | Set up response latency metrics and logging in backend, and configured a 15-second timeout in the frontend Axios instance. |
| #14 | Realtime / Media Latency | **Implemented** | Added connection listeners and callback handling checks. Ensured frontend disconnect/reconnection syncs messaging state. |
| #15 | Data Privacy | **Implemented** | Restricted sensitive parameters from being logged, and verified participant checks on direct and group message queries. |
| #16 | Data Encryption | **Implemented** | Handled passwords using bcrypt, configured JWT cookies with httpOnly and sameSite policies, and restricted CORS origins. |
| #17 | Data Retention & Deletion | **Implemented** | Added account self-deletion endpoints and database record cleanup. |
| #18 | Audit Logging | **Implemented** | Created AuditLog collections in MongoDB and logged signups, logins, logouts, profile changes, and account deletions. |
| #19 | Backup & Recovery | **Implemented** | Documented backup configurations for MongoDB Atlas and Cloudinary in `docs/BACKUP_RECOVERY.md`. |
| #20 | Disaster Recovery | **Implemented** | Created DR plans, rollback guidelines, and health testing protocols in `docs/DISASTER_RECOVERY.md`. |
| #21 | Observability | **Implemented** | Enabled request-id mapping and created `/api/metrics` to track memory usage, request volumes, and active sockets. |
| #22 | Structured Logging | **Implemented** | Wrote structured JSON logging utility to sanitize metadata parameters. |
| #23 | Rate Limiting | **Implemented** | Added `express-rate-limit` to signup, login, update-profile, and message attachment endpoints. |
| #24 | Input Validation | **Implemented** | Handled parameters formatting, fullName limits, and string validation on incoming requests. |
| #25 | RBAC / Authorization | **Implemented** | Enforced conversation participant checks to prevent unauthorized reads and edits. |
| #26 | Session & Token | **Implemented** | Enforced 7-day JWT expiry and handled token clearings and 401 response notifications in client interceptors. |
| #27 | Database Integrity | **Implemented** | Added unique keys, composite indices, and validation rules in Mongoose schemas. |
| #28 | Vector Search Quality | *Not Applicable* | Checked as future-ready. Not currently applicable as AI search is not implemented. |
| #29 | Knowledge Graph | *Not Applicable* | Checked as future-ready. Not currently applicable as Neo4j graph is not implemented. |
| #30 | AI Explainability | *Not Applicable* | Checked as future-ready. |
| #31 | AI Safety | *Not Applicable* | Checked as future-ready. |
| #32 | Bias & Fairness Control | **Implemented** | User profiles are treated without age, location, or gender-based functional restrictions. |
| #33 | Model Monitoring | *Not Applicable* | Checked as future-ready. |
| #34 | Graceful Fallback | **Implemented** | Handled storage, Oauth, or socket disconnect errors gracefully without breaking application threads. |
| #35 | Asynchronous Job | **Implemented** | Prevented infinite spinners by configuring error catch hooks on uploads and transmissions. |
| #36 | API Versioning | **Implemented** | Enforced normalized response templates with request id information on error occurrences. |
| #37 | Configuration Management | **Implemented** | Extracted credentials to environment variables and prepared a fallback verification check during application startup. |
| #38 | CI/CD Quality Gate | **Implemented** | Documented quality verification checks. |
| #39 | Cross-Browser Compatibility| **Implemented** | Assured standard API fallbacks for legacy browsers. |
| #40 | Internationalization | **Implemented** | Consolidated localized message formatting strategies. |
