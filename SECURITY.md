# Security Policy

## Supported Versions

Security updates are applied to the current major version of THE HATCH. Users are encouraged to update regularly.

## Reporting Vulnerabilities

If you discover a vulnerability in the project, please do not publicly disclose it. Instead, email **security@thehatch.store** with a detailed description of the issue. We will respond within 72 hours and work with you to resolve the problem as quickly as possible.

## Data Privacy

- **Chat:** All chat messages are transmitted over encrypted WebRTC data channels directly between peers. Messages are not stored on the server, logged or persisted. If WebRTC is unavailable, messages are relayed in memory only and never written to disk.
- **User Accounts:** When MongoDB is configured, user passwords are hashed using bcrypt before storage. Sensitive information such as authentication secrets are never committed to the repository and must be provided via environment variables.
- **Reports:** Game reports include up to the last 50 game events but exclude chat logs. Reports are only accessible to authorised admins.
- **Cookies:** Admin sessions use HTTP‑only cookies with a limited lifetime. No JWTs are exposed to the client.

## Anti‑Cheat Measures

The server is fully authoritative: all shuffling and random number generation happen server‑side using `crypto.randomInt`. Client actions are validated against the expected game state and rejected if they deviate. Message and action rates are limited to prevent spam and denial‑of‑service.

## Responsible Use

This project is provided as‑is without warranty. While every effort has been made to secure the application, you are responsible for deploying it in a secure environment, keeping dependencies up to date and configuring HTTPS and DNS correctly. Do not run the server with elevated privileges. Do not expose your `.env` file or secrets publicly.