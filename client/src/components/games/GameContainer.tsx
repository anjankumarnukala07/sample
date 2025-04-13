import { useState } from "react";
import { User, Game } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Import all games
import WordMatch from "./WordMatch";
import SentenceBuilder from "./SentenceBuilder";
import RapidFire from "./RapidFire";
import StoryCompletion from "./StoryCompletion";

interface GameContainerProps {
  game: Game;
  user: Omit<User, "password">;
  currentLanguage: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export default function GameContainer({ game, user, currentLanguage, difficulty = "beginner" }: GameContainerProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<{ score: number; total: number } | null>(null);
  const { toast } = useToast();

  const handleGameStart = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setFinalScore(null);
    
    toast({
      title: "Game Started!",
      description: `Good luck with ${game.title}!`,
    });
  };

  const handleGameComplete = (score: number, totalPossible: number) => {
    setGameCompleted(true);
    setFinalScore({ score, total: totalPossible });
    
    // Calculate percentage
    const percentage = Math.round((score / totalPossible) * 100);
    
    let message = "";
    
    if (percentage >= 90) {
      message = "Excellent work! You're a master!";
    } else if (percentage >= 75) {
      message = "Great job! Keep practicing to improve!";
    } else if (percentage >= 50) {
      message = "Good effort! Practice makes perfect.";
    } else {
      message = "Keep practicing! You'll get better with time.";
    }
    
    toast({
      title: `Game Complete! Score: ${score}/${totalPossible}`,
      description: message,
    });
  };

  const renderGame = () => {
    if (!gameStarted) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{game.title}</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">{game.description}</p>
          <Button
            onClick={handleGameStart}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg"
          >
            Start Game
          </Button>
        </div>
      );
    }

    // Render the correct game component based on the game ID
    switch (game.id) {
      case 1: // Word Match
        return (
          <WordMatch
            user={user}
            currentLanguage={currentLanguage}
            difficulty={difficulty}
            onComplete={handleGameComplete}
          />
        );
      case 2: // Sentence Builder
        return (
          <SentenceBuilder
            user={user}
            currentLanguage={currentLanguage}
            difficulty={difficulty}
            onComplete={handleGameComplete}
          />
        );
      case 3: // Rapid Fire
        return (
          <RapidFire
            user={user}
            currentLanguage={currentLanguage}
            difficulty={difficulty}
            onComplete={handleGameComplete}
          />
        );
      case 4: // Story Completion
        return (
          <StoryCompletion
            user={user}
            currentLanguage={currentLanguage}
            difficulty={difficulty}
            onComplete={handleGameComplete}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Game Not Found</h3>
            <p className="text-gray-600 mb-6">
              Sorry, the game you're looking for doesn't exist or hasn't been implemented yet.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/games'}
              className="text-gray-600 hover:text-gray-800"
            >
              Return to Games
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="game-container">
      {renderGame()}
    </div>
  );
}