import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

interface RapidFireProps {
  user: Omit<User, "password">;
  currentLanguage: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  onComplete?: (score: number, totalPossible: number) => void;
}

type Word = {
  id: number;
  text: string;
  meaning?: string;
};

interface RapidFireState {
  words: Word[];
  currentWordIndex: number;
  userInput: string;
  score: number;
  streak: number;
  gameComplete: boolean;
  timeRemaining: number;
  totalTime: number;
  gameStarted: boolean;
  wordTimer: number;
  wordTimerMax: number;
  mistakes: number;
}

// Data for different languages and difficulty levels
const WORDS = {
  en: {
    beginner: [
      { id: 1, text: "house", meaning: "A building for human habitation" },
      { id: 2, text: "apple", meaning: "A round fruit with red, green, or yellow skin" },
      { id: 3, text: "book", meaning: "A written or printed work consisting of pages" },
      { id: 4, text: "water", meaning: "A clear, colorless, odorless liquid" },
      { id: 5, text: "friend", meaning: "A person with whom one has a bond of mutual affection" },
      { id: 6, text: "school", meaning: "An institution for educating children" },
      { id: 7, text: "family", meaning: "A group of people related by blood or marriage" },
      { id: 8, text: "food", meaning: "Any nutritious substance consumed to maintain life" },
      { id: 9, text: "tree", meaning: "A woody perennial plant with a trunk and branches" },
      { id: 10, text: "bird", meaning: "A warm-blooded animal with wings and feathers" },
      { id: 11, text: "chair", meaning: "A separate seat for one person" },
      { id: 12, text: "dog", meaning: "A domesticated carnivorous mammal" },
      { id: 13, text: "sun", meaning: "The star around which the earth orbits" },
      { id: 14, text: "car", meaning: "A road vehicle with four wheels" },
      { id: 15, text: "pen", meaning: "An instrument for writing with ink" },
    ],
    intermediate: [
      { id: 1, text: "universe", meaning: "All existing matter and space considered as a whole" },
      { id: 2, text: "adventure", meaning: "An unusual and exciting experience" },
      { id: 3, text: "incredible", meaning: "Impossible or very difficult to believe" },
      { id: 4, text: "remarkable", meaning: "Worthy of attention because unusual or exceptional" },
      { id: 5, text: "mysterious", meaning: "Difficult or impossible to understand or explain" },
      { id: 6, text: "knowledge", meaning: "Facts, information, and skills acquired through experience" },
      { id: 7, text: "experience", meaning: "Practical contact with and observation of facts" },
      { id: 8, text: "adventure", meaning: "An unusual and exciting experience" },
      { id: 9, text: "discovery", meaning: "The action or process of finding something unexpected" },
      { id: 10, text: "beautiful", meaning: "Pleasing the senses or mind aesthetically" },
      { id: 11, text: "delicious", meaning: "Highly pleasant to the taste" },
      { id: 12, text: "challenge", meaning: "A task or situation that tests someone's abilities" },
      { id: 13, text: "wonderful", meaning: "Inspiring delight, pleasure, or admiration" },
      { id: 14, text: "technology", meaning: "Machinery and equipment developed from scientific knowledge" },
      { id: 15, text: "education", meaning: "The process of receiving or giving systematic instruction" },
    ],
    advanced: [
      { id: 1, text: "serendipity", meaning: "The occurrence of fortunate discoveries by accident" },
      { id: 2, text: "ephemeral", meaning: "Lasting for a very short time" },
      { id: 3, text: "loquacious", meaning: "Tending to talk a great deal; garrulous" },
      { id: 4, text: "ubiquitous", meaning: "Present, appearing, or found everywhere" },
      { id: 5, text: "mellifluous", meaning: "Sweet or musical; pleasant to hear" },
      { id: 6, text: "quintessential", meaning: "Representing the most perfect example of a quality" },
      { id: 7, text: "sycophant", meaning: "A person who acts obsequiously toward someone" },
      { id: 8, text: "nefarious", meaning: "Wicked or criminal" },
      { id: 9, text: "clandestine", meaning: "Kept secret or done secretively" },
      { id: 10, text: "fortuitous", meaning: "Happening by chance rather than intention" },
      { id: 11, text: "pernicious", meaning: "Having a harmful effect, especially gradually or subtly" },
      { id: 12, text: "esoteric", meaning: "Intended for or understood by only a small number of people" },
      { id: 13, text: "cacophony", meaning: "A harsh, discordant mixture of sounds" },
      { id: 14, text: "superfluous", meaning: "Unnecessary, especially through being more than enough" },
      { id: 15, text: "juxtaposition", meaning: "The fact of placing things next to each other" },
    ],
  },
  te: {
    beginner: [
      { id: 1, text: "ఇల్లు", meaning: "House" },
      { id: 2, text: "ఆపిల్", meaning: "Apple" },
      { id: 3, text: "పుస్తకం", meaning: "Book" },
      { id: 4, text: "నీరు", meaning: "Water" },
      { id: 5, text: "స్నేహితుడు", meaning: "Friend" },
      { id: 6, text: "పాఠశాల", meaning: "School" },
      { id: 7, text: "కుటుంబం", meaning: "Family" },
      { id: 8, text: "ఆహారం", meaning: "Food" },
      { id: 9, text: "చెట్టు", meaning: "Tree" },
      { id: 10, text: "పక్షి", meaning: "Bird" },
      { id: 11, text: "కుర్చీ", meaning: "Chair" },
      { id: 12, text: "కుక్క", meaning: "Dog" },
      { id: 13, text: "సూర్యుడు", meaning: "Sun" },
      { id: 14, text: "కారు", meaning: "Car" },
      { id: 15, text: "కలం", meaning: "Pen" },
    ],
    intermediate: [
      { id: 1, text: "విశ్వం", meaning: "Universe" },
      { id: 2, text: "సాహసం", meaning: "Adventure" },
      { id: 3, text: "అద్భుతం", meaning: "Incredible" },
      { id: 4, text: "గణనీయమైన", meaning: "Remarkable" },
      { id: 5, text: "మిస్టరీ", meaning: "Mysterious" },
      { id: 6, text: "జ్ఞానం", meaning: "Knowledge" },
      { id: 7, text: "అనుభవం", meaning: "Experience" },
      { id: 8, text: "కథనం", meaning: "Narrative" },
      { id: 9, text: "ఆవిష్కరణ", meaning: "Discovery" },
      { id: 10, text: "అందమైన", meaning: "Beautiful" },
      { id: 11, text: "రుచికరమైన", meaning: "Delicious" },
      { id: 12, text: "సవాలు", meaning: "Challenge" },
      { id: 13, text: "అద్భుతమైన", meaning: "Wonderful" },
      { id: 14, text: "టెక్నాలజీ", meaning: "Technology" },
      { id: 15, text: "విద్య", meaning: "Education" },
    ],
    advanced: [
      { id: 1, text: "అదృష్టవశాత్తు", meaning: "Serendipity" },
      { id: 2, text: "క్షణికమైన", meaning: "Ephemeral" },
      { id: 3, text: "వాగాడంబరంగల", meaning: "Loquacious" },
      { id: 4, text: "సర్వవ్యాప్తమైన", meaning: "Ubiquitous" },
      { id: 5, text: "మధురమైన", meaning: "Mellifluous" },
      { id: 6, text: "సారాంశ", meaning: "Quintessential" },
      { id: 7, text: "చాపలూసుడు", meaning: "Sycophant" },
      { id: 8, text: "దుష్టమైన", meaning: "Nefarious" },
      { id: 9, text: "రహస్య", meaning: "Clandestine" },
      { id: 10, text: "అదృష్టవశాత్తు", meaning: "Fortuitous" },
      { id: 11, text: "హానికరమైన", meaning: "Pernicious" },
      { id: 12, text: "అసాధారణమైన", meaning: "Esoteric" },
      { id: 13, text: "కకోఫనీ", meaning: "Cacophony" },
      { id: 14, text: "అనవసరమైన", meaning: "Superfluous" },
      { id: 15, text: "ద్వంద్వ", meaning: "Juxtaposition" },
    ],
  },
  hi: {
    beginner: [
      { id: 1, text: "घर", meaning: "House" },
      { id: 2, text: "सेब", meaning: "Apple" },
      { id: 3, text: "किताब", meaning: "Book" },
      { id: 4, text: "पानी", meaning: "Water" },
      { id: 5, text: "दोस्त", meaning: "Friend" },
      { id: 6, text: "स्कूल", meaning: "School" },
      { id: 7, text: "परिवार", meaning: "Family" },
      { id: 8, text: "खाना", meaning: "Food" },
      { id: 9, text: "पेड़", meaning: "Tree" },
      { id: 10, text: "पक्षी", meaning: "Bird" },
      { id: 11, text: "कुर्सी", meaning: "Chair" },
      { id: 12, text: "कुत्ता", meaning: "Dog" },
      { id: 13, text: "सूरज", meaning: "Sun" },
      { id: 14, text: "कार", meaning: "Car" },
      { id: 15, text: "कलम", meaning: "Pen" },
    ],
    intermediate: [
      { id: 1, text: "ब्रह्मांड", meaning: "Universe" },
      { id: 2, text: "साहसिक", meaning: "Adventure" },
      { id: 3, text: "अविश्वसनीय", meaning: "Incredible" },
      { id: 4, text: "उल्लेखनीय", meaning: "Remarkable" },
      { id: 5, text: "रहस्यमय", meaning: "Mysterious" },
      { id: 6, text: "ज्ञान", meaning: "Knowledge" },
      { id: 7, text: "अनुभव", meaning: "Experience" },
      { id: 8, text: "कहानी", meaning: "Narrative" },
      { id: 9, text: "खोज", meaning: "Discovery" },
      { id: 10, text: "खूबसूरत", meaning: "Beautiful" },
      { id: 11, text: "स्वादिष्ट", meaning: "Delicious" },
      { id: 12, text: "चुनौती", meaning: "Challenge" },
      { id: 13, text: "अद्भुत", meaning: "Wonderful" },
      { id: 14, text: "प्रौद्योगिकी", meaning: "Technology" },
      { id: 15, text: "शिक्षा", meaning: "Education" },
    ],
    advanced: [
      { id: 1, text: "सुखद संयोग", meaning: "Serendipity" },
      { id: 2, text: "क्षणभंगुर", meaning: "Ephemeral" },
      { id: 3, text: "वाचाल", meaning: "Loquacious" },
      { id: 4, text: "सर्वव्यापी", meaning: "Ubiquitous" },
      { id: 5, text: "मधुर", meaning: "Mellifluous" },
      { id: 6, text: "सारतत्व", meaning: "Quintessential" },
      { id: 7, text: "चापलूस", meaning: "Sycophant" },
      { id: 8, text: "अधम", meaning: "Nefarious" },
      { id: 9, text: "गुप्त", meaning: "Clandestine" },
      { id: 10, text: "संयोगपूर्ण", meaning: "Fortuitous" },
      { id: 11, text: "हानिकारक", meaning: "Pernicious" },
      { id: 12, text: "गूढ़", meaning: "Esoteric" },
      { id: 13, text: "कर्कश ध्वनि", meaning: "Cacophony" },
      { id: 14, text: "अनावश्यक", meaning: "Superfluous" },
      { id: 15, text: "समीपता", meaning: "Juxtaposition" },
    ],
  },
};

export default function RapidFire({ user, currentLanguage, difficulty = "beginner", onComplete }: RapidFireProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Set time per word based on difficulty
  const getWordTimeBasedOnDifficulty = (diff: string): number => {
    switch (diff) {
      case "beginner": return 6;
      case "intermediate": return 5;
      case "advanced": return 4;
      default: return 6;
    }
  };
  
  const getTotalTimeBasedOnDifficulty = (diff: string): number => {
    switch (diff) {
      case "beginner": return 90;
      case "intermediate": return 75;
      case "advanced": return 60;
      default: return 90;
    }
  };
  
  const [state, setState] = useState<RapidFireState>({
    words: [],
    currentWordIndex: 0,
    userInput: "",
    score: 0,
    streak: 0,
    gameComplete: false,
    timeRemaining: getTotalTimeBasedOnDifficulty(difficulty),
    totalTime: getTotalTimeBasedOnDifficulty(difficulty),
    gameStarted: false,
    wordTimer: getWordTimeBasedOnDifficulty(difficulty),
    wordTimerMax: getWordTimeBasedOnDifficulty(difficulty),
    mistakes: 0,
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
    // Get words for the current language and difficulty
    const languageCode = currentLanguage as keyof typeof WORDS;
    const difficultyLevel = difficulty as keyof (typeof WORDS)[typeof languageCode];
    
    // Fallback to English if the current language is not available
    const availableLang = WORDS[languageCode] ? languageCode : 'en';
    
    // Fallback to beginner if the difficulty is not available
    const availableDifficulty = WORDS[availableLang][difficultyLevel] ? difficultyLevel : 'beginner';
    
    // Get words and shuffle them
    const wordList = shuffleArray(WORDS[availableLang][availableDifficulty]);
    
    setState(prev => ({
      ...prev,
      words: wordList,
      currentWordIndex: 0,
      userInput: "",
      score: 0,
      streak: 0,
      gameComplete: false,
      timeRemaining: getTotalTimeBasedOnDifficulty(difficulty),
      totalTime: getTotalTimeBasedOnDifficulty(difficulty),
      gameStarted: false,
      wordTimer: getWordTimeBasedOnDifficulty(difficulty),
      wordTimerMax: getWordTimeBasedOnDifficulty(difficulty),
      mistakes: 0,
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
              onComplete(prev.score, prev.words.length);
            }
            
            // Save progress
            saveProgressMutation.mutate({
              score: prev.score,
              total: prev.words.length
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
  
  // Word timer
  useEffect(() => {
    let wordTimer: NodeJS.Timeout;
    
    if (state.gameStarted && !state.gameComplete && state.wordTimer > 0) {
      wordTimer = setInterval(() => {
        setState(prev => {
          const newWordTimer = prev.wordTimer - 0.1;
          
          if (newWordTimer <= 0) {
            clearInterval(wordTimer);
            
            // Move to next word
            const nextIndex = prev.currentWordIndex + 1;
            
            // Check if we've gone through all words
            if (nextIndex >= prev.words.length) {
              // Game completed
              if (onComplete) {
                onComplete(prev.score, prev.words.length);
              }
              
              // Save progress
              saveProgressMutation.mutate({
                score: prev.score,
                total: prev.words.length
              });
              
              return {
                ...prev,
                gameComplete: true,
                wordTimer: 0
              };
            }
            
            return {
              ...prev,
              currentWordIndex: nextIndex,
              userInput: "",
              wordTimer: prev.wordTimerMax,
              streak: 0, // Reset streak on timeout
              mistakes: prev.mistakes + 1
            };
          }
          
          return {
            ...prev,
            wordTimer: newWordTimer
          };
        });
      }, 100); // Update every 100ms for smoother progress bar
    }
    
    return () => {
      if (wordTimer) clearInterval(wordTimer);
    };
  }, [state.gameStarted, state.gameComplete, state.wordTimer, state.currentWordIndex]);
  
  // Focus on input when game starts
  useEffect(() => {
    if (state.gameStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.gameStarted]);
  
  const saveProgressMutation = useMutation({
    mutationFn: async (data: { score: number; total: number }) => {
      const res = await apiRequest("POST", "/api/user-activity", {
        userId: user.id,
        activityType: "game",
        activityId: 3, // Rapid Fire game ID
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
      gameStarted: true,
      wordTimer: prev.wordTimerMax
    }));
    
    toast({
      title: "Game Started!",
      description: "Type each word as quickly as you can before time runs out.",
    });
  };
  
  const restartGame = () => {
    // Shuffle words again
    const shuffledWords = shuffleArray([...state.words]);
    
    setState(prev => ({
      ...prev,
      words: shuffledWords,
      currentWordIndex: 0,
      userInput: "",
      score: 0,
      streak: 0,
      gameComplete: false,
      timeRemaining: prev.totalTime,
      gameStarted: true,
      wordTimer: prev.wordTimerMax,
      mistakes: 0,
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      userInput: e.target.value
    }));
    
    // Check if input matches the current word
    if (e.target.value.toLowerCase() === state.words[state.currentWordIndex].text.toLowerCase()) {
      // Calculate points (base points + bonus for streak and remaining time)
      const basePoints = 1;
      const streakBonus = Math.min(state.streak * 0.1, 1); // Max 100% bonus for streak
      const timeBonus = (state.wordTimer / state.wordTimerMax) * 0.5; // Max 50% bonus for speed
      
      const pointsEarned = Math.ceil(basePoints * (1 + streakBonus + timeBonus));
      
      const newScore = state.score + pointsEarned;
      const newStreak = state.streak + 1;
      
      // Check if we've gone through all words
      const nextIndex = state.currentWordIndex + 1;
      
      if (nextIndex >= state.words.length) {
        // Game completed
        if (onComplete) {
          onComplete(newScore, state.words.length);
        }
        
        // Save progress
        saveProgressMutation.mutate({
          score: newScore,
          total: state.words.length
        });
        
        setState(prev => ({
          ...prev,
          score: newScore,
          streak: newStreak,
          gameComplete: true
        }));
        
        toast({
          title: "Game Complete!",
          description: `You typed all words correctly! Final score: ${newScore}`,
        });
        
        return;
      }
      
      // Move to next word
      setState(prev => ({
        ...prev,
        currentWordIndex: nextIndex,
        userInput: "",
        score: newScore,
        streak: newStreak,
        wordTimer: prev.wordTimerMax
      }));
      
      // Streak notifications
      if (newStreak === 5) {
        toast({
          title: "5x Streak!",
          description: "You're on fire!",
        });
      } else if (newStreak === 10) {
        toast({
          title: "10x Streak!",
          description: "Incredible typing speed!",
        });
      }
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate word timer percentage
  const wordTimerPercentage = (state.wordTimer / state.wordTimerMax) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-primary text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold font-nunito">Rapid Fire</h2>
            <p className="text-blue-100">Type words as quickly as you can</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <span className="font-bold">{state.score}</span>
              <span className="text-blue-100"> points</span>
            </div>
            
            <div className="text-white">
              <span className="font-bold">{formatTime(state.timeRemaining)}</span>
              <span className="text-blue-100"> remaining</span>
            </div>
            
            {state.streak >= 3 && (
              <Badge className="bg-red-500">
                {state.streak}x streak
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {!state.gameStarted ? (
          <div className="text-center py-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready for Rapid Fire?</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Type each word correctly before time runs out. Build a streak for bonus points!
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
                {state.score} points
              </div>
              <p className="text-gray-600">
                You completed {state.currentWordIndex} out of {state.words.length} words.
              </p>
              <p className="text-gray-600">
                Mistakes: {state.mistakes}
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
            {state.words.length > 0 && (
              <>
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="font-semibold text-gray-800">Word {state.currentWordIndex + 1} of {state.words.length}</h3>
                    <div className="text-xs text-gray-500">Time per word: {Math.max(Math.floor(state.wordTimer), 0)}s</div>
                  </div>
                  
                  <Progress
                    value={wordTimerPercentage}
                    className={`h-2 mb-6 ${wordTimerPercentage > 66 ? "bg-green-100" : wordTimerPercentage > 33 ? "bg-yellow-100" : "bg-red-100"}`}
                  />
                  
                  <div className="bg-gray-50 p-8 rounded-lg mb-6 text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-2">
                      {state.words[state.currentWordIndex].text}
                    </div>
                    {state.words[state.currentWordIndex].meaning && (
                      <div className="text-gray-600 italic">
                        {state.words[state.currentWordIndex].meaning}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="word-input" className="block text-sm font-medium text-gray-700 mb-1">
                      Type the word:
                    </label>
                    <input
                      id="word-input"
                      ref={inputRef}
                      type="text"
                      value={state.userInput}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Type here..."
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Score</h4>
                      <p className="text-gray-600">{state.score} points</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Streak</h4>
                      <p className="text-gray-600">{state.streak}x multiplier</p>
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