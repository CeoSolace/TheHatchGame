"use client"

import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei"
import * as THREE from "three"
import { Suspense, useMemo } from "react"

type Player3D = {
  userId: string
  displayName: string
  hearts: number
  cowardTokens: number
  isHost?: boolean
}

function Table() {
  const felt = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0b3a2a"),
        roughness: 0.95,
        metalness: 0.0,
      }),
    []
  )
  const rim = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1a1a1a"),
        roughness: 0.5,
        metalness: 0.25,
      }),
    []
  )

  return (
    <group>
      {/* Rim */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow material={rim}>
        <cylinderGeometry args={[6.2, 6.2, 0.6, 64]} />
      </mesh>

      {/* Felt */}
      <mesh position={[0, 0.55, 0]} receiveShadow material={felt}>
        <cylinderGeometry args={[5.7, 5.7, 0.25, 64]} />
      </mesh>

      {/* Hatch logo imprint (procedural ring) */}
      <mesh position={[0, 0.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 2.05, 64]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.07} />
      </mesh>
    </group>
  )
}

function Token({
  index,
  count,
  isTurn,
  hearts,
  tokens,
}: {
  index: number
  count: number
  isTurn: boolean
  hearts: number
  tokens: number
}) {
  const angle = (index / count) * Math.PI * 2
  const r = 4.6
  const x = Math.cos(angle) * r
  const z = Math.sin(angle) * r

  // Color token by hearts/tokens (still procedural)
  const color = useMemo(() => {
    if (hearts <= 1) return new THREE.Color("#ff5a5a")
    if (tokens >= 2) return new THREE.Color("#6aa9ff")
    return new THREE.Color("#d6d6d6")
  }, [hearts, tokens])

  return (
    <group position={[x, 0.9, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.6, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.2}
          emissive={isTurn ? new THREE.Color("#ffd34d") : new THREE.Color("#000000")}
          emissiveIntensity={isTurn ? 0.35 : 0}
        />
      </mesh>

      {/* Turn halo */}
      {isTurn && (
        <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.55, 32]} />
          <meshStandardMaterial color="#ffd34d" transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  )
}

function Dice({ value }: { value: number }) {
  // Simple die with pips “implied” by emissive dots (procedural & cheap)
  const pipPositions = useMemo(() => {
    const p = 0.28
    const face: Record<number, [number, number][]> = {
      1: [[0, 0]],
      2: [[-p, -p], [p, p]],
      3: [[-p, -p], [0, 0], [p, p]],
      4: [[-p, -p], [p, -p], [-p, p], [p, p]],
      5: [[-p, -p], [p, -p], [0, 0], [-p, p], [p, p]],
      6: [[-p, -p], [p, -p], [-p, 0], [p, 0], [-p, p], [p, p]],
    }
    return face[Math.min(6, Math.max(1, value))] || face[1]
  }, [value])

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#e9e9e9"),
        roughness: 0.35,
        metalness: 0.05,
      }),
    []
  )

  return (
    <group position={[0, 1.2, 0]}>
      <mesh castShadow material={bodyMat}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
      </mesh>

      {/* Top face pips */}
      {pipPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.46, z]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#111" emissive="#111" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

export default function GameScene3D({
  players,
  turnIndex,
  lastRoll,
}: {
  players: Player3D[]
  turnIndex: number
  lastRoll: number
}) {
  return (
    <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-white/10 bg-black/30">
      <Canvas
        shadows
        camera={{ position: [0, 7.5, 8.5], fov: 42 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#07070a"]} />

        <ambientLight intensity={0.35} />
        <directionalLight
          position={[6, 10, 4]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>

        <Table />

        {players.map((p, idx) => (
          <Token
            key={p.userId}
            index={idx}
            count={Math.max(2, players.length)}
            isTurn={idx === turnIndex}
            hearts={p.hearts}
            tokens={p.cowardTokens}
          />
        ))}

        <Dice value={lastRoll} />

        <ContactShadows position={[0, 0.55, 0]} opacity={0.35} blur={2.6} scale={18} />

        <OrbitControls
          enablePan={false}
          minDistance={7.5}
          maxDistance={12}
          minPolarAngle={0.55}
          maxPolarAngle={1.25}
        />
      </Canvas>
    </div>
  )
}
