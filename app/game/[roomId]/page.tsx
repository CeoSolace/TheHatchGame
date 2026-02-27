"use client"
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useParams, useRouter } from 'next/navigation'

interface PlayerState {
  id: string
  name: string
  hearts: number
  hand: string[]
  cowardTokens: number
  role?: string
}

interface RoomState {
  id: string
  hostId: string
  players: Record<string, PlayerState>
  started: boolean
  currentPlayerOrder: string[]
  pressure: number
  mode: string
}

function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [input, setInput] = useState('')
  return (
    <div className="flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-grow p-2 rounded bg-gray-800 border border-gray-700"
        placeholder="Type a message"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim()) {
            onSend(input)
            setInput('')
          }
        }}
      />
      <button
        onClick={() => {
          if (input.trim()) {
            onSend(input)
            setInput('')
          }
        }}
        className="btn"
      >
        Send
      </button>
    </div>
  )
}

export default function RoomPage() {
  const params = useParams<{ roomId: string }>()
  const router = useRouter()
  const roomId = params.roomId
  const [socket, setSocket] = useState<Socket | null>(null)
  const [room, setRoom] = useState<RoomState | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [name, setName] = useState('')
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    if (!roomId) return
    const s = io()
    setSocket(s)
    s.on('roomUpdated', ({ room }) => {
      setRoom(room)
    })
    s.on('gameStarted', ({ room }) => {
      setRoom(room)
      addLog('Game started')
    })
    s.on('diceRolled', ({ die, result, room }) => {
      setRoom(room)
      addLog(result.description)
    })
    s.on('cardPlayed', ({ playerId, card, targetId }) => {
      const pname = room?.players[playerId]?.name || playerId
      addLog(`${pname} played ${card}`)
    })
    s.on('chat', ({ playerId, message }) => {
      const pname = room?.players[playerId]?.name || playerId
      addLog(`${pname}: ${message}`)
    })
    // Join on mount if name set later
    return () => {
      s.disconnect()
    }
  }, [roomId])

  function join() {
    if (!socket) return
    socket.emit('joinRoom', { roomId, name })
    socket.on('joinedRoom', ({ roomId: r, player }) => {
      setJoined(true)
    })
  }

  function startGame() {
    socket?.emit('startGame', { roomId })
  }

  function rollDice() {
    socket?.emit('rollDice', { roomId })
  }

  function playCard(card: string) {
    socket?.emit('playCard', { roomId, card })
  }

  function sendChat(msg: string) {
    socket?.emit('chat', { roomId, message: msg })
  }

  function addLog(message: string) {
    setLog((prev) => [message, ...prev].slice(0, 100))
  }

  if (!joined) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">Join Room {roomId}</h1>
        <input
          placeholder="Your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        />
        <button onClick={join} className="btn w-full">Join</button>
      </div>
    )
  }
  if (!room) return <p>Loading room…</p>
  const meId = socket?.id || ''
  const me = room.players[meId]
  const isHost = room.hostId === meId
  const currentTurnId = room.currentPlayerOrder[0]
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Room {room.id}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.values(room.players).map((p) => (
          <div key={p.id} className="border border-gray-700 p-2 rounded">
            <h3 className="font-semibold">{p.name}</h3>
            <p>Hearts: {p.hearts}</p>
            <p>Coward: {p.cowardTokens}</p>
            <p>Role: {p.role}</p>
            {p.id === currentTurnId && <p className="text-green-400">Current Turn</p>}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {room.started ? (
          <>
            <div className="space-y-2">
              <p>Your hand:</p>
              <div className="flex gap-2 flex-wrap">
                {me?.hand.map((card) => (
                  <button key={card} onClick={() => playCard(card)} className="btn text-xs">
                    Play {card}
                  </button>
                ))}
              </div>
            </div>
            {currentTurnId === meId && (
              <div className="flex gap-4 mt-4">
                <button onClick={() => socket?.emit('rollDice', { roomId })} className="btn">
                  Roll Dice
                </button>
              </div>
            )}
          </>
        ) : (
          isHost && (
            <button onClick={startGame} className="btn">Start Game</button>
          )
        )}
      </div>
      <div className="border-t border-gray-700 pt-4 mt-4">
        <h3 className="font-semibold">Log</h3>
        <ul className="max-h-48 overflow-y-auto text-sm space-y-1">
          {log.map((entry, idx) => (
            <li key={idx}>{entry}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="font-semibold">Chat</h3>
        <ChatInput onSend={sendChat} />
      </div>
    </div>
  )
}