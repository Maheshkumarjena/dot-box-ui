"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import io from 'socket.io-client'
import { useParams } from 'next/navigation'
import GameGrid from '@/components/GameGrid'

let socket

export default function GamePage() {
  const router = useRouter()
   const params = useParams();
  const code = params?.code;
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
  const [gameEnded, setGameEnded] = useState(false)
  const [winner, setWinner] = useState(null)
  const [isTie, setIsTie] = useState(false)
  const [playerColors, setPlayerColors] = useState({})
  const [boxesCompleted, setBoxesCompleted] = useState(0)
  const [totalBoxes, setTotalBoxes] = useState(0)

  // Predefined color palette for players
  const colorPalette = [
    '#3B82F6', // blue-500
    '#EF4444', // red-500
    '#10B981', // green-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
  ]

  useEffect(() => {
    if (!code || !userId) return

    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000')

    socket.emit('joinGame', { code, userId })

    socket.on('gameJoined', (data) => {
      const { gameState, player } = data
      setGameState(gameState)
      setPlayers(gameState.players)
      setCurrentPlayerId(gameState.players[gameState.currentPlayerIndex].userId)
      
      // Initialize player colors
      const colors = {}
      gameState.players.forEach((p, index) => {
        colors[p.userId] = colorPalette[index % colorPalette.length]
      })
      setPlayerColors(colors)
      
      // Calculate total boxes
      const gridSize = gameState.gridSize
      const total = (gridSize - 1) * (gridSize - 1)
      setTotalBoxes(total)
      
      // Calculate completed boxes
      const completed = Object.values(gameState.boxes).filter(b => b.owner).length
      setBoxesCompleted(completed)
      
      setMessage(`Game started! It's ${gameState.players[0].user.username}'s turn`)
    })

    socket.on('playerJoined', (data) => {
      setPlayers(data.gameState.players)
      
      // Update player colors for new player
      const newPlayer = data.player
      const newColorIndex = data.gameState.players.findIndex(p => p.userId === newPlayer.userId)
      setPlayerColors(prev => ({
        ...prev,
        [newPlayer.userId]: colorPalette[newColorIndex % colorPalette.length]
      }))
    })

    socket.on('gameStateUpdated', (data) => {
      setGameState(data.gameState)
      
      // Update completed boxes count
      const completed = Object.values(data.gameState.boxes).filter(b => b.owner).length
      setBoxesCompleted(completed)
    })

    socket.on('nextPlayer', (data) => {
      setCurrentPlayerId(data.playerId)
      const currentPlayer = players.find(p => p.userId === data.playerId)
      if (currentPlayer) {
        setMessage(currentPlayer.userId === userId 
          ? 'Your turn!' 
          : `${currentPlayer.user.username}'s turn`)
      }
    })

    socket.on('invalidMove', (data) => {
      setError(data.message)
      setTimeout(() => setError(''), 3000)
    })

    socket.on('gameEnded', (data) => {
      setGameEnded(true)
      setIsTie(data.isTie)
      setWinner(data.winnerId)
      setMessage(data.isTie 
        ? 'Game ended in a tie!' 
        : `${players.find(p => p.userId === data.winnerId)?.user.username || 'Someone'} wins!`)
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
        socket.disconnect()
      }
    }
  }, [code, userId, router])

  const handleLineClick = (lineId) => {
    if (!gameState || currentPlayerId !== userId) return
    socket.emit('makeMove', { code, line: lineId, userId })
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
          {message && (
            <p className={`mt-2 text-lg ${
              currentPlayerId === userId ? 'text-indigo-600' : 'text-gray-600'
            }`}>
              {message}
            </p>
          )}
          {error && <p className="mt-2 text-lg text-red-600">{error}</p>}
          
          {/* Game progress */}
          <div className="mt-4 flex justify-center gap-8">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-500">Boxes Completed</p>
              <p className="font-semibold">
                {boxesCompleted} / {totalBoxes}
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <p className="text-sm text-gray-500">Boxes Remaining</p>
              <p className="font-semibold">
                {totalBoxes - boxesCompleted}
              </p>
            </div>
          </div>
        </div>

        {/* Game ended modal */}
        {gameEnded && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-center">
                {isTie ? "Game Ended in a Tie!" : "Game Over!"}
              </h2>
              
              {!isTie && winner && (
                <div className="mb-6 text-center">
                  <p className="text-lg">
                    Winner: <span className="font-bold">
                      {players.find(p => p.userId === winner)?.user.username}
                    </span>
                  </p>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Final Scores:</h3>
                <ul className="space-y-2">
                  {players.map(player => (
                    <li key={player.userId} className="flex justify-between">
                      <span className="flex items-center">
                        <span 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: playerColors[player.userId] }}
                        />
                        {player.user.username}
                        {player.userId === userId && " (You)"}
                      </span>
                      <span className="font-semibold">
                        {gameState.scores[player.userId] || 0} boxes
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={() => router.push('/')}
                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Players</h2>
            <div className="text-sm font-medium">
              {currentPlayerId === userId ? (
                <span className="text-indigo-600">Your turn</span>
              ) : (
                <span className="text-gray-600">Waiting for opponent</span>
              )}
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
                  <div className="flex items-center">
                    <span 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: playerColors[player.userId] }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {player.user.username}
                        {player.userId === userId && ' (You)'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Score: {gameState.scores[player.userId] || 0}
                      </p>
                    </div>
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
            playerColors={playerColors}
            onLineClick={handleLineClick}
          />
        </div>
      </div>
    </div>
  )
}