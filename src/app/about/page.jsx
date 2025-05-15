"use client";
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e293b] to-[#37306b] text-gray-300">
      <Head>
        <title>About Dots and Boxes</title>
      </Head>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#a78bfa] to-[#818cf8]">
            Rediscover the Joy of Dots and Boxes
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            The classic pencil-and-paper game reimagined for the digital age
          </p>
        </motion.section>

        {/* Nostalgia Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-16 bg-[#4a3b7c]/30 backdrop-blur-sm rounded-2xl p-8 border border-[#6d28d9]/20 shadow-lg"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-[#d8b4fe]">
                Relive Those Schoolyard Memories
              </h2>
              <p className="text-lg text-gray-400 mb-6">
                Remember those carefree days in school? The simple pleasure of a pencil in hand,
                a grid of dots on paper, and the friendly rivalry of Dots and Boxes with your classmates?
              </p>
              <p className="text-lg text-gray-400">
                Now you can recapture that nostalgic experience with friends near and far.
                The satisfying click of connecting dots, the strategic anticipation of completing a square,
                and the triumphant claim of your color within its boundaries - all preserved in this digital version.
              </p>
            </div>
            <div className="flex-1">
              <div className="bg-[#1e293b]/50 p-6 rounded-xl border border-[#6d28d9]/30">
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#a78bfa] shadow-[0_0_8px_#c084fc]" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-1 bg-gradient-to-r from-[#a78bfa] to-[#818cf8] rounded-full" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* How to Play Section */}
        <motion.section
          id='how-to-play'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold mb-8 text-center text-[#d8b4fe]">
            How to Play
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Rule 1 */}
            <div className="bg-[#1e293b]/40 p-6 rounded-xl border border-[#6d28d9]/20">
              <h3 className="text-2xl font-semibold mb-3 text-[#a78bfa] flex items-center">
                <span className="w-8 h-8 rounded-full bg-[#a78bfa] flex items-center justify-center mr-3 text-indigo-900">1</span>
                The Grid
              </h3>
              <p className="text-gray-400">
                The game begins with a grid of dots. Choose from small (3×3), medium (5×5),
                or large (7×7) grids to control game length and complexity.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="bg-[#37306b]/40 p-6 rounded-xl border border-[#818cf8]/20">
              <h3 className="text-2xl font-semibold mb-3 text-[#818cf8] flex items-center">
                <span className="w-8 h-8 rounded-full bg-[#818cf8] flex items-center justify-center mr-3 text-purple-900">2</span>
                Taking Turns
              </h3>
              <p className="text-gray-400">
                Players alternate drawing single horizontal or vertical lines between two adjacent, unconnected dots.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="bg-[#1e293b]/40 p-6 rounded-xl border border-[#6d28d9]/20">
              <h3 className="text-2xl font-semibold mb-3 text-[#a78bfa] flex items-center">
                <span className="w-8 h-8 rounded-full bg-[#a78bfa] flex items-center justify-center mr-3 text-indigo-900">3</span>
                Claiming Boxes
              </h3>
              <p className="text-gray-400">
                Complete the fourth side of a 1×1 box to claim it with your color.
                Your score increases with each box you capture.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="bg-[#37306b]/40 p-6 rounded-xl border border-[#818cf8]/20">
              <h3 className="text-2xl font-semibold mb-3 text-[#818cf8] flex items-center">
                <span className="w-8 h-8 rounded-full bg-[#818cf8] flex items-center justify-center mr-3 text-purple-900">4</span>
                Bonus Turns
              </h3>
              <p className="text-gray-400">
                The strategic twist! Completing a box earns you another turn.
                Chain multiple captures together for maximum advantage.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Multiplayer Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-[#4a3b7c]/50 to-[#3b2c6f]/50 rounded-2xl p-8 border border-[#6d28d9]/30 shadow-lg"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-[#d8b4fe]">
            Play With Friends Anywhere
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#4338ca] flex items-center justify-center text-2xl font-bold text-[#d8b4fe]">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#a78bfa]">Create Game</h3>
              <p className="text-gray-400">
                Choose your grid size and get a unique Game Code
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6d28d9] flex items-center justify-center text-2xl font-bold text-[#818cf8]">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#818cf8]">Share Code</h3>
              <p className="text-gray-400">
                Send the code to friends via chat, email, or social media
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#4338ca] flex items-center justify-center text-2xl font-bold text-[#d8b4fe]">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#a78bfa]">Start Playing</h3>
              <p className="text-gray-400">
                Friends enter the code to join your game instantly
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href='/' className="px-8 py-3 bg-gradient-to-r from-[#a78bfa] to-[#818cf8] rounded-full font-bold text-indigo-900 hover:from-[#b39ddb] hover:to-[#9fa8da] transition-all shadow-lg hover:shadow-[#a78bfa]/30">
              Start a Game Now
            </Link>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-6 text-[#d8b4fe]">
            Ready to Connect the Dots?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Gather your friends, sharpen your strategies, and experience the classic game like never before.
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="px-6 py-2 bg-[#4338ca] rounded-full font-medium text-gray-300 hover:bg-[#5243d6] transition-all border border-[#6366f1]"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Check out this awesome link!',
                    url: 'https://dot-box-ui.vercel.app/',
                  }).then(() => console.log('Shared successfully.'))
                    .catch((error) => console.log('Error sharing:', error));
                } else {
                  alert('Web Share API is not supported on your browser. You can manually copy and share the link: https://dot-box-ui.vercel.app/');
                }
              }}
            >
              Invite Friends
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}