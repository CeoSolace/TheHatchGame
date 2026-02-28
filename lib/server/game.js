const { randomUUID, randomInt } = require("crypto")

class GameManager {
  constructor(io) {
    this.io = io
    this.rooms = new Map()
  }

  registerSocket(socket) {
    socket.on("joinRoom", (payload) => {
      const { roomId, mode } = payload || {}
      const stableUserId = String(payload?.userId || socket.id)
      const displayName = String(payload?.displayName || payload?.name || `Player-${stableUserId.slice(0, 4)}`).slice(0, 24)
      const avatarUrl = String(payload?.avatarUrl || "")

      let room
      if (!roomId) {
        const id = randomUUID()
        room = {
          id,
          hostId: "",
          hostUserId: null,
          players: new Map(), // socket.id -> player
          started: false,
          deck: [],
          discard: [],
          currentPlayerOrder: [],
          pressure: 0,
          mode: mode || "private",
          createdAt: Date.now(),
        }
        this.rooms.set(id, room)
      } else {
        room = this.rooms.get(roomId)
        if (!room) {
          socket.emit("error", { message: "Room not found" })
          return
        }
      }

      // Reconnect handling: remove old socket entry for same userId
      for (const [sid, p] of room.players.entries()) {
        if (p.userId === stableUserId && sid !== socket.id) {
          room.players.delete(sid)
          room.currentPlayerOrder = room.currentPlayerOrder.filter((x) => x !== sid)
        }
      }

      const player = {
        id: socket.id,
        userId: stableUserId,
        displayName,
        avatarUrl,
        hearts: 3,
        hand: [],
        cowardTokens: 0,
        role: "guest",
      }

      if (!room.hostUserId) room.hostUserId = stableUserId
      if (room.hostUserId === stableUserId) {
        room.hostId = socket.id
        player.role = "host"
      }

      room.players.set(socket.id, player)
      if (!room.currentPlayerOrder.includes(socket.id)) room.currentPlayerOrder.push(socket.id)

      socket.join(room.id)
      socket.emit("joinedRoom", { roomId: room.id, player: this.publicPlayer(player) })
      this.io.to(room.id).emit("roomUpdated", { roomId: room.id, room: this.serializeRoom(room) })
    })

    socket.on("startGame", ({ roomId }) => {
      const room = this.rooms.get(roomId)
      if (!room) return
      if (room.hostId !== socket.id) return
      if (room.started) return

      room.started = true
      room.deck = this.createDeck()
      room.discard = []
      room.pressure = 0

      room.players.forEach((p) => {
        p.hearts = 3
        p.cowardTokens = 0
        p.hand = []
        for (let i = 0; i < 2; i++) {
          const card = room.deck.shift()
          if (card) p.hand.push(card)
        }
      })

      this.io.to(room.id).emit("gameStarted", { roomId, room: this.serializeRoom(room) })
      this.io.to(room.id).emit("roomUpdated", { roomId, room: this.serializeRoom(room) })
    })

    socket.on("rollDice", ({ roomId }) => {
      const room = this.rooms.get(roomId)
      if (!room || !room.started) return

      const currentId = room.currentPlayerOrder[0]
      if (currentId !== socket.id) return

      const die = this.rollDie()
      const result = this.resolveDie(die, room, currentId)

      room.currentPlayerOrder.push(room.currentPlayerOrder.shift())
      this.io.to(room.id).emit("diceRolled", { roomId, die, result, room: this.serializeRoom(room) })
      this.io.to(room.id).emit("roomUpdated", { roomId, room: this.serializeRoom(room) })
    })

    socket.on("playCard", ({ roomId, card }) => {
      const room = this.rooms.get(roomId)
      if (!room || !room.started) return
      const player = room.players.get(socket.id)
      if (!player) return
      if (!player.hand.includes(card)) return

      player.hand = player.hand.filter((c) => c !== card)
      room.discard.push(card)

      this.io.to(room.id).emit("cardPlayed", { roomId, card, playerId: socket.id })
      this.io.to(room.id).emit("roomUpdated", { roomId, room: this.serializeRoom(room) })
    })

    // Relay only (NOT stored; keep payload minimal)
    socket.on("chat", ({ roomId, message }) => {
      const room = this.rooms.get(roomId)
      if (!room) return
      const msg = String(message || "").slice(0, 500)
      // Only emit userId + displayName + message
      const p = room.players.get(socket.id)
      this.io.to(room.id).emit("chat", {
        userId: p?.userId || "",
        displayName: p?.displayName || "Player",
        message: msg,
      })
    })

    socket.on("disconnect", () => {
      for (const room of this.rooms.values()) {
        const leaving = room.players.get(socket.id)
        if (!leaving) continue

        room.players.delete(socket.id)
        room.currentPlayerOrder = room.currentPlayerOrder.filter((id) => id !== socket.id)

        if (room.hostId === socket.id) room.hostId = ""

        if (room.players.size === 0) {
          this.rooms.delete(room.id)
          continue
        }

        // Auto-transfer host if host socket absent
        if (!room.hostId && room.players.size > 0) {
          const next = Array.from(room.players.values())[0]
          room.hostUserId = next.userId
          room.hostId = next.id
          next.role = "host"
        }

        this.io.to(room.id).emit("roomUpdated", { roomId: room.id, room: this.serializeRoom(room) })
      }
    })
  }

  publicPlayer(p) {
    return {
      id: p.id,
      userId: p.userId,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      hearts: p.hearts,
      cowardTokens: p.cowardTokens,
      role: p.role,
      hand: p.hand, // personal data but only for the owning socket via room state client; ok for now
    }
  }

  serializeRoom(room) {
    const players = {}
    room.players.forEach((p, sid) => {
      // DO NOT leak device/ip fields (none exist here)
      players[sid] = {
        id: p.id,
        userId: p.userId,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        hearts: p.hearts,
        cowardTokens: p.cowardTokens,
        role: p.role,
        hand: p.hand, // if you later want privacy: send hands only to owner
      }
    })

    return {
      id: room.id,
      hostId: room.hostId,
      hostUserId: room.hostUserId,
      started: room.started,
      currentPlayerOrder: room.currentPlayerOrder,
      pressure: room.pressure,
      mode: room.mode,
      players,
    }
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
    if (!player) return { description: "" }

    let description = ""
    switch (die) {
      case 1:
        player.hearts = Math.max(0, player.hearts - 1)
        description = `${player.displayName} rolled 1 and lost 1 heart.`
        break
      case 2:
        description = `${player.displayName} rolled 2: nothing happens.`
        break
      case 3:
        player.hearts = Math.min(5, player.hearts + 1)
        description = `${player.displayName} rolled 3 and gained 1 heart.`
        break
      case 4:
        room.players.forEach((p) => (p.hearts = Math.max(0, p.hearts - 1)))
        description = `${player.displayName} rolled 4: everyone loses 1 heart.`
        break
      case 5: {
        const targetId = room.currentPlayerOrder[1]
        if (targetId) {
          const target = room.players.get(targetId)
          if (target) {
            target.hearts = Math.max(0, target.hearts - 1)
            description = `${player.displayName} rolled 5 and forced ${target.displayName} to lose 1 heart.`
          } else {
            description = `${player.displayName} rolled 5 but no valid target.`
          }
        } else {
          description = `${player.displayName} rolled 5 but no target available.`
        }
        break
      }
      case 6:
        room.pressure += 1
        description = `${player.displayName} rolled 6: chaos! Pressure increased to ${room.pressure}.`
        break
    }
    return { description }
  }
}

module.exports = { GameManager }
