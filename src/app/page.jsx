'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

let socket;

export default function Home() {

  const USER_STORAGE_KEY = 'user';
const STORAGE_EXPIRY_KEY = 'userExpiry';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // Milliseconds in a week
const USER_ID_STORAGE_KEY = 'userId'; 


 const router = useRouter();
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState(() => {
    if (typeof window !== 'undefined' && session?.user?.email) {
      const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY);
      if (storedUserId === session.user.email) {
        console.log('User ID retrieved from localStorage:', storedUserId);
        return storedUserId;
      }
    }
    if (session?.user?.email) {
      console.log('User ID (email from session):', session.user.email);
      localStorage.setItem(USER_ID_STORAGE_KEY, session.user.email);
      return session.user.email;
    }
    // Fallback if no session or email yet (shouldn't happen after authentication)
    return null;
  });
  const [gridSize, setGridSize] = useState(5);
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localUsername, setLocalUsername] = useState('');

  useEffect(() => {
    if (session?.user) {
      console.log('User session:', session);
      console.log('User ID (email):', session.user.email);
      console.log('User Name:', session.user.name);
      console.log('User Email:', session.user.email);
      console.log('User Image:', session.user.image);

      // Store user data in local storage with an expiry timestamp
      const userData = {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        // You might want to include other relevant user data
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      console.log('User data saved to local storage');
      localStorage.setItem(STORAGE_EXPIRY_KEY, Date.now() + ONE_WEEK_MS);

      // Ensure userId state is updated with the email
      if (session.user.email && userId !== session.user.email) {
        setUserId(session.user.email);
        localStorage.setItem(USER_ID_STORAGE_KEY, session.user.email);
      }
    }
  }, [session, userId]); // Added userId to the dependency array


  useEffect(() => {
    console.log('useEffect: Component mounted');
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId);
      console.log('User ID saved to localStorage:', userId);
    }

    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'https://dot-box-server.onrender.com', {
      transports: ['websocket'],
      upgrade: false
    });
    console.log('Socket connection established');

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to the game server.');
      setIsLoading(false);
    });

    socket.on('error', (data) => {
      console.log('Socket error event received:', data);
      setError(data.message);
      setIsLoading(false);
    });

    socket.on('gameCreated', (data) => {
      console.log('Game created event received:', data);
      router.push(`/game/${data.code}`);
    });

    socket.on('gameJoined', (data) => {
      console.log('Game joined event received:', data);
      router.push(`/game/${data.gameState.code}`);
    });

    return () => {
      console.log('useEffect: Component unmounting');
      socket.off('error');
      socket.off('gameCreated');
      socket.off('gameJoined');
    };
  }, [userId, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.name) {
      const firstName = session.user.name.split(' ')[0];
      setLocalUsername(firstName);
    } else if (status === 'unauthenticated') {
      setLocalUsername('');
      router.push('/login');
    }
  }, [session, status, router]);

  const handleCreateGame = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!localUsername.trim()) {
      setError('Username is required. Please sign in.');
      setIsLoading(false);
      return;
    }

    socket.emit('createGame', { gridSize, userId, username: localUsername });
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!localUsername.trim()) {
      setError('Username is required. Please sign in.');
      setIsLoading(false);
      return;
    }

    if (!gameCode.trim()) {
      setError('Please enter a game code');
      setIsLoading(false);
      return;
    }

    console.log('username:', localUsername);

    socket.emit('joinGame', { code: gameCode.toUpperCase(), userId, username: localUsername });
  };

  const handleGridSizeChange = (e) => {
    setGridSize(parseInt(e.target.value));
  };

  const handleGameCodeChange = (e) => {
    setGameCode(e.target.value.toUpperCase());
  };

  if (status === 'unauthenticated') {
    return <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Dots and Boxes
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700"
        >
          {error && (
            <div className="mb-4 bg-red-900/50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {status === 'loading' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400">
                Your Username
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value="Loading..."
                readOnly
              />
            </div>
          ) : status === 'authenticated' ? (
            <div className="mb-6 flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-400">
                Your Username:
              </label>
              <p className="font-semibold text-blue-400">{localUsername}</p>
            </div>
          ) : null}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-3">
                Create a New Game
              </h3>
              <form onSubmit={handleCreateGame} className="space-y-4">
                <div>
                  <label
                    htmlFor="gridSize"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Grid Size
                  </label>
                  <select
                    id="gridSize"
                    value={gridSize}
                    onChange={handleGridSizeChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-gray-300"
                  >
                    <option value="3">3x3 (Small)</option>
                    <option value="5">5x5 (Medium)</option>
                    <option value="7">7x7 (Large)</option>
                    <option value="9">9x9 (Extra Large)</option>
                    <option value="11">11x11 (Huge)</option>
                    <option value="13">13x13 (Giant)</option>
                    <option value="15">15x15 (Colossal)</option>
                  </select>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading || status !== 'authenticated'}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      status === 'authenticated'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Creating...' : 'Create Game'}
                  </button>
                  {status !== 'authenticated' && (
                    <p className="mt-2 text-sm text-gray-500">
                      Please sign in to create a game.
                    </p>
                  )}
                </div>
              </form>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-500">Or</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-3">
                Join an Existing Game
              </h3>
              <form onSubmit={handleJoinGame} className="space-y-4">
                <div>
                  <label
                    htmlFor="joinGameCode"
                    className="block text-sm font-medium text-gray-400"
                  >
                    Game Code
                  </label>
                  <input
                    type="text"
                    id="joinGameCode"
                    value={gameCode}
                    onChange={handleGameCodeChange}
                    className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading || status !== 'authenticated'}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      status === 'authenticated'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Joining...' : 'Join Game'}
                  </button>
                  {status !== 'authenticated' && (
                    <p className="mt-2 text-sm text-gray-500">
                      Please sign in to join a game.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}