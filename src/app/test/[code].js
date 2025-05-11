'use client';
import { useRouter } from 'next/router';

function GamePage() {
  const router = useRouter();
  const { code } = router.query;

  // Use the game code to fetch game data from your API
  // and render the game page accordingly

  return (
    <div>
      <h1>Game {code}</h1>
      {/* Render game content here */}
    </div>
  );
}

export default GamePage;// pages/game/[code].js
