import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import GameSection from "@/components/home/GameSection";

interface GamesProps {
  user: Omit<User, "password">;
  currentLanguage: string;
}

export default function Games({ user, currentLanguage }: GamesProps) {
  const [location] = useLocation();
  const gameId = location.includes('/games/') ? location.split('/games/')[1] : null;
  
  useEffect(() => {
    document.title = "Learning Games - Read-Mentor";
  }, []);

  const { data: games } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  const { data: game, isLoading: gameLoading } = useQuery<Game>({
    queryKey: [`/api/games/${gameId}`],
    enabled: !!gameId
  });

  // If we have a game ID but no game data yet, show loading
  if (gameId && gameLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // If we have a game ID and game data, show the game detail
  if (gameId && game) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Link href="/games">
          <span className="text-primary hover:text-primary-600 font-medium mb-4 inline-block">
            &larr; Back to Games
          </span>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4 font-nunito">{game.title}</h1>
        <p className="text-gray-600 mb-6">{game.description}</p>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <img 
              src={game.imageUrl} 
              alt={game.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {game.difficulty === 'beginner' ? 'Beginner Level' : 
                   game.difficulty === 'intermediate' ? 'Intermediate Level' : 
                   game.difficulty === 'advanced' ? 'Advanced Level' : 'All Levels'}
                </span>
                <span className="mx-3 text-gray-400">•</span>
                <span className="text-gray-600">
                  {currentLanguage === "te" ? "Telugu" : 
                   currentLanguage === "hi" ? "Hindi" : "English"}
                </span>
              </div>
              
              <Button className="bg-primary hover:bg-primary-600">
                Start Game
              </Button>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">How to Play</h2>
              <p className="text-gray-600 mb-4">
                This game helps you improve your {game.difficulty} level vocabulary and reading skills in {currentLanguage === "te" ? "Telugu" : currentLanguage === "hi" ? "Hindi" : "English"}.
              </p>
              
              <div className="mt-4 text-gray-700">
                <p className="mb-2 font-medium">Game features:</p>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  <li>Interactive gameplay with immediate feedback</li>
                  <li>Progressive difficulty levels</li>
                  <li>Audio support for pronunciation</li>
                  <li>Score tracking and performance monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-nunito">More Games You Might Like</h2>
          {/* Display a few related games here */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {games?.filter(g => g.id !== parseInt(gameId)).slice(0, 4).map((relatedGame, index) => (
              <motion.div 
                key={relatedGame.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors duration-200 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Link href={`/games/${relatedGame.id}`}>
                  <div className="h-28 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img 
                      src={relatedGame.imageUrl} 
                      alt={relatedGame.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold mb-1 text-gray-800 group-hover:text-primary transition-colors duration-200">{relatedGame.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{relatedGame.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{relatedGame.difficulty}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Otherwise, show the games list
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4 font-nunito">Learning Games</h1>
      <p className="text-gray-600 mb-8">
        Play these interactive games to improve your {currentLanguage === "te" ? "Telugu" : currentLanguage === "hi" ? "Hindi" : "English"} language skills while having fun.
      </p>
      
      <GameSection />
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-nunito">How Games Help You Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Active Engagement</h3>
            <p className="text-gray-600">Games keep you actively engaged, making learning more effective than passive methods.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Instant Feedback</h3>
            <p className="text-gray-600">Games provide immediate feedback, helping you learn from mistakes and reinforce correct responses.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Spaced Repetition</h3>
            <p className="text-gray-600">Our games use spaced repetition to help you remember vocabulary and concepts over the long term.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
