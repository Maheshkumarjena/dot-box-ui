'use client';
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import io from 'socket.io-client'
import { useRouter } from 'next/navigation';

let socket

export default function Home() {
  const router = useRouter()
  const [userId] = useState(() => {
    // Generate or retrieve a user ID
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || uuidv4()
    }
    return uuidv4()
  })
  const [username, setUsername] = useState('')
  const [gridSize, setGridSize] = useState(5)
  const [gameCode, setGameCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('useEffect: Component mounted')
    // Save the user ID to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId)
      console.log('User ID saved to localStorage:', userId)
    }

    // Initialize socket connection
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000')
    console.log('Socket connection established')

    socket.on('error', (data) => {
      console.log('Socket error event received:', data)
      setError(data.message)
      setIsLoading(false)
      console.log('Error state updated:', data.message)
      console.log('Loading state updated: false')
    })

    socket.on('gameCreated', (data) => {
      console.log('Game created event received:', data)
      router.push(`/game/${data.code}`)
      console.log('Navigated to game page:', `/game/${data.code}`)
    })

    socket.on('gameJoined', (data) => {
      console.log('Game joined event received:', data) 
      router.push(`/game/${data.gameState.code}`)
      console.log('Navigated to game page:', `/game/${data.gameState.code}`)
    })

    return () => {
      console.log('useEffect: Component unmounting')
      socket.off('error')
      socket.off('gameCreated')
      socket.off('gameJoined')
      console.log('Socket event listeners removed')
    }
  }, [userId, router])

  const handleCreateGame = (e) => {
    console.log('Create game button clicked')
    e.preventDefault()
    setIsLoading(true)
    setError('')
    console.log('Loading state updated: true')
    console.log('Error state updated: ""')
    
    if (!username.trim()) {
      console.log('Username is empty')
      setError('Please enter a username')
      setIsLoading(false)
      console.log('Error state updated: "Please enter a username"')
      console.log('Loading state updated: false')
      return
    }

    console.log('Creating game with data:', { gridSize, userId, username })
    socket.emit('createGame', { gridSize, userId, username })
  }

  const handleJoinGame = (e) => {
    console.log('Join game button clicked')
    e.preventDefault()
    setIsLoading(true)
    setError('')
    console.log('Loading state updated: true')
    console.log('Error state updated: ""')
    
    if (!username.trim()) {
      console.log('Username is empty')
      setError('Please enter a username')
      setIsLoading(false)
      console.log('Error state updated: "Please enter a username"')
      console.log('Loading state updated: false')
      return
    }

    if (!gameCode.trim()) {
      console.log('Game code is empty')
      setError('Please enter a game code')
      setIsLoading(false)
      console.log('Error state updated: "Please enter a game code"')
      console.log('Loading state updated: false')
      return
    }

    console.log('Joining game with data:', { code: gameCode.toUpperCase(), userId, username })
    socket.emit('joinGame', { code: gameCode.toUpperCase(), userId, username })
  }

  const handleUsernameChange = (e) => {
    console.log('Username changed:', e.target.value)
    setUsername(e.target.value)
  }

  const handleGridSizeChange = (e) => {
    console.log('Grid size changed:', parseInt(e.target.value))
    setGridSize(parseInt(e.target.value))
  }

  const handleGameCodeChange = (e) => {
    console.log('Game code changed:', e.target.value.toUpperCase())
    setGameCode(e.target.value.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Dots and Boxes
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Your Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create a New Game
              </h3>
              <form onSubmit={handleCreateGame} className="space-y-4">
                <div>
                  <label
                    htmlFor="gridSize"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Grid Size
                  </label>
                  <select
                    id="gridSize"
                    value={gridSize}
                    onChange={handleGridSizeChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="3">3x3 (Small)</option>
                    <option value="5">5x5 (Medium)</option>
                    <option value="7">7x7 (Large)</option>
                  </select>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating...' : 'Create Game'}
                  </button>
                </div>
              </form>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Join an Existing Game
              </h3>
              <form onSubmit={handleJoinGame} className="space-y-4">
                <div>
                  <label
                    htmlFor="gameCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Game Code
                  </label>
                  <input
                    type="text"
                    id="gameCode"
                    value={gameCode}
                    onChange={handleGameCodeChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Joining...' : 'Join Game'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

