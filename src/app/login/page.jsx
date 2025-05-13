import { signIn } from "@/auth";
import { motion } from 'framer-motion';

export default function SignIn() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-100">
      <form
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        action={async () => {
          "use server";
          await signIn("google");
        }}
        className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 shadow-lg border border-gray-700 w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <p className="text-2xl font-semibold text-gray-300">
            Welcome to Dots and Boxes
          </p>
          <p className="text-gray-400 mt-2">
            Sign in to start playing!
          </p>
        </div>
        <button
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
          type="submit"
        >
          <svg
            className="w-6 h-6 mr-3 inline-block"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 488"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 376.6 544.8 245.1 544.8c-103.4 0-189.6-77.3-242.5-175.4h67.8c6.6 15.4 17.5 29.1 32.1 38.2 25.8 16.2 54 24.3 89.5 24.3 66.3 0 120.3-44.3 120.3-118.3 0-67.2-53.8-118.3-121.6-118.3-62.9 0-115.9 38.5-127.9 92.4-1.1 8.3-1.6 16.6-1.6 24.7 0 43.3 26.8 75.8 66 92.9 24.5 10.9 54.6 17.5 89.2 17.5 71.4 0 130.1-48.8 140.3-112.7H245.1c-85 0-152.2-57.5-156.6-135.9H488z"
            />
          </svg>
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
