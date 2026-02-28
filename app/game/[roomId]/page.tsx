"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useParams } from "next/navigation"

interface PlayerState {
  id: string
  userId?: string
  name: string
  hearts: number
  hand: string[]
  cowardTokens: number
  role?: string
}

interface RoomState {
  id: string
  hostId: string
  hostUserId?: string
  players: Record<string, PlayerState>
  started: boolean
  currentPlayerOrder: string[]
  pressure: number
  mode: string
}

function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [input, setInput] = useState("")
  return (
    <div className="flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-grow p-2 rounded bg-gray-800 border border-gray-700"
        placeholder="Type a message (not stored)"
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            onSend(input.trim())
            setInput("")
          }
        }}
      />
      <button
        onClick={() => {
          if (input.trim()) {
            onSend(input.trim())
            setInput("")
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
  const roomId = params.roomId

  const socketRef = useRef<Socket | null>(null)

  const [myId, setMyId] = useState<string>("")
  const [name, setName] = useState("")
  const [joined, setJoined] = useState(false)

  const [room, setRoom] = useState<RoomState | null>(null)
  const [log, setLog] = useState<string[]>([])

  function addLog(message: string) {
    setLog((prev) => [message, ...prev].slice(0, 120))
  }

  function getStableUserId() {
    if (typeof window === "undefined") return ""
    const key = "hatch_userId"
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  }

  useEffect(() => {
    const s = io({ transports: ["websocket", "polling"] })
    socketRef.current = s

    s.on("connect", () => setMyId(s.id || ""))

    s.on("joinedRoom", ({ player }) => {
      setJoined(true)
      addLog(`Joined as ${player?.name || "player"}`)
    })

    s.on("roomUpdated", ({ room }) => setRoom(room))

    s.on("gameStarted", ({ room }) => {
      setRoom(room)
      addLog("Game started.")
    })

    s.on("diceRolled", ({ result, room }) => {
      setRoom(room)
      if (result?.description) addLog(result.description)
    })

    s.on("cardPlayed", ({ playerId, card }) => {
      const pname = room?.players?.[playerId]?.name || playerId?.slice?.(0, 6) || "player"
      addLog(`${pname} played ${card}`)
    })

    s.on("chat", ({ playerId, message }) => {
      const pname = room?.players?.[playerId]?.name || playerId?.slice?.(0, 6) || "player"
      addLog(`${pname}: ${String(message || "")}`)
    })

    s.on("error", (e) => addLog(`Error: ${e?.message || "unknown"}`))

    return () => {
      s.disconnect()
      socketRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function joinRoom() {
    const s = socketRef.current
    if (!s) return
    s.emit("joinRoom", { roomId, name, userId: getStableUserId() })
  }

  function startGame() {
    socketRef.current?.emit("startGame", { roomId })
  }

  function rollDice() {
    socketRef.current?.emit("rollDice", { roomId })
  }

  function playCard(card: string) {
    socketRef.current?.emit("playCard", { roomId, card })
  }

  function sendChat(msg: string) {
    socketRef.current?.emit("chat", { roomId, message: msg })
  }

  const me = useMemo(() => {
    if (!room || !myId) return null
    return room.players?.[myId] || null
  }, [room, myId])

  const isHost = useMemo(() => {
    if (!room || !myId) return false
    return room.hostId === myId
  }, [room, myId])

  const currentTurnId = room?.currentPlayerOrder?.[0] || ""

  if (!joined) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">Join Room</h1>
        <p className="text-sm text-gray-400 break-all">Room: {roomId}</p>
        <input
          placeholder="Your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        />
        <button onClick={joinRoom} className="btn w-full">
          Join
        </button>
        <p className="text-xs text-gray-500">
          Host gets the Start Game button automatically.
        </p>
      </div>
    )
  }

  if (!room) return <p>Loading room…</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Room {room.id}</h2>
        <p className="text-sm text-gray-400">
          You: <span className="text-gray-200">{me?.name || myId.slice(0, 6)}</span>{" "}
          {isHost ? <span className="text-blue-400">(Host)</span> : null}
        </p>
      </div>

      {!room.started && (
        <div className="border border-gray-700 rounded p-3 space-y-2">
          <h3 className="font-semibold">Lobby</h3>
          <p className="text-sm text-gray-400">
            Players: {Object.keys(room.players).length}
          </p>

          {isHost ? (
            <button
              className="btn"
              onClick={startGame}
              disabled={Object.keys(room.players).length < 2}
              title={Object.keys(room.players).length < 2 ? "Need at least 2 players" : "Start the game"}
            >
              Start Game
            </button>
          ) : (
            <p className="text-sm text-gray-400">Only the host can start the game.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.values(room.players).map((p) => (
          <div key={p.id} className="border border-gray-700 p-2 rounded">
            <h3 className="font-semibold">{p.name}</h3>
            <p>Hearts: {p.hearts}</p>
            <p>Coward: {p.cowardTokens}</p>
            {p.id === room.hostId && <p className="text-blue-400 text-sm">Host</p>}
            {p.id === currentTurnId && room.started && <p className="text-green-400">Current Turn</p>}
          </div>
        ))}
      </div>

      {room.started && (
        <div className="border border-gray-700 rounded p-3 space-y-3">
          <h3 className="font-semibold">Game</h3>
          <p className="text-sm text-gray-400">Pressure: {room.pressure}</p>

          <div className="space-y-2">
            <p className="text-sm">Your hand:</p>
            <div className="flex gap-2 flex-wrap">
              {(me?.hand || []).map((card) => (
                <button key={card} onClick={() => playCard(card)} className="btn text-xs">
                  Play {card}
                </button>
              ))}
            </div>
          </div>

          {currentTurnId === myId ? (
            <div className="flex gap-3">
              <button onClick={rollDice} className="btn">
                Roll Dice
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Waiting for current player…</p>
          )}
        </div>
      )}

      <div className="border-t border-gray-700 pt-4 mt-4">
        <h3 className="font-semibold">Log</h3>
        <ul className="max-h-56 overflow-y-auto text-sm space-y-1">
          {log.map((entry, idx) => (
            <li key={idx}>{entry}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="font-semibold">Chat</h3>
        <p className="text-xs text-gray-500">Chat is relayed and not stored.</p>
        <ChatInput onSend={sendChat} />
      </div>
    </div>
  )
}
