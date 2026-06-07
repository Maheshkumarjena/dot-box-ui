import { io } from 'socket.io-client'

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dot-box-server.onrender.com'

const RENDER_WAKE_TIMEOUT_MS = 90_000

export function createGameSocket(options = {}) {
  return io(BACKEND_URL, {
    transports: ['websocket'],
    timeout: RENDER_WAKE_TIMEOUT_MS,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    ...options,
  })
}
