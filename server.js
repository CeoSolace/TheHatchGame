// server.js
const express = require('express')
const http = require('http')
const next = require('next')
const { Server } = require('socket.io')

// IMPORTANT: this must resolve to a JS file at runtime on Render.
// Ensure you have: lib/server/game.js
const { GameManager } = require('./lib/server/game')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const port = parseInt(process.env.PORT || '3000', 10)

app
  .prepare()
  .then(() => {
    const expressApp = express()

    // Health check required by spec
    expressApp.get('/api/health', (_req, res) => {
      res.setHeader('Cache-Control', 'no-store')
      res.status(200).json({ ok: true })
    })

    // Create HTTP server
    const httpServer = http.createServer(expressApp)

    // Attach socket.io
    const io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      // Helpful for Render / proxies
      transports: ['websocket', 'polling'],
    })

    // Game manager (server-authoritative state)
    const gameManager = new GameManager(io)
    io.on('connection', (socket) => {
      gameManager.registerSocket(socket)
    })

    // Next.js handler for everything else
    expressApp.all('*', (req, res) => handle(req, res))

    // Listen on Render-provided port
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`> THE HATCH ready on port ${port} (dev=${dev})`)
    })
  })
  .catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
