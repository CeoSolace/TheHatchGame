const express = require('express')
const http = require('http')
const next = require('next')
const { Server } = require('socket.io')
const { GameManager } = require('./lib/server/game')
const cookieParser = require('cookie')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const port = parseInt(process.env.PORT || '3000', 10)

app.prepare().then(() => {
  const expressApp = express()
  // Minimal health check
  expressApp.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  // Create HTTP server and attach socket.io
  const httpServer = http.createServer(expressApp)
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Game manager manages all rooms and gameplay state
  const gameManager = new GameManager(io)
  io.on('connection', (socket) => {
    gameManager.registerSocket(socket)
  })

  // Pass all remaining requests to Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})