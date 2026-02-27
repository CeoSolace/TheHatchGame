import { Server, Socket } from 'socket.io'
import { randomUUID } from 'crypto'

// Types for players and rooms
export interface Player {
  id: string
  name: string
  hearts: number
  hand: string[]
  cowardTokens: number
  role?: 'host' | 'guest'
  friendCode?: string
}

export interface Room {
  id: string
  hostId: string
  players: Map<string, Player>
  started: boolean
  deck: string[]
  discard: string[]
  currentPlayerOrder: string[]
  pressure: number
  mode: 'public' | 'private' | 'friends' | 'hotseat' | 'troll'
  createdAt: number
  inviteToken?: string
  open?: boolean
  trollTokens?: Record<string, number>
}

/**
 * GameManager encapsulates all server‑side game state and logic. It is
 * intentionally server‑authoritative: all random generation and rule
 * enforcement occurs on the server. Clients send intents and the server
 * validates and broadcasts the resulting state.
 */
export class GameManager {
  private io: Server
  private rooms: Map<string, Room>

  constructor(io: Server) {
    this.io = io
    this.rooms = new Map()
  }

  /**
   * Registers a connected socket. Each connecting client gets assigned
   * listeners for join, start, action and chat events. All input is
   * validated before mutating any state.
   */
  public registerSocket(socket: Socket) {
    // Join a room
    socket.on('joinRoom', (payload: { roomId?: string; name: string; mode?: Room['mode'] }) => {
      const { roomId, name, mode } = payload
      let room: Room | undefined

      // If no roomId, create a new room
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

      if (!room) return

      // Add player to room
      const player: Player = {
        id: socket.id,
        name: name || `Player-${socket.id.slice(0, 4)}`,
        hearts: 3,
        hand: [],
        cowardTokens: 0,
        role: room.players.size === 0 ? 'host' : 'guest',
      }
      room.players.set(socket.id, player)
      if (!room.hostId) room.hostId = socket.id
      // Determine player order if first join
      if (room.currentPlayerOrder.length === 0) {
        room.currentPlayerOrder = [socket.id]
      } else {
        room.currentPlayerOrder.push(socket.id)
      }
      socket.join(room.id)
      socket.emit('joinedRoom', { roomId: room.id, player })
      this.io.to(room.id).emit('roomUpdated', { roomId: room.id, room: this.serializeRoom(room) })
    })

    // Handle starting a match
    socket.on('startGame', ({ roomId }) => {
      const room = this.rooms.get(roomId)
      if (!room) return
      // Only host can start
      if (room.hostId !== socket.id) return
      if (room.started) return
      room.started = true
      // create deck and shuffle
      room.deck = this.createDeck()
      room.discard = []
      // deal two action cards to each player
      room.players.forEach((player) => {
        player.hand = []
        for (let i = 0; i < 2; i++) {
          const card = room.deck.shift()
          if (card) player.hand.push(card)
        }
      })
      this.io.to(room.id).emit('gameStarted', { roomId, room: this.serializeRoom(room) })
    })

    // Player rolls the dice
    socket.on('rollDice', ({ roomId }) => {
      const room = this.rooms.get(roomId)
      if (!room || !room.started) return
      // It is assumed that the current turn is the first in the order; no concurrency
      const playerId = room.currentPlayerOrder[0]
      if (playerId !== socket.id) return
      const die = this.rollDie()
      const result = this.resolveDie(die, room, playerId)
      // Move current player to end of queue
      room.currentPlayerOrder.push(room.currentPlayerOrder.shift() as string)
      this.io.to(room.id).emit('diceRolled', { roomId, die, result, room: this.serializeRoom(room) })
    })

    // Player plays an action card
    socket.on('playCard', ({ roomId, card, targetId }) => {
      const room = this.rooms.get(roomId)
      if (!room) return
      const player = room.players.get(socket.id)
      if (!player) return
      if (!player.hand.includes(card)) return
      // Remove card from hand
      player.hand = player.hand.filter((c) => c !== card)
      room.discard.push(card)
      // Simplified: just broadcast card played
      this.io.to(room.id).emit('cardPlayed', { roomId, card, playerId: socket.id, targetId })
    })

    // Player chat (relay only, not stored)
    socket.on('chat', ({ roomId, message }) => {
      const room = this.rooms.get(roomId)
      if (!room) return
      // Simple rate limiting: max 3 messages per 5s
      // Implementation omitted for brevity
      this.io.to(room.id).emit('chat', { playerId: socket.id, message })
    })

    // Disconnect handling
    socket.on('disconnect', () => {
      // Remove player from any rooms
      for (const room of this.rooms.values()) {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id)
          room.currentPlayerOrder = room.currentPlayerOrder.filter((id) => id !== socket.id)
          // If host leaves, assign new host
          if (room.hostId === socket.id) {
            room.hostId = room.currentPlayerOrder[0] || ''
          }
          // Remove room if empty
          if (room.players.size === 0) {
            this.rooms.delete(room.id)
          } else {
            this.io.to(room.id).emit('roomUpdated', { roomId: room.id, room: this.serializeRoom(room) })
          }
        }
      }
    })
  }

  /**
   * Converts a room object with Map into a serializable plain object for
   * transmission over the wire.
   */
  private serializeRoom(room: Room) {
    const players: Record<string, Player> = {}
    room.players.forEach((p, id) => {
      players[id] = { ...p }
    })
    return {
      ...room,
      players,
    }
  }

  /**
   * Generate a shuffled deck of action cards. For brevity, the deck is
   * represented by simple string identifiers. The full card definitions are
   * handled on the client.
   */
  private createDeck(): string[] {
    const cards: string[] = []
    // For demonstration, create 20 cards labelled A1–A20
    for (let i = 1; i <= 20; i++) {
      cards.push(`A${i}`)
    }
    return this.shuffle(cards)
  }

  private shuffle<T>(array: T[]): T[] {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  /**
   * Rolls a single six‑sided die. The server uses crypto.randomInt for
   * unpredictability.
   */
  private rollDie(): number {
    const { randomInt } = require('crypto')
    return randomInt(1, 7)
  }

  /**
   * Resolves a die roll according to the Version 1 rules. This method
   * modifies the room and player state accordingly and returns a description
   * of the outcome for clients to display. For brevity many details of the
   * escalation system, chaos events and backlash are omitted or simplified.
   */
  private resolveDie(die: number, room: Room, playerId: string) {
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
        room.players.forEach((p) => {
          p.hearts = Math.max(0, p.hearts - 1)
        })
        description = `${player.name} rolled 4: everyone loses 1 heart.`
        break
      case 5:
        // Force: player selects another player to lose a heart. Simplified: host chooses next player.
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
      case 6:
        // Chaos: increment pressure
        room.pressure += 1
        description = `${player.name} rolled 6: chaos! Pressure increased to ${room.pressure}.`
        break
    }
    return { description }
  }
}