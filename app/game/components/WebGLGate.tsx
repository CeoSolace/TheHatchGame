"use client"

import { useEffect, useState } from "react"

export default function WebGLGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false)

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas")
      const gl =
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl") ||
        canvas.getContext("webgl2")
      setOk(!!gl)
    } catch {
      setOk(false)
    }
  }, [])

  if (!ok) return null
  return <>{children}</>
}
