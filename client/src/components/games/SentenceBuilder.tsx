import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface SentenceBuilderProps {
  user: Omit<User, "password">;
  currentLanguage: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  onComplete?: (score: number, totalPossible: number) => void;
}

type Sentence = {
  id: number;
  words: string[];
  correctOrder: string[];
  meaning: string;
};

interface SentenceBuilderState {
  sentences: Sentence[];
  currentSentenceIndex: number;
  currentWords: string[];
  score: number;
  gameComplete: boolean;
  timeRemaining: number;
  gameStarted: boolean;
}

// Data for different languages and difficulty levels
const SENTENCES = {
  en: {
    beginner: [
      {
        id: 1,
        words: ["I", "like", "to", "read", "books"],
        correctOrder: ["I", "like", "to", "read", "books"],
        meaning: "A simple sentence about enjoying reading"
      },
      {
        id: 2,
        words: ["She", "goes", "to", "school", "everyday"],
        correctOrder: ["She", "goes", "to", "school", "everyday"],
        meaning: "A statement about attending school regularly"
      },
      {
        id: 3,
        words: ["They", "are", "playing", "in", "the", "garden"],
        correctOrder: ["They", "are", "playing", "in", "the", "garden"],
        meaning: "Describing children's activity outdoors"
      },
      {
        id: 4,
        words: ["He", "likes", "to", "eat", "fruits", "and", "vegetables"],
        correctOrder: ["He", "likes", "to", "eat", "fruits", "and", "vegetables"],
        meaning: "A statement about healthy eating habits"
      },
    ],
    intermediate: [
      {
        id: 1,
        words: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"],
        correctOrder: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"],
        meaning: "A pangram containing all letters of the English alphabet"
      },
      {
        id: 2,
        words: ["She", "studied", "diligently", "for", "her", "upcoming", "examination"],
        correctOrder: ["She", "studied", "diligently", "for", "her", "upcoming", "examination"],
        meaning: "Describing someone's preparation for a test"
      },
      {
        id: 3,
        words: ["Despite", "the", "rain", "they", "continued", "with", "their", "planned", "hike"],
        correctOrder: ["Despite", "the", "rain", "they", "continued", "with", "their", "planned", "hike"],
        meaning: "A sentence about perseverance during bad weather"
      },
      {
        id: 4,
        words: ["The", "ancient", "manuscript", "contained", "secrets", "from", "a", "forgotten", "civilization"],
        correctOrder: ["The", "ancient", "manuscript", "contained", "secrets", "from", "a", "forgotten", "civilization"],
        meaning: "Describing an important historical document"
      },
    ],
    advanced: [
      {
        id: 1,
        words: ["The", "intricate", "patterns", "of", "celestial", "bodies", "have", "fascinated", "astronomers", "for", "centuries"],
        correctOrder: ["The", "intricate", "patterns", "of", "celestial", "bodies", "have", "fascinated", "astronomers", "for", "centuries"],
        meaning: "A sentence about the long-standing interest in astronomy"
      },
      {
        id: 2,
        words: ["Paradoxically", "the", "abundance", "of", "information", "available", "today", "has", "made", "discerning", "truth", "more", "difficult"],
        correctOrder: ["Paradoxically", "the", "abundance", "of", "information", "available", "today", "has", "made", "discerning", "truth", "more", "difficult"],
        meaning: "A reflection on information overload in modern society"
      },
      {
        id: 3,
        words: ["The", "quintessential", "characteristic", "of", "wisdom", "is", "the", "ability", "to", "learn", "from", "diverse", "perspectives"],
        correctOrder: ["The", "quintessential", "characteristic", "of", "wisdom", "is", "the", "ability", "to", "learn", "from", "diverse", "perspectives"],
        meaning: "A philosophical statement about the nature of wisdom"
      },
      {
        id: 4,
        words: ["Amidst", "the", "cacophony", "of", "urban", "life", "she", "discovered", "moments", "of", "tranquility", "in", "unexpected", "places"],
        correctOrder: ["Amidst", "the", "cacophony", "of", "urban", "life", "she", "discovered", "moments", "of", "tranquility", "in", "unexpected", "places"],
        meaning: "Finding peace in a busy city environment"
      },
    ],
  },
  te: {
    beginner: [
      {
        id: 1,
        words: ["నేను", "పుస్తకాలు", "చదవడం", "ఇష్టం"],
        correctOrder: ["నేను", "పుస్తకాలు", "చదవడం", "ఇష్టం"],
        meaning: "I like to read books"
      },
      {
        id: 2,
        words: ["ఆమె", "ప్రతిరోజు", "పాఠశాలకు", "వెళుతుంది"],
        correctOrder: ["ఆమె", "ప్రతిరోజు", "పాఠశాలకు", "వెళుతుంది"],
        meaning: "She goes to school everyday"
      },
      {
        id: 3,
        words: ["వారు", "తోటలో", "ఆడుతున్నారు"],
        correctOrder: ["వారు", "తోటలో", "ఆడుతున్నారు"],
        meaning: "They are playing in the garden"
      },
      {
        id: 4,
        words: ["అతను", "పండ్లు", "మరియు", "కూరగాయలు", "తినడం", "ఇష్టపడతాడు"],
        correctOrder: ["అతను", "పండ్లు", "మరియు", "కూరగాయలు", "తినడం", "ఇష్టపడతాడు"],
        meaning: "He likes to eat fruits and vegetables"
      },
    ],
    intermediate: [
      {
        id: 1,
        words: ["ఆకాశంలో", "మేఘాలు", "కదులుతున్నాయి"],
        correctOrder: ["ఆకాశంలో", "మేఘాలు", "కదులుతున్నాయి"],
        meaning: "Clouds are moving in the sky"
      },
      {
        id: 2,
        words: ["ఆమె", "పరీక్షకు", "శ్రద్ధగా", "అభ్యసించింది"],
        correctOrder: ["ఆమె", "పరీక్షకు", "శ్రద్ధగా", "అభ్యసించింది"],
        meaning: "She studied diligently for the examination"
      },
      {
        id: 3,
        words: ["వర్షం", "పడుతున్నా", "వారు", "ప్రణాళికాబద్ధమైన", "పర్వతారోహణను", "కొనసాగించారు"],
        correctOrder: ["వర్షం", "పడుతున్నా", "వారు", "ప్రణాళికాబద్ధమైన", "పర్వతారోహణను", "కొనసాగించారు"],
        meaning: "Despite the rain, they continued their planned hike"
      },
      {
        id: 4,
        words: ["ప్రాచీన", "గ్రంథం", "మరచిపోయిన", "నాగరికత", "నుండి", "రహస్యాలను", "కలిగి", "ఉంది"],
        correctOrder: ["ప్రాచీన", "గ్రంథం", "మరచిపోయిన", "నాగరికత", "నుండి", "రహస్యాలను", "కలిగి", "ఉంది"],
        meaning: "The ancient manuscript contained secrets from a forgotten civilization"
      },
    ],
    advanced: [
      {
        id: 1,
        words: ["ఖగోళ", "శాస్త్రవేత్తలు", "శతాబ్దాలుగా", "ఆకాశ", "వస్తువుల", "క్లిష్టమైన", "నమూనాలను", "ఆసక్తిగా", "అధ్యయనం", "చేస్తున్నారు"],
        correctOrder: ["ఖగోళ", "శాస్త్రవేత్తలు", "శతాబ్దాలుగా", "ఆకాశ", "వస్తువుల", "క్లిష్టమైన", "నమూనాలను", "ఆసక్తిగా", "అధ్యయనం", "చేస్తున్నారు"],
        meaning: "Astronomers have been studying the intricate patterns of celestial bodies for centuries with fascination"
      },
      {
        id: 2,
        words: ["వైరుధ్యంగా", "నేటి", "సమాచార", "సమృద్ధి", "సత్యాన్ని", "గుర్తించడం", "మరింత", "కష్టతరం", "చేసింది"],
        correctOrder: ["వైరుధ్యంగా", "నేటి", "సమాచార", "సమృద్ధి", "సత్యాన్ని", "గుర్తించడం", "మరింత", "కష్టతరం", "చేసింది"],
        meaning: "Paradoxically, the abundance of information today has made discerning truth more difficult"
      },
      {
        id: 3,
        words: ["జ్ఞానం", "యొక్క", "ప్రధాన", "లక్షణం", "విభిన్న", "దృక్కోణాల", "నుండి", "నేర్చుకునే", "సామర్థ్యం"],
        correctOrder: ["జ్ఞానం", "యొక్క", "ప్రధాన", "లక్షణం", "విభిన్న", "దృక్కోణాల", "నుండి", "నేర్చుకునే", "సామర్థ్యం"],
        meaning: "The quintessential characteristic of wisdom is the ability to learn from diverse perspectives"
      },
      {
        id: 4,
        words: ["నగర", "జీవితపు", "కోలాహలం", "మధ్య", "ఆమె", "అనూహ్యమైన", "ప్రదేశాల్లో", "ప్రశాంతత", "క్షణాలను", "కనుగొన్నది"],
        correctOrder: ["నగర", "జీవితపు", "కోలాహలం", "మధ్య", "ఆమె", "అనూహ్యమైన", "ప్రదేశాల్లో", "ప్రశాంతత", "క్షణాలను", "కనుగొన్నది"],
        meaning: "Amidst the cacophony of urban life, she discovered moments of tranquility in unexpected places"
      },
    ],
  },
  hi: {
    beginner: [
      {
        id: 1,
        words: ["मुझे", "किताबें", "पढ़ना", "पसंद", "है"],
        correctOrder: ["मुझे", "किताबें", "पढ़ना", "पसंद", "है"],
        meaning: "I like to read books"
      },
      {
        id: 2,
        words: ["वह", "हर", "दिन", "स्कूल", "जाती", "है"],
        correctOrder: ["वह", "हर", "दिन", "स्कूल", "जाती", "है"],
        meaning: "She goes to school everyday"
      },
      {
        id: 3,
        words: ["वे", "बगीचे", "में", "खेल", "रहे", "हैं"],
        correctOrder: ["वे", "बगीचे", "में", "खेल", "रहे", "हैं"],
        meaning: "They are playing in the garden"
      },
      {
        id: 4,
        words: ["वह", "फल", "और", "सब्जियां", "खाना", "पसंद", "करता", "है"],
        correctOrder: ["वह", "फल", "और", "सब्जियां", "खाना", "पसंद", "करता", "है"],
        meaning: "He likes to eat fruits and vegetables"
      },
    ],
    intermediate: [
      {
        id: 1,
        words: ["आकाश", "में", "बादल", "चल", "रहे", "हैं"],
        correctOrder: ["आकाश", "में", "बादल", "चल", "रहे", "हैं"],
        meaning: "Clouds are moving in the sky"
      },
      {
        id: 2,
        words: ["उसने", "अपनी", "आगामी", "परीक्षा", "के", "लिए", "मेहनत", "से", "पढ़ाई", "की"],
        correctOrder: ["उसने", "अपनी", "आगामी", "परीक्षा", "के", "लिए", "मेहनत", "से", "पढ़ाई", "की"],
        meaning: "She studied diligently for her upcoming examination"
      },
      {
        id: 3,
        words: ["बारिश", "के", "बावजूद", "उन्होंने", "अपनी", "नियोजित", "पर्वतारोहण", "जारी", "रखी"],
        correctOrder: ["बारिश", "के", "बावजूद", "उन्होंने", "अपनी", "नियोजित", "पर्वतारोहण", "जारी", "रखी"],
        meaning: "Despite the rain, they continued their planned hike"
      },
      {
        id: 4,
        words: ["प्राचीन", "पांडुलिपि", "में", "एक", "भूली", "हुई", "सभ्यता", "के", "रहस्य", "थे"],
        correctOrder: ["प्राचीन", "पांडुलिपि", "में", "एक", "भूली", "हुई", "सभ्यता", "के", "रहस्य", "थे"],
        meaning: "The ancient manuscript contained secrets from a forgotten civilization"
      },
    ],
    advanced: [
      {
        id: 1,
        words: ["खगोलीय", "पिंडों", "के", "जटिल", "पैटर्न", "सदियों", "से", "खगोलविदों", "को", "आकर्षित", "करते", "रहे", "हैं"],
        correctOrder: ["खगोलीय", "पिंडों", "के", "जटिल", "पैटर्न", "सदियों", "से", "खगोलविदों", "को", "आकर्षित", "करते", "रहे", "हैं"],
        meaning: "The intricate patterns of celestial bodies have fascinated astronomers for centuries"
      },
      {
        id: 2,
        words: ["विरोधाभासी", "रूप", "से", "आज", "उपलब्ध", "जानकारी", "की", "प्रचुरता", "ने", "सत्य", "को", "पहचानना", "अधिक", "कठिन", "बना", "दिया", "है"],
        correctOrder: ["विरोधाभासी", "रूप", "से", "आज", "उपलब्ध", "जानकारी", "की", "प्रचुरता", "ने", "सत्य", "को", "पहचानना", "अधिक", "कठिन", "बना", "दिया", "है"],
        meaning: "Paradoxically, the abundance of information available today has made discerning truth more difficult"
      },
      {
        id: 3,
        words: ["ज्ञान", "की", "अनिवार्य", "विशेषता", "विविध", "दृष्टिकोणों", "से", "सीखने", "की", "क्षमता", "है"],
        correctOrder: ["ज्ञान", "की", "अनिवार्य", "विशेषता", "विविध", "दृष्टिकोणों", "से", "सीखने", "की", "क्षमता", "है"],
        meaning: "The quintessential characteristic of wisdom is the ability to learn from diverse perspectives"
      },
      {
        id: 4,
        words: ["शहरी", "जीवन", "के", "कोलाहल", "के", "बीच", "उसने", "अप्रत्याशित", "स्थानों", "में", "शांति", "के", "क्षण", "खोजे"],
        correctOrder: ["शहरी", "जीवन", "के", "कोलाहल", "के", "बीच", "उसने", "अप्रत्याशित", "स्थानों", "में", "शांति", "के", "क्षण", "खोजे"],
        meaning: "Amidst the cacophony of urban life, she discovered moments of tranquility in unexpected places"
      },
    ],
  },
};

export default function SentenceBuilder({ user, currentLanguage, difficulty = "beginner", onComplete }: SentenceBuilderProps) {
  const { toast } = useToast();
  
  const [state, setState] = useState<SentenceBuilderState>({
    sentences: [],
    currentSentenceIndex: 0,
    currentWords: [],
    score: 0,
    gameComplete: false,
    timeRemaining: 180, // 3 minutes
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
    // Get sentences for the current language and difficulty
    const languageCode = currentLanguage as keyof typeof SENTENCES;
    const difficultyLevel = difficulty as keyof (typeof SENTENCES)[typeof languageCode];
    
    // Fallback to English if the current language is not available
    const availableLang = SENTENCES[languageCode] ? languageCode : 'en';
    
    // Fallback to beginner if the difficulty is not available
    const availableDifficulty = SENTENCES[availableLang][difficultyLevel] ? difficultyLevel : 'beginner';
    
    const sentences = SENTENCES[availableLang][availableDifficulty];
    
    setState(prev => {
      // For the first sentence, shuffle its words
      const firstSentence = sentences[0];
      const shuffledWords = shuffleArray([...firstSentence.words]);
      
      return {
        ...prev,
        sentences,
        currentSentenceIndex: 0,
        currentWords: shuffledWords,
        score: 0,
        gameComplete: false,
        timeRemaining: 180,
        gameStarted: false,
      };
    });
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
              onComplete(prev.score, prev.sentences.length);
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
        activityId: 2, // Sentence Builder game ID
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
      description: "Arrange the words to form correct sentences before time runs out.",
    });
  };
  
  const restartGame = () => {
    const firstSentence = state.sentences[0];
    const shuffledWords = shuffleArray([...firstSentence.words]);
    
    setState(prev => ({
      ...prev,
      currentSentenceIndex: 0,
      currentWords: shuffledWords,
      score: 0,
      gameComplete: false,
      timeRemaining: 180,
      gameStarted: true
    }));
  };
  
  const checkSentence = () => {
    const currentSentence = state.sentences[state.currentSentenceIndex];
    const isCorrect = state.currentWords.join(" ") === currentSentence.correctOrder.join(" ");
    
    if (isCorrect) {
      // Score update
      const newScore = state.score + 1;
      
      // Check if this was the last sentence
      const isLastSentence = state.currentSentenceIndex === state.sentences.length - 1;
      
      if (isLastSentence) {
        // Game complete
        saveProgressMutation.mutate({
          score: newScore,
          total: state.sentences.length
        });
        
        if (onComplete) {
          onComplete(newScore, state.sentences.length);
        }
        
        setState(prev => ({
          ...prev,
          score: newScore,
          gameComplete: true
        }));
        
        toast({
          title: "Game Complete!",
          description: `You scored ${newScore} out of ${state.sentences.length}.`,
        });
      } else {
        // Move to next sentence
        const nextIndex = state.currentSentenceIndex + 1;
        const nextSentence = state.sentences[nextIndex];
        const shuffledNextWords = shuffleArray([...nextSentence.words]);
        
        setState(prev => ({
          ...prev,
          currentSentenceIndex: nextIndex,
          currentWords: shuffledNextWords,
          score: newScore
        }));
        
        toast({
          title: "Correct!",
          description: "Moving to the next sentence.",
        });
      }
    } else {
      toast({
        title: "Not Quite Right",
        description: "Try rearranging the words to form a correct sentence.",
        variant: "destructive"
      });
    }
  };
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(state.currentWords);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setState(prev => ({
      ...prev,
      currentWords: items
    }));
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
            <h2 className="text-2xl font-bold font-nunito">Sentence Builder</h2>
            <p className="text-blue-100">Arrange words to form correct sentences</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <span className="font-bold">{state.score}</span>
              <span className="text-blue-100">/{state.sentences.length} complete</span>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to play Sentence Builder?</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Drag and drop words to arrange them into correct sentences. You have 3 minutes to complete all sentences.
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
                {state.score}/{state.sentences.length}
              </div>
              <p className="text-gray-600">
                You completed {state.score} out of {state.sentences.length} sentences correctly.
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
            {state.sentences.length > 0 && (
              <>
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-2">Sentence {state.currentSentenceIndex + 1} of {state.sentences.length}</h3>
                  <p className="text-gray-600 italic mb-4">
                    Meaning: {state.sentences[state.currentSentenceIndex].meaning}
                  </p>
                  
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="words" direction="horizontal">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex flex-wrap gap-2 min-h-16 p-4 border-2 border-dashed border-gray-300 rounded-lg"
                          >
                            {state.currentWords.map((word, index) => (
                              <Draggable key={index} draggableId={`word-${index}`} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-move"
                                  >
                                    {word}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={checkSentence}
                      className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 rounded-lg"
                    >
                      Check Sentence
                    </Button>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Tips</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Drag and drop words to rearrange them</li>
                    <li>Pay attention to the meaning to help you form the correct sentence</li>
                    <li>In some languages, the word order might be different from English</li>
                    <li>Remember to click "Check Sentence" when you're ready to submit your answer</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}