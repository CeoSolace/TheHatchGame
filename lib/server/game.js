// lib/server/game.js
const { randomUUID, randomInt } = require('crypto')

class GameManager {
  constructor(io) {
    this.io = io
    this.rooms = new Map()
  }

  registerSocket(socket) {
    socket.on('joinRoom', (payload) => {
      const { roomId, name, mode } = payload || {}
      let room

      if (!roomId) {
        const id = randomUUID()
        room = {
          id,
          hostId: socket.id,
          players: new Map(),
          started: false,
          deck: [],
          discard: [],
          currentPlayerOrder: [],
          pressure: 0,
          mode: mode || 'private',
          createdAt: Date.now(),
        }
        this.rooms.set(id, room)
      } else {
        room = this.rooms.get(roomId)
        if (!room) {
          socket.emit('error', { message: 'Room not found' })
          return
        }
      }

      const player = {
        id: socket.id,
        name: name || `Player-${socket.id.slice(0, 4)}`,
        hearts: 3,
        hand: [],
        cowardTokens: 0,
        role: room.players.size === 0 ? 'host' : 'guest',
      }

      room.players.set(socket.id, player)
      if (!room.hostId) room.hostId = socket.id

      if (room.currentPlayerOrder.length === 0) room.currentPlayerOrder = [socket.id]
      else room.currentPlayerOrder.push(socket.id)

      socket.join(room.id)
      socket.emit('joinedRoom', { roomId: room.id, player })
      this.io.to(room.id).emit('roomUpdated', { roomId: room.id, room: this.serializeRoom(room) })
    })

    socket.on('startGame', ({ roomId }) => {
      const room = this.rooms.get(roomId)
      if (!room) return
      if (room.hostId !== socket.id) return
      if (room.started) return

      room.started = true
      room.deck = this.createDeck()
      room.discard = []

      room.players.forEach((p) => {
        p.hand = []
        for (let i = 0; i < 2; i++) {
          const card = room.deck.shift()
          if (card) p.hand.push(card)
        }
      })

      this.io.to(room.id).emit('gameStarted', { roomId, room: this.serializeRoom(room) })
    })

    socket.on('rollDice', ({ roomId }) => {
      const room = this.rooms.get(roomId)
      if (!room || !room.started) return

      const currentId = room.currentPlayerOrder[0]
      if (currentId !== socket.id) return

      const die = this.rollDie()
      const result = this.resolveDie(die, room, currentId)

      room.currentPlayerOrder.push(room.currentPlayerOrder.shift())

      this.io.to(room.id).emit('diceRolled', { roomId, die, result, room: this.serializeRoom(room) })
    })

    socket.on('playCard', ({ roomId, card, targetId }) => {
      const room = this.rooms.get(roomId)
      if (!room) return
      const player = room.players.get(socket.id)
      if (!player) return
      if (!player.hand.includes(card)) return

      player.hand = player.hand.filter((c) => c !== card)
      room.discard.push(card)

      this.io.to(room.id).emit('cardPlayed', { roomId, card, playerId: socket.id, targetId })
    })

    // Chat relay only (NOT stored) — keep simple and do not log
    socket.on('chat', ({ roomId, message }) => {
      const room = this.rooms.get(roomId)
      if (!room) return
      this.io.to(room.id).emit('chat', { playerId: socket.id, message: String(message || '').slice(0, 500) })
    })

    socket.on('disconnect', () => {
      for (const room of this.rooms.values()) {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id)
          room.currentPlayerOrder = room.currentPlayerOrder.filter((id) => id !== socket.id)
          if (room.hostId === socket.id) {
            room.hostId = room.currentPlayerOrder[0] || ''
          }
          if (room.players.size === 0) this.rooms.delete(room.id)
          else this.io.to(room.id).emit('roomUpdated', { roomId: room.id, room: this.serializeRoom(room) })
        }
      }
    })
  }

  serializeRoom(room) {
    const players = {}
    room.players.forEach((p, id) => (players[id] = { ...p }))
    return { ...room, players }
  }

  createDeck() {
    const cards = []
    for (let i = 1; i <= 20; i++) cards.push(`A${i}`)
    return this.shuffle(cards)
  }

  shuffle(arr) {
    return arr
      .map((v) => ({ v, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(({ v }) => v)
  }

  rollDie() {
    return randomInt(1, 7)
  }

  resolveDie(die, room, playerId) {
    const player = room.players.get(playerId)
    if (!player) return { description: '' }

    let description = ''
    switch (die) {
      case 1:
        player.hearts = Math.max(0, player.hearts - 1)
        description = `${player.name} rolled 1 and lost 1 heart.`
        break
      case 2:
        description = `${player.name} rolled 2: nothing happens.`
        break
      case 3:
        player.hearts = Math.min(5, player.hearts + 1)
        description = `${player.name} rolled 3 and gained 1 heart.`
        break
      case 4:
        room.players.forEach((p) => (p.hearts = Math.max(0, p.hearts - 1)))
        description = `${player.name} rolled 4: everyone loses 1 heart.`
        break
      case 5: {
        const targetId = room.currentPlayerOrder[1]
        if (targetId) {
          const target = room.players.get(targetId)
          if (target) {
            target.hearts = Math.max(0, target.hearts - 1)
            description = `${player.name} rolled 5 and forced ${target.name} to lose 1 heart.`
          }
        } else {
          description = `${player.name} rolled 5 but no target available.`
        }
        break
      }
      case 6:
        room.pressure += 1
        description = `${player.name} rolled 6: chaos! Pressure increased to ${room.pressure}.`
        break
    }

    return { description }
  }
}

module.exports = { GameManager }
