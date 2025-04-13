import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

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
      { id: 1, word: "Happy", meaning: "Feeling joy or pleasure" },
      { id: 2, word: "Sad", meaning: "Feeling sorrow or unhappiness" },
      { id: 3, word: "Big", meaning: "Large in size" },
      { id: 4, word: "Small", meaning: "Little in size" },
      { id: 5, word: "Fast", meaning: "Moving quickly" },
      { id: 6, word: "Slow", meaning: "Moving at a low speed" },
      { id: 7, word: "Hot", meaning: "High temperature" },
      { id: 8, word: "Cold", meaning: "Low temperature" },
    ],
    intermediate: [
      { id: 1, word: "Abundant", meaning: "Present in great quantity" },
      { id: 2, word: "Benevolent", meaning: "Well-meaning and kindly" },
      { id: 3, word: "Diligent", meaning: "Having or showing care in work" },
      { id: 4, word: "Eloquent", meaning: "Fluent or persuasive in speech" },
      { id: 5, word: "Frugal", meaning: "Economical with money or resources" },
      { id: 6, word: "Gregarious", meaning: "Fond of company, sociable" },
      { id: 7, word: "Inquisitive", meaning: "Curious or inquiring" },
      { id: 8, word: "Meticulous", meaning: "Showing great attention to detail" },
    ],
    advanced: [
      { id: 1, word: "Ephemeral", meaning: "Lasting for a very short time" },
      { id: 2, word: "Pernicious", meaning: "Having a harmful effect" },
      { id: 3, word: "Ubiquitous", meaning: "Present everywhere" },
      { id: 4, word: "Sycophant", meaning: "A person who acts obsequiously" },
      { id: 5, word: "Laconic", meaning: "Using very few words" },
      { id: 6, word: "Equivocate", meaning: "Use ambiguous language to conceal the truth" },
      { id: 7, word: "Perfidious", meaning: "Deceitful and untrustworthy" },
      { id: 8, word: "Ineffable", meaning: "Too great to be expressed in words" },
    ],
  },
  te: {
    beginner: [
      { id: 1, word: "ఆనందం", meaning: "Happiness or joy" },
      { id: 2, word: "విచారం", meaning: "Sadness or sorrow" },
      { id: 3, word: "పెద్ద", meaning: "Big or large" },
      { id: 4, word: "చిన్న", meaning: "Small or little" },
      { id: 5, word: "వేగంగా", meaning: "Fast or quick" },
      { id: 6, word: "నెమ్మదిగా", meaning: "Slow or gentle" },
      { id: 7, word: "వేడి", meaning: "Hot or warm" },
      { id: 8, word: "చల్లని", meaning: "Cold or cool" },
    ],
    intermediate: [
      { id: 1, word: "ప్రశాంతత", meaning: "Calmness or serenity" },
      { id: 2, word: "అద్భుతమైన", meaning: "Wonderful or amazing" },
      { id: 3, word: "పరిశ్రమ", meaning: "Industry or diligence" },
      { id: 4, word: "స్నేహం", meaning: "Friendship or camaraderie" },
      { id: 5, word: "భావన", meaning: "Emotion or feeling" },
      { id: 6, word: "జ్ఞానం", meaning: "Knowledge or wisdom" },
      { id: 7, word: "ధైర్యం", meaning: "Courage or bravery" },
      { id: 8, word: "స్వాతంత్ర్యం", meaning: "Freedom or liberty" },
    ],
    advanced: [
      { id: 1, word: "పరిపూర్ణత", meaning: "Perfection or flawlessness" },
      { id: 2, word: "అస్తిత్వం", meaning: "Existence or being" },
      { id: 3, word: "సంక్లిష్టత", meaning: "Complexity or intricacy" },
      { id: 4, word: "ఆవిష్కరణ", meaning: "Innovation or discovery" },
      { id: 5, word: "నిశ్శబ్దం", meaning: "Silence or quietness" },
      { id: 6, word: "సంవేదన", meaning: "Sensitivity or empathy" },
      { id: 7, word: "సాధారణీకరణ", meaning: "Generalization or abstraction" },
      { id: 8, word: "ఉత్తేజపరచడం", meaning: "Stimulation or excitement" },
    ],
  },
  hi: {
    beginner: [
      { id: 1, word: "खुशी", meaning: "Happiness or joy" },
      { id: 2, word: "दुःख", meaning: "Sadness or sorrow" },
      { id: 3, word: "बड़ा", meaning: "Big or large" },
      { id: 4, word: "छोटा", meaning: "Small or little" },
      { id: 5, word: "तेज़", meaning: "Fast or quick" },
      { id: 6, word: "धीमा", meaning: "Slow or gentle" },
      { id: 7, word: "गरम", meaning: "Hot or warm" },
      { id: 8, word: "ठंडा", meaning: "Cold or cool" },
    ],
    intermediate: [
      { id: 1, word: "शांति", meaning: "Peace or tranquility" },
      { id: 2, word: "अद्भुत", meaning: "Wonderful or amazing" },
      { id: 3, word: "परिश्रम", meaning: "Hard work or diligence" },
      { id: 4, word: "मित्रता", meaning: "Friendship or camaraderie" },
      { id: 5, word: "भावना", meaning: "Emotion or feeling" },
      { id: 6, word: "ज्ञान", meaning: "Knowledge or wisdom" },
      { id: 7, word: "साहस", meaning: "Courage or bravery" },
      { id: 8, word: "स्वतंत्रता", meaning: "Freedom or liberty" },
    ],
    advanced: [
      { id: 1, word: "परिपूर्णता", meaning: "Perfection or flawlessness" },
      { id: 2, word: "अस्तित्व", meaning: "Existence or being" },
      { id: 3, word: "जटिलता", meaning: "Complexity or intricacy" },
      { id: 4, word: "नवाचार", meaning: "Innovation or discovery" },
      { id: 5, word: "मौन", meaning: "Silence or quietness" },
      { id: 6, word: "संवेदनशीलता", meaning: "Sensitivity or empathy" },
      { id: 7, word: "सामान्यीकरण", meaning: "Generalization or abstraction" },
      { id: 8, word: "उत्तेजना", meaning: "Stimulation or excitement" },
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
    timeRemaining: 120, // 2 minutes in seconds
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
    
    const wordPairs = WORD_PAIRS[availableLang][availableDifficulty];
    
    setState(prev => ({
      ...prev,
      wordPairs,
      matchedPairs: new Set<number>(),
      attempts: 0,
      correctMatches: 0,
      gameComplete: false,
      timeRemaining: 120,
      gameStarted: false,
    }));
  }, [currentLanguage, difficulty]);
  
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
      description: "Match the words with their meanings before time runs out.",
    });
  };
  
  const handleWordClick = (wordPair: WordPair) => {
    if (!state.gameStarted || state.gameComplete || state.matchedPairs.has(wordPair.id)) {
      return;
    }
    
    if (!state.selectedWord) {
      setState(prev => ({
        ...prev,
        selectedWord: wordPair,
        selectedMeaning: null
      }));
    }
  };
  
  const handleMeaningClick = (wordPair: WordPair) => {
    if (!state.gameStarted || state.gameComplete || state.matchedPairs.has(wordPair.id)) {
      return;
    }
    
    if (!state.selectedMeaning) {
      setState(prev => {
        // If we already have a selected word
        if (prev.selectedWord) {
          const attempts = prev.attempts + 1;
          let correctMatches = prev.correctMatches;
          const matchedPairs = new Set(prev.matchedPairs);
          
          // Check if the selected word and meaning match
          const isMatch = prev.selectedWord.id === wordPair.id;
          
          if (isMatch) {
            matchedPairs.add(wordPair.id);
            correctMatches += 1;
            
            toast({
              title: "Correct!",
              description: `"${prev.selectedWord.word}" matches with "${wordPair.meaning}"`,
            });
            
            // Check if the game is complete
            const gameComplete = matchedPairs.size === prev.wordPairs.length;
            
            if (gameComplete) {
              // Save progress
              saveProgressMutation.mutate({
                score: correctMatches,
                total: prev.wordPairs.length
              });
              
              // Call onComplete callback
              if (onComplete) {
                onComplete(correctMatches, prev.wordPairs.length);
              }
              
              toast({
                title: "Game Complete!",
                description: `You matched ${correctMatches} out of ${prev.wordPairs.length} pairs correctly.`,
              });
            }
            
            return {
              ...prev,
              selectedWord: null,
              selectedMeaning: null,
              matchedPairs,
              attempts,
              correctMatches,
              gameComplete
            };
          } else {
            // Not a match, show both selected items briefly then clear them
            return {
              ...prev,
              selectedMeaning: wordPair,
              attempts
            };
          }
        } else {
          // Selected a meaning first without a word
          return {
            ...prev,
            selectedMeaning: wordPair
          };
        }
      });
      
      // If no match, clear selections after a brief delay
      if (state.selectedWord && state.selectedWord.id !== wordPair.id) {
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            selectedWord: null,
            selectedMeaning: null
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
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Shuffle words and meanings separately
  const shuffledWords = shuffleArray(state.wordPairs);
  const shuffledMeanings = shuffleArray(state.wordPairs);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-primary text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold font-nunito">Word Match</h2>
            <p className="text-blue-100">Match the words with their correct meanings</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <span className="font-bold">{state.correctMatches}</span>
              <span className="text-blue-100">/{state.wordPairs.length} matched</span>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to play Word Match?</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Match each word with its meaning before time runs out. You have 2 minutes to complete all matches.
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
                You matched {state.correctMatches} out of {state.wordPairs.length} correctly.
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Words Column */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Words</h3>
              <div className="grid grid-cols-1 gap-3">
                {shuffledWords.map(wordPair => (
                  <div
                    key={`word-${wordPair.id}`}
                    onClick={() => handleWordClick(wordPair)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      state.matchedPairs.has(wordPair.id)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : state.selectedWord?.id === wordPair.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium text-lg">{wordPair.word}</div>
                    {state.matchedPairs.has(wordPair.id) && (
                      <Badge className="mt-2 bg-green-100 text-green-700">
                        Matched
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Meanings Column */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Meanings</h3>
              <div className="grid grid-cols-1 gap-3">
                {shuffledMeanings.map(wordPair => (
                  <div
                    key={`meaning-${wordPair.id}`}
                    onClick={() => handleMeaningClick(wordPair)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      state.matchedPairs.has(wordPair.id)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : state.selectedMeaning?.id === wordPair.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{wordPair.meaning}</div>
                    {state.matchedPairs.has(wordPair.id) && (
                      <Badge className="mt-2 bg-green-100 text-green-700">
                        Matched
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}