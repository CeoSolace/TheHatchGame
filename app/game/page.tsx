"use client"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export default function GameLobby() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [mode, setMode] = useState<'public' | 'private' | 'friends' | 'hotseat' | 'troll'>('private')

  const [socket, setSocket] = useState<Socket | null>(null)

  function getStableUserId() {
    if (typeof window === 'undefined') return ''
    const key = 'hatch_userId'
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  }

  function ensureSocket() {
    if (!socket) {
      const s = io({ transports: ['websocket', 'polling'] })
      setSocket(s)
      return s
    }
    return socket
  }

  function handleCreate() {
    const s = ensureSocket()
    s.emit('joinRoom', { name, mode, userId: getStableUserId() })
    s.once('joinedRoom', ({ roomId: newRoomId }) => {
      router.push(`/game/${newRoomId}`)
    })
  }

  function handleJoin() {
    if (!roomId) return
    const s = ensureSocket()
    s.emit('joinRoom', { roomId, name, userId: getStableUserId() })
    s.once('joinedRoom', ({ roomId: newRoomId }) => {
      router.push(`/game/${newRoomId}`)
    })
  }

  function handleOffline() {
    router.push('/game/offline')
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-center">Start a Game</h1>

      <div className="flex flex-col gap-2">
        <label className="text-sm">Display Name (optional)</label>
        <input
          className="p-2 rounded bg-gray-800 border border-gray-700"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm">Match Type</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="hotseat">Offline Hotseat</option>
          <option value="private">Online Private Room</option>
          <option value="friends">Friends Only</option>
          <option value="public">Public Matchmaking</option>
          <option value="troll">Troll Mode (private)</option>
        </select>
      </div>

      {mode === 'hotseat' ? (
        <button onClick={handleOffline} className="btn">Play Offline</button>
      ) : (
        <>
          <button onClick={handleCreate} className="btn">Create Room</button>

          <div className="flex flex-col gap-2 mt-4">
            <label className="text-sm">Join Existing Room</label>
            <input
              className="p-2 rounded bg-gray-800 border border-gray-700"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={handleJoin} className="btn">Join Room</button>
          </div>
        </>
      )}
    </div>
  )
}
