
"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import io from 'socket.io-client'
import GameGrid from '../../components/GameGrid'

let socket

export default function GamePage() {
  const router = useRouter()
  const { code } = router.query
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId')
    }
    return null
  })
  const [gameState, setGameState] = useState(null)
  const [players, setPlayers] = useState([])
  const [currentPlayerId, setCurrentPlayerId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!code || !userId) return

    // Initialize socket connection
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000')

    // Join the game
    socket.emit('joinGame', { code, userId })

    // Set up event listeners
    socket.on('gameJoined', (data) => {
      setGameState(data.gameState)
      setPlayers(data.gameState.players)
      setCurrentPlayerId(data.gameState.players[data.gameState.currentPlayerIndex].userId)
    })

    socket.on('playerJoined', (data) => {
      setPlayers(data.gameState.players)
    })

    socket.on('gameStateUpdated', (data) => {
      setGameState(data.gameState)
    })

    socket.on('nextPlayer', (data) => {
      setCurrentPlayerId(data.playerId)
      const currentPlayer = players.find(p => p.userId === data.playerId)
      if (currentPlayer) {
        setMessage(`It's ${currentPlayer.user.username}'s turn`)
      }
    })

    socket.on('invalidMove', (data) => {
      setError(data.message)
      setTimeout(() => setError(''), 3000)
    })

    socket.on('gameEnded', (data) => {
      if (data.isTie) {
        setMessage('Game ended in a tie!')
      } else {
        const winner = players.find(p => p.userId === data.winnerId)
        setMessage(`Game over! ${winner?.user.username || 'Someone'} wins!`)
      }
    })

    socket.on('error', (data) => {
      setError(data.message)
      setTimeout(() => {
        setError('')
        router.push('/')
      }, 3000)
    })

    return () => {
      if (socket) {
        socket.off('gameJoined')
        socket.off('playerJoined')
        socket.off('gameStateUpdated')
        socket.off('nextPlayer')
        socket.off('invalidMove')
        socket.off('gameEnded')
        socket.off('error')
        socket.disconnect()
      }
    }
  }, [code, userId, router, players])

  const handleLineClick = (lineId) => {
    if (!gameState || currentPlayerId !== userId) return
    
    socket.emit('makeMove', {
      code,
      line: lineId,
      userId,
    })
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-700">Loading game...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Game: {code}</h1>
          {message && <p className="mt-2 text-lg text-indigo-600">{message}</p>}
          {error && <p className="mt-2 text-lg text-red-600">{error}</p>}
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Players</h2>
            <div className="text-sm text-gray-500">
              {currentPlayerId === userId ? 'Your turn' : 'Waiting for opponent'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player) => (
              <div
                key={player.userId}
                className={`p-4 rounded-lg border ${
                  currentPlayerId === player.userId
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200'
                } ${
                  player.userId === userId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {player.user.username}
                      {player.userId === userId && ' (You)'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Score: {gameState.scores[player.userId] || 0}
                    </p>
                  </div>
                  {currentPlayerId === player.userId && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Current turn
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 overflow-auto">
          <GameGrid
            gridSize={gameState.gridSize}
            lines={gameState.lines}
            boxes={gameState.boxes}
            currentPlayerId={currentPlayerId}
            userId={userId}
            players={players}
            onLineClick={handleLineClick}
          />
        </div>
      </div>
    </div>
  )
}