import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

interface WordMatchProps {
  user: Omit<User, "password">;
  currentLanguage: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  onComplete?: (score: number, totalPossible: number) => void;
}

type WordPair = {
  id: number;
  word: string;
  meaning: string;
};

interface WordMatchState {
  wordPairs: WordPair[];
  selectedWord: WordPair | null;
  selectedMeaning: WordPair | null;
  matchedPairs: Set<number>;
  attempts: number;
  correctMatches: number;
  gameComplete: boolean;
  timeRemaining: number;
  gameStarted: boolean;
}

// Data for different languages and difficulty levels
const WORD_PAIRS = {
  en: {
    beginner: [
      { id: 1, word: "Apple", meaning: "A round fruit with red, green, or yellow skin" },
      { id: 2, word: "House", meaning: "A building for human habitation" },
      { id: 3, word: "Book", meaning: "A written or printed work consisting of pages" },
      { id: 4, word: "Water", meaning: "A clear, colorless, odorless liquid" },
      { id: 5, word: "Dog", meaning: "A domesticated carnivorous mammal" },
      { id: 6, word: "Sun", meaning: "The star around which the earth orbits" },
      { id: 7, word: "Tree", meaning: "A woody perennial plant with a trunk and branches" },
      { id: 8, word: "Car", meaning: "A road vehicle with four wheels" },
    ],
    intermediate: [
      { id: 1, word: "Celestial", meaning: "Positioned in or relating to the sky or outer space" },
      { id: 2, word: "Ambiguous", meaning: "Open to more than one interpretation" },
      { id: 3, word: "Eccentric", meaning: "Unconventional and slightly strange" },
      { id: 4, word: "Meticulous", meaning: "Showing great attention to detail" },
      { id: 5, word: "Euphoria", meaning: "A feeling or state of intense excitement and happiness" },
      { id: 6, word: "Arbitrary", meaning: "Based on random choice rather than reason" },
      { id: 7, word: "Eloquent", meaning: "Fluent or persuasive in speaking or writing" },
      { id: 8, word: "Resilient", meaning: "Able to recover quickly from difficulties" },
    ],
    advanced: [
      { id: 1, word: "Ubiquitous", meaning: "Present, appearing, or found everywhere" },
      { id: 2, word: "Ephemeral", meaning: "Lasting for a very short time" },
      { id: 3, word: "Serendipity", meaning: "The occurrence of fortunate discoveries by accident" },
      { id: 4, word: "Pernicious", meaning: "Having a harmful effect, especially gradually or subtly" },
      { id: 5, word: "Equanimity", meaning: "Mental calmness, composure, especially in difficult situations" },
      { id: 6, word: "Ineffable", meaning: "Too great or extreme to be expressed or described in words" },
      { id: 7, word: "Sycophant", meaning: "A person who acts obsequiously toward someone" },
      { id: 8, word: "Quixotic", meaning: "Extremely idealistic; unrealistic and impractical" },
    ],
  },
  te: {
    beginner: [
      { id: 1, word: "ఆపిల్", meaning: "Apple" },
      { id: 2, word: "ఇల్లు", meaning: "House" },
      { id: 3, word: "పుస్తకం", meaning: "Book" },
      { id: 4, word: "నీరు", meaning: "Water" },
      { id: 5, word: "కుక్క", meaning: "Dog" },
      { id: 6, word: "సూర్యుడు", meaning: "Sun" },
      { id: 7, word: "చెట్టు", meaning: "Tree" },
      { id: 8, word: "కారు", meaning: "Car" },
    ],
    intermediate: [
      { id: 1, word: "ఆకాశసంబంధిత", meaning: "Celestial" },
      { id: 2, word: "అస్పష్టమైన", meaning: "Ambiguous" },
      { id: 3, word: "విలక్షణమైన", meaning: "Eccentric" },
      { id: 4, word: "సూక్ష్మమైన", meaning: "Meticulous" },
      { id: 5, word: "ఆనందం", meaning: "Euphoria" },
      { id: 6, word: "ఏకపక్షపు", meaning: "Arbitrary" },
      { id: 7, word: "వాగ్మి", meaning: "Eloquent" },
      { id: 8, word: "స్థితిస్థాపకమైన", meaning: "Resilient" },
    ],
    advanced: [
      { id: 1, word: "సర్వవ్యాప్తమైన", meaning: "Ubiquitous" },
      { id: 2, word: "క్షణికమైన", meaning: "Ephemeral" },
      { id: 3, word: "అదృష్టవశాత్తు", meaning: "Serendipity" },
      { id: 4, word: "హానికరమైన", meaning: "Pernicious" },
      { id: 5, word: "మనస్సు ప్రశాంతత", meaning: "Equanimity" },
      { id: 6, word: "వర్ణనాతీతమైన", meaning: "Ineffable" },
      { id: 7, word: "చాపలూసుడు", meaning: "Sycophant" },
      { id: 8, word: "ఊహాజనితమైన", meaning: "Quixotic" },
    ],
  },
  hi: {
    beginner: [
      { id: 1, word: "सेब", meaning: "Apple" },
      { id: 2, word: "घर", meaning: "House" },
      { id: 3, word: "किताब", meaning: "Book" },
      { id: 4, word: "पानी", meaning: "Water" },
      { id: 5, word: "कुत्ता", meaning: "Dog" },
      { id: 6, word: "सूरज", meaning: "Sun" },
      { id: 7, word: "पेड़", meaning: "Tree" },
      { id: 8, word: "कार", meaning: "Car" },
    ],
    intermediate: [
      { id: 1, word: "आकाशीय", meaning: "Celestial" },
      { id: 2, word: "अस्पष्ट", meaning: "Ambiguous" },
      { id: 3, word: "विचित्र", meaning: "Eccentric" },
      { id: 4, word: "सूक्ष्म", meaning: "Meticulous" },
      { id: 5, word: "आनंद", meaning: "Euphoria" },
      { id: 6, word: "मनमाना", meaning: "Arbitrary" },
      { id: 7, word: "वाक्पटु", meaning: "Eloquent" },
      { id: 8, word: "लचीला", meaning: "Resilient" },
    ],
    advanced: [
      { id: 1, word: "सर्वव्यापी", meaning: "Ubiquitous" },
      { id: 2, word: "क्षणभंगुर", meaning: "Ephemeral" },
      { id: 3, word: "सुखद संयोग", meaning: "Serendipity" },
      { id: 4, word: "हानिकारक", meaning: "Pernicious" },
      { id: 5, word: "मानसिक शांति", meaning: "Equanimity" },
      { id: 6, word: "अवर्णनीय", meaning: "Ineffable" },
      { id: 7, word: "चापलूस", meaning: "Sycophant" },
      { id: 8, word: "आदर्शवादी", meaning: "Quixotic" },
    ],
  },
};

export default function WordMatch({ user, currentLanguage, difficulty = "beginner", onComplete }: WordMatchProps) {
  const { toast } = useToast();
  
  const [state, setState] = useState<WordMatchState>({
    wordPairs: [],
    selectedWord: null,
    selectedMeaning: null,
    matchedPairs: new Set<number>(),
    attempts: 0,
    correctMatches: 0,
    gameComplete: false,
    timeRemaining: 120, // 2 minutes
    gameStarted: false,
  });
  
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  useEffect(() => {
    // Get word pairs for the current language and difficulty
    const languageCode = currentLanguage as keyof typeof WORD_PAIRS;
    const difficultyLevel = difficulty as keyof (typeof WORD_PAIRS)[typeof languageCode];
    
    // Fallback to English if the current language is not available
    const availableLang = WORD_PAIRS[languageCode] ? languageCode : 'en';
    
    // Fallback to beginner if the difficulty is not available
    const availableDifficulty = WORD_PAIRS[availableLang][difficultyLevel] ? difficultyLevel : 'beginner';
    
    // Get word pairs and shuffle them
    const wordList = WORD_PAIRS[availableLang][availableDifficulty];
    
    setState(prev => ({
      ...prev,
      wordPairs: wordList,
      selectedWord: null,
      selectedMeaning: null,
      matchedPairs: new Set<number>(),
      attempts: 0,
      correctMatches: 0,
      gameComplete: false,
      timeRemaining: 120,
      gameStarted: false,
    }));
  }, [currentLanguage, difficulty]);
  
  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (state.gameStarted && !state.gameComplete && state.timeRemaining > 0) {
      timer = setInterval(() => {
        setState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            clearInterval(timer);
            
            // Game is over due to time
            if (onComplete) {
              onComplete(prev.correctMatches, prev.wordPairs.length);
            }
            
            // Save progress
            saveProgressMutation.mutate({
              score: prev.correctMatches,
              total: prev.wordPairs.length
            });
            
            return {
              ...prev,
              timeRemaining: 0,
              gameComplete: true
            };
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.gameStarted, state.gameComplete, state.timeRemaining, onComplete]);
  
  // Effect to check if all pairs are matched
  useEffect(() => {
    if (state.gameStarted && state.matchedPairs.size === state.wordPairs.length && state.wordPairs.length > 0) {
      // All pairs are matched - game complete
      if (onComplete) {
        onComplete(state.correctMatches, state.wordPairs.length);
      }
      
      // Save progress
      saveProgressMutation.mutate({
        score: state.correctMatches,
        total: state.wordPairs.length
      });
      
      setState(prev => ({
        ...prev,
        gameComplete: true
      }));
      
      toast({
        title: "Game Complete!",
        description: `You matched all words correctly! Final score: ${state.correctMatches}/${state.wordPairs.length}`,
      });
    }
  }, [state.matchedPairs, state.wordPairs.length, state.gameStarted, onComplete, state.correctMatches]);
  
  const saveProgressMutation = useMutation({
    mutationFn: async (data: { score: number; total: number }) => {
      const res = await apiRequest("POST", "/api/user-activity", {
        userId: user.id,
        activityType: "game",
        activityId: 1, // Word Match game ID
        score: data.score,
        total: data.total,
        languageCode: currentLanguage,
        completed: true,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/progress`] });
    }
  });
  
  const startGame = () => {
    setState(prev => ({
      ...prev,
      gameStarted: true
    }));
    
    toast({
      title: "Game Started!",
      description: "Match each word with its correct meaning to complete the game.",
    });
  };
  
  const restartGame = () => {
    setState(prev => ({
      ...prev,
      selectedWord: null,
      selectedMeaning: null,
      matchedPairs: new Set<number>(),
      attempts: 0,
      correctMatches: 0,
      gameComplete: false,
      timeRemaining: 120,
      gameStarted: true
    }));
  };
  
  const handleWordClick = (wordPair: WordPair) => {
    if (state.matchedPairs.has(wordPair.id) || state.gameComplete) return;
    
    // Check if this is the first selection or we're selecting a pair
    if (!state.selectedWord && !state.selectedMeaning) {
      // First selection
      setState(prev => ({
        ...prev,
        selectedWord: wordPair,
        selectedMeaning: null
      }));
    } else if (!state.selectedMeaning) {
      // Already selected a word, now selecting meaning
      if (state.selectedWord?.id === wordPair.id) {
        // Clicked the same word, deselect it
        setState(prev => ({
          ...prev,
          selectedWord: null
        }));
      } else {
        // Clicked a different word, switch selection
        setState(prev => ({
          ...prev,
          selectedWord: wordPair,
          selectedMeaning: null
        }));
      }
    } else if (!state.selectedWord) {
      // Already selected a meaning, now selecting word
      if (state.selectedMeaning?.id === wordPair.id) {
        // Clicked the same meaning, deselect it
        setState(prev => ({
          ...prev,
          selectedMeaning: null
        }));
      } else {
        // Clicked a different word, switch selection
        setState(prev => ({
          ...prev,
          selectedWord: wordPair,
          selectedMeaning: null
        }));
      }
    }
  };
  
  const handleMeaningClick = (wordPair: WordPair) => {
    if (state.matchedPairs.has(wordPair.id) || state.gameComplete) return;
    
    // Check if this is the first selection or we're selecting a pair
    if (!state.selectedWord && !state.selectedMeaning) {
      // First selection
      setState(prev => ({
        ...prev,
        selectedMeaning: wordPair,
        selectedWord: null
      }));
    } else if (!state.selectedWord) {
      // Already selected a meaning, now selecting word
      if (state.selectedMeaning?.id === wordPair.id) {
        // Clicked the same meaning, deselect it
        setState(prev => ({
          ...prev,
          selectedMeaning: null
        }));
      } else {
        // Clicked a different meaning, switch selection
        setState(prev => ({
          ...prev,
          selectedMeaning: wordPair,
          selectedWord: null
        }));
      }
    } else if (!state.selectedMeaning) {
      // Already selected a word, now selecting meaning
      if (state.selectedWord?.id === wordPair.id) {
        // We have a match!
        const newMatchedPairs = new Set(state.matchedPairs);
        newMatchedPairs.add(wordPair.id);
        
        setState(prev => ({
          ...prev,
          selectedWord: null,
          selectedMeaning: null,
          matchedPairs: newMatchedPairs,
          attempts: prev.attempts + 1,
          correctMatches: prev.correctMatches + 1
        }));
        
        toast({
          title: "Correct Match!",
          description: `${wordPair.word} = ${wordPair.meaning}`,
        });
      } else {
        // Not a match
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            selectedWord: null,
            selectedMeaning: null,
            attempts: prev.attempts + 1
          }));
          
          toast({
            title: "Not a match",
            description: "Try again!",
            variant: "destructive"
          });
        }, 1000);
      }
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-primary text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold font-nunito">Word Match</h2>
            <p className="text-blue-100">Match words with their meanings</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <span className="font-bold">{state.correctMatches}</span>
              <span className="text-blue-100">/{state.wordPairs.length} matches</span>
            </div>
            
            <div className="text-white">
              <span className="font-bold">{formatTime(state.timeRemaining)}</span>
              <span className="text-blue-100"> remaining</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {!state.gameStarted ? (
          <div className="text-center py-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Match Words?</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Click on a word, then click on its matching meaning. Match all pairs to win!
            </p>
            <Button
              onClick={startGame}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg"
            >
              Start Game
            </Button>
          </div>
        ) : state.gameComplete ? (
          <div className="text-center py-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Game Complete!</h3>
            
            <div className="mb-6">
              <div className="text-5xl font-bold text-primary mb-2">
                {state.correctMatches}/{state.wordPairs.length}
              </div>
              <p className="text-gray-600">
                You found {state.correctMatches} out of {state.wordPairs.length} matches.
              </p>
              <p className="text-gray-600">
                Total attempts: {state.attempts}
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <Button
                onClick={restartGame}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 rounded-lg"
              >
                Play Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = '/games'}
                className="text-gray-600 hover:text-gray-800"
              >
                Return to Games
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {state.wordPairs.length > 0 && (
              <>
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Match Words with Meanings</h3>
                  <p className="text-gray-600 mb-4">
                    Select a word from the left column, then select its matching meaning from the right column.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Words Column */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Words</h4>
                      <div className="space-y-2">
                        {state.wordPairs.map(pair => (
                          <div
                            key={`word-${pair.id}`}
                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                              state.matchedPairs.has(pair.id)
                                ? 'bg-green-100 text-green-800 opacity-50'
                                : state.selectedWord?.id === pair.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => handleWordClick(pair)}
                          >
                            {pair.word}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Meanings Column */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Meanings</h4>
                      <div className="space-y-2">
                        {shuffleArray([...state.wordPairs]).map(pair => (
                          <div
                            key={`meaning-${pair.id}`}
                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                              state.matchedPairs.has(pair.id)
                                ? 'bg-green-100 text-green-800 opacity-50'
                                : state.selectedMeaning?.id === pair.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            onClick={() => handleMeaningClick(pair)}
                          >
                            {pair.meaning}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Matches</h4>
                      <p className="text-gray-600">{state.correctMatches} of {state.wordPairs.length}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Attempts</h4>
                      <p className="text-gray-600">{state.attempts}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Time</h4>
                      <p className="text-gray-600">{formatTime(state.timeRemaining)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}