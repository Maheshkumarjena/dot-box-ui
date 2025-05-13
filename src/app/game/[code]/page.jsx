"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import io from 'socket.io-client'
import { useParams } from 'next/navigation'
import GameGrid from '@/components/GameGrid'
import { motion, AnimatePresence } from 'framer-motion'

let socket

export default function GamePage() {
  const router = useRouter()
  const params = useParams()
  const code = params?.code
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
  // const [score,setScore] = useState({}) // Remove this

  // Modern color palette with neon effects
  const colorPalette = [
    '#3B82F6', // Electric blue
    '#8B5CF6', // Violet
    '#6366F1', // Indigo
    '#A855F7', // Purple
    '#EC4899', // Pink
  ]

  useEffect(() => {
    if (!code || !userId) return
    console.log('use effect triggered ...................')

    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      upgrade: false
    })

    socket.emit('joinGame', { code, userId })

    socket.on('gameJoined', (data) => {
      console.log('gameJoined data:', data);
      const { gameState, player } = data
      setGameState(gameState)
      setPlayers(gameState.players.map(p => ({ ...p, score: 0 }))) // Initialize score
      setCurrentPlayerId(gameState.players[gameState.currentPlayerIndex]?.userId)

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

      setMessage(`Game started! It's ${gameState.players[0]?.user?.username || 'Player 1'}'s turn`)
    })

    socket.on('playerJoined', (data) => {
      console.log('playerJoined data:', data);
      setPlayers(data.gameState.players.map(p => ({ ...p, score: 0 }))) // Initialize score for new player

      // Update player colors for new player
      const newPlayer = data.player
      const newColorIndex = data.gameState.players.findIndex(p => p.userId === newPlayer.userId)
      setPlayerColors(prev => ({
        ...prev,
        [newPlayer.userId]: colorPalette[newColorIndex % colorPalette.length]
      }))
    })

    socket.on('gameStateUpdated', (data) => {
      console.log('gameStateUpdated data:', data);
      setGameState(data.gameState)

      // Update players with scores
      const updatedPlayers = data.gameState.players.map(player => {
        let score = 0;
        Object.values(data.gameState.boxes).forEach(box => {
          if (box.owner === player.userId) {
            score++;
          }
        });
        return { ...player, score };
      });
      setPlayers(updatedPlayers);

      // Update completed boxes count
      const completed = Object.values(data.gameState.boxes).filter(b => b.owner).length
      setBoxesCompleted(completed)
    })

    socket.on('nextPlayer', (data) => {
      console.log('nextPlayer data:', data);
      setCurrentPlayerId(data.playerId)
      const currentPlayer = players.find(p => p.userId === data.playerId)
      if (currentPlayer) {
        setMessage(currentPlayer.userId === userId
          ? 'Your turn!'
          : `${currentPlayer.user?.username || 'Opponent'}'s turn`)
      }
    })

    socket.on('invalidMove', (data) => {
      console.log('invalidMove data:', data);
      setError(data.message)
      setTimeout(() => setError(''), 3000)
    })

    socket.on('gameEnded', (data) => {
      console.log('gameEnded data:', data);
      setGameEnded(true)
      setIsTie(data.isTie)
      setWinner(data.winnerId)
      setMessage(data.isTie
        ? 'Game ended in a tie!'
        : `${players.find(p => p.userId === data.winnerId)?.user?.username || 'Someone'} wins!`)
    })

    socket.on('error', (data) => {
      console.log('socket error data:', data);
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

    console.log('handleLineClick lineId:', lineId);
    console.log('handleLineClick gameState:', gameState);
    console.log('handleLineClick currentPlayerId:', currentPlayerId);
    console.log('handleLineClick userId:', userId);
    console.log('handleLineClick players:', players);

    socket.emit('makeMove', { code, line: lineId, userId })
  }

  // The scores are now directly in the players state
  // const scores = Object.fromEntries(players.map(p => [p.userId, p.score]));
  console.log('players with scores in GamePage:', players);


  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-8 bg-indigo-800 rounded w-3/4 mx-auto"></div>
              <div className="space-y-3">
                <div className="h-4 bg-indigo-900 rounded w-5/6 mx-auto"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Game: {code}
          </h1>

          <AnimatePresence>
            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`mt-4 text-lg font-medium ${currentPlayerId === userId ? 'text-blue-400' : 'text-purple-400'
                  }`}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 bg-red-900/50 border-l-4 border-red-500 p-4 rounded-r-lg"
            >
              <p className="text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Game stats with glow effect */}
          <div className="mt-6 flex justify-center gap-6">
            <div className="bg-gray-800/50 px-6 py-3 rounded-xl border border-gray-700 shadow-lg shadow-blue-500/10">
              <p className="text-sm text-gray-400">Boxes Completed</p>
              <p className="text-2xl font-bold text-blue-400">
                {boxesCompleted}<span className="text-gray-500">/{totalBoxes}</span>
              </p>
            </div>
            <div className="bg-gray-800/50 px-6 py-3 rounded-xl border border-gray-700 shadow-lg shadow-purple-500/10">
              <p className="text-sm text-gray-400">Boxes Remaining</p>
              <p className="text-2xl font-bold text-purple-400">
                {totalBoxes - boxesCompleted}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Game ended modal */}
        <AnimatePresence>
          {gameEnded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-xl shadow-blue-500/10"
              >
                <h2 className="text-2xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  {isTie ? "Game Tied!" : "Victory!"}
                </h2>

                {!isTie && winner && (
                  <div className="mb-6 text-center">
                    <p className="text-lg">
                      Winner: <span className="font-bold text-blue-400">
                        {players.find(p => p.userId === winner)?.user?.username}
                      </span>
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-300 ">Final Scores</h3>
                  <ul className="space-y-3">
                    {players.map(player => (
                      <li key={player.userId} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                        <span className="flex items-center">
                          <span
                            className="w-3 h-3 rounded-full mr-3 flex-shrink-0 shadow-sm shadow-current"
                            style={{
                              backgroundColor: playerColors[player.userId],
                              boxShadow: `0 0 8px ${playerColors[player.userId]}`
                            }}
                          />
                          <span className={`${player.userId === userId ? 'text-blue-400' : 'text-gray-300'}`}>
                            {player.user?.username}
                            {player.userId === userId && " (You)"}
                          </span>
                        </span>
                        <span className="font-bold text-lg" style={{ color: playerColors[player.userId] }}>
                          {player.score || 0} {/* Access score directly from player object */}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  Return to Lobby
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Players section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700 shadow-lg"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-300">Players</h2>
            <div className="text-sm font-medium">
              {currentPlayerId === userId ? (
                <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-400 border border-blue-500/50">
                  Your turn
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-purple-900/50 text-purple-400 border border-purple-500/50">
                  Waiting
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {players.map((player) => (
              <motion.div
                key={player.userId}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg transition-all duration-300 ${currentPlayerId === player.userId
                  ? 'bg-blue-900/20 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'bg-gray-700/30 border border-gray-600/30'
                } ${player.userId === userId ? 'ring-1 ring-blue-400/30' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-3 flex-shrink-0 shadow-sm shadow-current"
                      style={{
                        backgroundColor: playerColors[player.userId],
                        boxShadow: `0 0 6px ${playerColors[player.userId]}`
                      }}
                    />
                    <div>
                      <h3 className={`font-medium ${player.userId === userId ? 'text-blue-400' : 'text-gray-300'
                        }`}>
                        {player.user?.username}
                        {player.userId === userId && " (You)"}
                      </h3>
                      <p className="text-xs text-gray-400">
                        Score: <span className="font-bold" style={{ color: playerColors[player.userId] }}>
                          {player.score || 0} {/* Access score directly from player object */}
                        </span>
                      </p>
                    </div>
                  </div>
                  {currentPlayerId === player.userId && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-400 border border-blue-500/50">
                      Current
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Game board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl p-6 mx-auto border border-gray-700 shadow-lg overflow-auto"
        >
          <GameGrid
            gridSize={gameState?.gridSize}
            lines={gameState?.lines}
            boxes={gameState?.boxes}
            currentPlayerId={currentPlayerId}
            userId={userId}
            players={players} 
            playerColors={playerColors}
            onLineClick={handleLineClick}
          />
        </motion.div>
        {/* Other UI elements like player info, messages, etc. can also be placed here */}
      </div>
    </div>
  )
}