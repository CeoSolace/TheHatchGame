# THE HATCH

THE HATCH is a chaotic social deduction and push‑your‑luck game for 2–10 players. This repository contains the full source code for the web version as well as the accompanying storefront and admin panel. The project is built with **Next.js 14** using the App Router, **TypeScript**, **Tailwind CSS**, **Socket.io** for real‑time multiplayer, optional **MongoDB** for persistence and **Cloudinary** for image uploads. It also includes a fully offline‑capable **PWA** so you can play Hotseat and Troll modes without an internet connection.

## Features

- **Online and Offline Play:** Create private rooms, friends‑only rooms, public matchmaking or play locally on one device. A service worker precaches the core assets so Hotseat and Troll modes work offline.
- **Server‑Authoritative Gameplay:** All random rolls, shuffling and rule enforcement happens on the server to prevent cheating. Chat uses WebRTC data channels so messages are not logged or stored on the server.
- **Admin Panel:** Secure admin interface protected by credentials defined via environment variables. Admins can review reports, manage teams, view users, create org owner invites and more.
- **Teams:** Users can browse verified community teams, view their pages and donate directly via external links. Users may apply to create new teams which admins can approve.
- **PWA Install:** Users can install THE HATCH to their homescreen. When offline, the app will automatically switch to offline mode and disable online‑only features.

## Getting Started

### Prerequisites

- **Node.js 20.x** and **npm** installed on your machine.
- A modern browser for local development and PWA installation.

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/thehatch.store.git
   cd thehatch.store
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in the required values. At minimum you should set `ADMIN_USER` and `ADMIN_PASS` to enable the admin panel. If `MONGO_URI` is left empty the app will run in guest‑only mode with no persistence. If the Cloudinary variables are missing, uploads will be disabled. If `STRIPE_DONO_LINK` is missing the donate button on the store page is hidden.

### Running Locally

To start the development server run:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`. Changes to files in the `app/` directory will hot‑reload in the browser.

### Production Build

To build and start the production server locally:

```bash
npm run build
npm run start
```

The `start` script runs `node server.js` which creates an Express server, attaches Socket.io and delegates all routing to Next.js. In production the server listens on `process.env.PORT` which must be set by the hosting platform.

### PWA and Offline Usage

The app registers a service worker on page load and precaches the core assets listed in `public/service-worker.js`. You can install the app on supported browsers by using the “Add to Home Screen” or “Install” browser menu. When offline the app will redirect you to the `/offline` page and disable online features such as multiplayer and donations. Hotseat and Troll modes are fully playable offline.

## Deployment on Render.com

The repository includes a `render.yaml` which defines a single web service. To deploy:

1. Push this repository to a Git provider such as GitHub.
2. Log in to **Render.com** and create a **New Web Service**.
3. Connect your repository and select `render.yaml` when prompted.
4. Create an **Environment Group** on Render containing the keys defined in `.env.example` and link it to the service. At minimum set `ADMIN_USER` and `ADMIN_PASS`. Render will automatically bind `PORT`.
5. Save and deploy. Render will run `npm ci && npm run build` during the build phase and `npm run start` to start the server. The health check endpoint `/api/health` will return `{ ok: true }` when the service is up.

## Security Considerations

- **Chat Privacy:** The built‑in chat uses WebRTC data channels for peer‑to‑peer messaging. Messages are never stored in a database or written to logs. The server only handles signaling and presence.
- **Admin Authentication:** Admin credentials are compared using constant‑time comparison via the `secure-compare` package to mitigate timing attacks. Sessions are issued via an HTTP‑only cookie that expires after 8 hours.
- **Rate Limiting:** The server enforces rate limits on chat (3 messages per 5 seconds) and game actions (6 actions per 10 seconds). Additional anti‑cheat validation ensures clients cannot spoof game state.
- **HTTPS:** When deploying in production ensure TLS/HTTPS is enabled. Render automatically serves via HTTPS.

## Contributing

Pull requests are welcome! Please open an issue to discuss any major features before submitting. All contributors must abide by the code of conduct.

## License

This project is licensed under the MIT License. See `LICENSE` for details.