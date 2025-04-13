import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface StoryCompletionProps {
  user: Omit<User, "password">;
  currentLanguage: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  onComplete?: (score: number, totalPossible: number) => void;
}

type StorySegment = {
  id: number;
  text: string;
  blanks: Array<{
    id: number;
    options: string[];
    correctIndex: number;
  }>;
};

interface StoryCompletionState {
  stories: StorySegment[];
  currentStoryIndex: number;
  userAnswers: number[];
  score: number;
  gameComplete: boolean;
  timeRemaining: number;
  gameStarted: boolean;
  submitted: boolean;
}

// Data for different languages and difficulty levels
const STORIES = {
  en: {
    beginner: [
      {
        id: 1,
        text: "Once upon a time, there was a little girl who lived in a village near the forest. She loved to wear her red $BLANK_0. One day, her mother asked her to take some food to her grandmother, who lived $BLANK_1 in the woods.",
        blanks: [
          {
            id: 0,
            options: ["hat", "coat", "boots", "scarf"],
            correctIndex: 1
          },
          {
            id: 1,
            options: ["nearby", "far away", "deep", "hidden"],
            correctIndex: 2
          }
        ]
      },
      {
        id: 2,
        text: "The sun was $BLANK_0 brightly as the children played in the park. They were running, jumping, and having a wonderful time. Their parents watched from $BLANK_1, smiling at their joy.",
        blanks: [
          {
            id: 0,
            options: ["shining", "setting", "rising", "moving"],
            correctIndex: 0
          },
          {
            id: 1,
            options: ["nearby", "afar", "home", "above"],
            correctIndex: 0
          }
        ]
      }
    ],
    intermediate: [
      {
        id: 1,
        text: "The ancient library was filled with books that hadn't been touched for centuries. As Sarah walked through the $BLANK_0 aisles, she felt a strange sense of $BLANK_1. Suddenly, one of the books caught her attention.",
        blanks: [
          {
            id: 0,
            options: ["dusty", "narrow", "crowded", "endless"],
            correctIndex: 0
          },
          {
            id: 1,
            options: ["wonder", "fear", "nostalgia", "curiosity"],
            correctIndex: 3
          }
        ]
      },
      {
        id: 2,
        text: "The expedition team had been traveling through the dense jungle for days. Their supplies were $BLANK_0, and morale was low. Just as they were about to give up, they discovered a $BLANK_1 that wasn't on any of their maps.",
        blanks: [
          {
            id: 0,
            options: ["abundant", "dwindling", "organized", "forgotten"],
            correctIndex: 1
          },
          {
            id: 1,
            options: ["river", "temple", "village", "mountain"],
            correctIndex: 1
          }
        ]
      }
    ],
    advanced: [
      {
        id: 1,
        text: "The quantum physicist's latest experiment had yielded results that were both $BLANK_0 and contradictory to established theories. The scientific community was $BLANK_1, with some embracing the new paradigm while others clung to traditional interpretations of reality.",
        blanks: [
          {
            id: 0,
            options: ["predictable", "inconclusive", "unprecedented", "negligible"],
            correctIndex: 2
          },
          {
            id: 1,
            options: ["polarized", "indifferent", "united", "amused"],
            correctIndex: 0
          }
        ]
      },
      {
        id: 2,
        text: "The renaissance of post-modern literature in the 21st century has been characterized by a $BLANK_0 of conventional narrative structures, embracing instead the $BLANK_1 nature of human experience in an increasingly fragmented digital society.",
        blanks: [
          {
            id: 0,
            options: ["rejection", "celebration", "extension", "analysis"],
            correctIndex: 0
          },
          {
            id: 1,
            options: ["linear", "non-linear", "predictable", "simplistic"],
            correctIndex: 1
          }
        ]
      }
    ]
  },
  te: {
    beginner: [
      {
        id: 1,
        text: "అనగనగా ఒక అడివి దగ్గర ఒక చిన్న గ్రామంలో ఒక చిన్న అమ్మాయి నివసించేది. ఆమె ఎర్రని $BLANK_0 ధరించడం ఇష్టం. ఒక రోజు, ఆమె తల్లి ఆమెను అడవిలో $BLANK_1 నివసించే ఆమె అమ్మమ్మకు కొంత ఆహారం తీసుకువెళ్లమని అడిగింది.",
        blanks: [
          {
            id: 0,
            options: ["టోపీ", "కోటు", "బూట్లు", "కండువా"],
            correctIndex: 1
          },
          {
            id: 1,
            options: ["దగ్గరగా", "దూరంగా", "లోతుగా", "దాగి"],
            correctIndex: 2
          }
        ]
      },
      {
        id: 2,
        text: "పిల్లలు పార్కులో ఆడుతున్నప్పుడు సూర్యుడు $BLANK_0 ప్రకాశిస్తున్నాడు. వారు పరుగెత్తడం, దూకడం మరియు అద్భుతమైన సమయాన్ని గడుపుతున్నారు. వారి తల్లిదండ్రులు $BLANK_1 నుండి చూస్తూ, వారి ఆనందానికి నవ్వుతున్నారు.",
        blanks: [
          {
            id: 0,
            options: ["ప్రకాశవంతంగా", "అస్తమిస్తూ", "ఉదయిస్తూ", "కదులుతూ"],
            correctIndex: 0
          },
          {
            id: 1,
            options: ["దగ్గరగా", "దూరంగా", "ఇంటి", "పైన"],
            correctIndex: 0
          }
        ]
      }
    ],
    intermediate: [
      {
        id: 1,
        text: "ప్రాచీన గ్రంథాలయంలో శతాబ్దాలుగా ఎవరూ తాకని పుస్తకాలు నిండి ఉన్నాయి. సారా $BLANK_0 అలమరల గుండా నడుస్తూ, ఆమె విచిత్రమైన $BLANK_1 భావనను అనుభవించింది. అకస్మాత్తుగా, ఒక పుస్తకం ఆమె దృష్టిని ఆకర్షించింది.",
        blanks: [
          {
            id: 0,
            options: ["దుమ్ము పట్టిన", "ఇరుకైన", "రద్దీగా ఉన్న", "అనంతమైన"],
            correctIndex: 0
          },
          {
            id: 1,
            options: ["ఆశ్చర్యం", "భయం", "నాస్టాల్జియా", "కుతూహలం"],
            correctIndex: 3
          }
        ]
      },
      {
        id: 2,
        text: "అన్వేషణ బృందం రోజులుగా దట్టమైన అడవి గుండా ప్రయాణిస్తోంది. వారి సరఫరాలు $BLANK_0, మరియు నైతికత తక్కువగా ఉంది. వారు వదిలేయబోతున్న సమయంలో, వారు వారి మ్యాపుల్లో లేని ఒక $BLANK_1 కనుగొన్నారు.",
        blanks: [
          {
            id: 0,
            options: ["సమృద్ధిగా", "తగ్గిపోతున్నాయి", "సంఘటితం", "మరచిపోయారు"],
            correctIndex: 1
          },
          {
            id: 1,
            options: ["నది", "దేవాలయం", "గ్రామం", "పర్వతం"],
            correctIndex: 1
          }
        ]
      }
    ],
    advanced: [
      {
        id: 1,
        text: "క్వాంటం భౌతిక శాస్త్రవేత్త యొక్క తాజా ప్రయోగం స్థాపిత సిద్ధాంతాలకు $BLANK_0 మరియు విరుద్ధమైన ఫలితాలను ఇచ్చింది. కొందరు కొత్త విధానాన్ని స్వీకరిస్తున్నప్పుడు మరికొందరు వాస్తవికత యొక్క సాంప్రదాయ వ్యాఖ్యానాలను అంటిపెట్టుకున్నారు, శాస్త్రీయ సమాజం $BLANK_1 ఉంది.",
        blanks: [
          {
            id: 0,
            options: ["ఊహించదగిన", "తేల్చలేని", "అపూర్వమైన", "అల్పమైన"],
            correctIndex: 2
          },
          {
            id: 1,
            options: ["విభేదించిన", "ఉదాసీనంగా", "ఐక్యమైన", "వినోదభరితంగా"],
            correctIndex: 0
          }
        ]
      },
      {
        id: 2,
        text: "21వ శతాబ్దంలో పోస్ట్-మోడర్న్ సాహిత్యం పునరుజ్జీవనం సాంప్రదాయ కథన నిర్మాణాల $BLANK_0 ద్వారా గుర్తించబడింది, బదులుగా క్రమంగా విచ్ఛిన్నమైన డిజిటల్ సమాజంలో మానవ అనుభవం యొక్క $BLANK_1 స్వభావాన్ని స్వీకరించింది.",
        blanks: [
          {
            id: 0,
            options: ["తిరస్కరణ", "వేడుక", "విస్తరణ", "విశ్లేషణ"],
            correctIndex: 0
          },
          {
            id: 1,
            options: ["రేఖీయ", "రేఖీయేతర", "ఊహించదగిన", "సరళమైన"],
            correctIndex: 1
          }
        ]
      }
    ]
  },
  hi: {
    beginner: [
      {
        id: 1,
        text: "एक समय की बात है, जंगल के पास एक गांव में एक छोटी लड़की रहती थी। उसे अपनी लाल $BLANK_0 पहनना बहुत पसंद था। एक दिन, उसकी मां ने उसे जंगल में $BLANK_1 रहने वाली उसकी दादी के पास कुछ खाना पहुंचाने के लिए कहा।",
        blanks: [
          {
            id: 0,
            options: ["टोपी", "कोट", "जूते", "स्कार्फ"],
            correctIndex: 1
          },
          {
            id: 1,
            options: ["पास", "दूर", "गहरे", "छिपी हुई"],
            correctIndex: 2
          }
        ]
      },
      {
        id: 2,
        text: "बच्चे पार्क में खेल रहे थे और सूरज $BLANK_0 चमक रहा था। वे दौड़ रहे थे, कूद रहे थे, और बहुत मज़े कर रहे थे। उनके माता-पिता $BLANK_1 से देख रहे थे, उनकी खुशी पर मुस्कुरा रहे थे।",
        blanks: [
          {
            id: 0,
            options: ["चमकता", "डूबता", "उगता", "चलता"],
            correctIndex: 0
          },
          {
            id: 1,
            options: ["पास", "दूर", "घर", "ऊपर"],
            correctIndex: 0
          }
        ]
      }
    ],
    intermediate: [
      {
        id: 1,
        text: "प्राचीन पुस्तकालय में ऐसी किताबें भरी थीं जिन्हें सदियों से नहीं छुआ गया था। जैसे ही सारा $BLANK_0 गलियारों से गुजरी, उसे एक अजीब $BLANK_1 का एहसास हुआ। अचानक, एक किताब ने उसका ध्यान खींचा।",
        blanks: [
          {
            id: 0,
            options: ["धूल भरे", "संकरे", "भीड़ भरे", "अनंत"],
            correctIndex: 0
          },
          {
            id: 1,
            options: ["आश्चर्य", "डर", "नोस्टैल्जिया", "जिज्ञासा"],
            correctIndex: 3
          }
        ]
      },
      {
        id: 2,
        text: "अभियान दल दिनों से घने जंगल से यात्रा कर रहा था। उनकी आपूर्ति $BLANK_0 थी, और मनोबल कम था। जैसे ही वे हार मानने वाले थे, उन्होंने एक $BLANK_1 की खोज की जो उनके किसी भी नक्शे में नहीं था।",
        blanks: [
          {
            id: 0,
            options: ["प्रचुर", "कम होती", "व्यवस्थित", "भूली हुई"],
            correctIndex: 1
          },
          {
            id: 1,
            options: ["नदी", "मंदिर", "गांव", "पहाड़"],
            correctIndex: 1
          }
        ]
      }
    ],
    advanced: [
      {
        id: 1,
        text: "क्वांटम भौतिक विज्ञानी के नवीनतम प्रयोग से ऐसे परिणाम प्राप्त हुए थे जो स्थापित सिद्धांतों के लिए $BLANK_0 और विरोधाभासी थे। वैज्ञानिक समुदाय $BLANK_1 था, कुछ ने नए प्रतिमान को अपनाया, जबकि अन्य वास्तविकता की पारंपरिक व्याख्याओं से चिपके रहे।",
        blanks: [
          {
            id: 0,
            options: ["अनुमानित", "अनिर्णायक", "अभूतपूर्व", "नगण्य"],
            correctIndex: 2
          },
          {
            id: 1,
            options: ["विभाजित", "उदासीन", "एकजुट", "मनोरंजित"],
            correctIndex: 0
          }
        ]
      },
      {
        id: 2,
        text: "21वीं सदी में पोस्ट-मॉडर्न साहित्य का पुनर्जागरण पारंपरिक कथात्मक संरचनाओं के $BLANK_0 की विशेषता है, जो बजाय तेजी से खंडित डिजिटल समाज में मानव अनुभव के $BLANK_1 प्रकृति को अपनाता है।",
        blanks: [
          {
            id: 0,
            options: ["अस्वीकार", "उत्सव", "विस्तार", "विश्लेषण"],
            correctIndex: 0
          },
          {
            id: 1,
            options: ["रेखीय", "गैर-रेखीय", "अनुमानित", "सरलीकृत"],
            correctIndex: 1
          }
        ]
      }
    ]
  }
};

export default function StoryCompletion({ user, currentLanguage, difficulty = "beginner", onComplete }: StoryCompletionProps) {
  const { toast } = useToast();
  
  const [state, setState] = useState<StoryCompletionState>({
    stories: [],
    currentStoryIndex: 0,
    userAnswers: [],
    score: 0,
    gameComplete: false,
    timeRemaining: 300, // 5 minutes
    gameStarted: false,
    submitted: false,
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
    // Get stories for the current language and difficulty
    const languageCode = currentLanguage as keyof typeof STORIES;
    const difficultyLevel = difficulty as keyof (typeof STORIES)[typeof languageCode];
    
    // Fallback to English if the current language is not available
    const availableLang = STORIES[languageCode] ? languageCode : 'en';
    
    // Fallback to beginner if the difficulty is not available
    const availableDifficulty = STORIES[availableLang][difficultyLevel] ? difficultyLevel : 'beginner';
    
    // Get stories and shuffle them
    const storyList = shuffleArray(STORIES[availableLang][availableDifficulty]);
    
    setState(prev => {
      // Initialize user answers array with -1 (no answer) for each blank in the first story
      const firstStory = storyList[0];
      const initialAnswers = new Array(firstStory.blanks.length).fill(-1);
      
      return {
        ...prev,
        stories: storyList,
        currentStoryIndex: 0,
        userAnswers: initialAnswers,
        score: 0,
        gameComplete: false,
        timeRemaining: 300,
        gameStarted: false,
        submitted: false,
      };
    });
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
            
            // Check answers for the current story if not already submitted
            if (!prev.submitted) {
              const correctCount = checkCorrectAnswers(prev.userAnswers);
              const newScore = prev.score + correctCount;
              
              // Save progress
              saveProgressMutation.mutate({
                score: newScore,
                total: getTotalPossibleScore()
              });
              
              if (onComplete) {
                onComplete(newScore, getTotalPossibleScore());
              }
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
        activityId: 4, // Story Completion game ID
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
      description: "Fill in the blanks to complete the stories.",
    });
  };
  
  const restartGame = () => {
    // Shuffle stories again
    const shuffledStories = shuffleArray([...state.stories]);
    const firstStory = shuffledStories[0];
    const initialAnswers = new Array(firstStory.blanks.length).fill(-1);
    
    setState(prev => ({
      ...prev,
      stories: shuffledStories,
      currentStoryIndex: 0,
      userAnswers: initialAnswers,
      score: 0,
      gameComplete: false,
      timeRemaining: 300,
      gameStarted: true,
      submitted: false,
    }));
  };
  
  // Get total possible score (number of blanks across all stories)
  const getTotalPossibleScore = (): number => {
    return state.stories.reduce((sum, story) => sum + story.blanks.length, 0);
  };
  
  // Check how many answers are correct in the current story
  const checkCorrectAnswers = (answers: number[]): number => {
    let correct = 0;
    const currentStory = state.stories[state.currentStoryIndex];
    
    currentStory.blanks.forEach((blank, index) => {
      if (answers[index] === blank.correctIndex) {
        correct++;
      }
    });
    
    return correct;
  };
  
  const handleOptionSelect = (blankIndex: number, optionIndex: number) => {
    if (state.submitted) return;
    
    setState(prev => {
      const newAnswers = [...prev.userAnswers];
      newAnswers[blankIndex] = optionIndex;
      return {
        ...prev,
        userAnswers: newAnswers
      };
    });
  };
  
  const handleSubmit = () => {
    // Check if all blanks have been filled
    const allFilled = state.userAnswers.every(answer => answer !== -1);
    
    if (!allFilled) {
      toast({
        title: "Incomplete",
        description: "Please fill in all the blanks before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    // Check correct answers
    const correctCount = checkCorrectAnswers(state.userAnswers);
    const newScore = state.score + correctCount;
    
    setState(prev => ({
      ...prev,
      score: newScore,
      submitted: true
    }));
    
    // Check if this was the last story
    const isLastStory = state.currentStoryIndex === state.stories.length - 1;
    
    if (isLastStory) {
      // Game complete
      saveProgressMutation.mutate({
        score: newScore,
        total: getTotalPossibleScore()
      });
      
      if (onComplete) {
        onComplete(newScore, getTotalPossibleScore());
      }
      
      setState(prev => ({
        ...prev,
        gameComplete: true
      }));
      
      toast({
        title: "Game Complete!",
        description: `You scored ${newScore} out of ${getTotalPossibleScore()}.`,
      });
    } else {
      toast({
        title: `You got ${correctCount} out of ${state.stories[state.currentStoryIndex].blanks.length} correct!`,
        description: "Moving to the next story...",
      });
      
      // After a delay, move to the next story
      setTimeout(() => {
        const nextIndex = state.currentStoryIndex + 1;
        const nextStory = state.stories[nextIndex];
        const newAnswers = new Array(nextStory.blanks.length).fill(-1);
        
        setState(prev => ({
          ...prev,
          currentStoryIndex: nextIndex,
          userAnswers: newAnswers,
          submitted: false
        }));
      }, 2000);
    }
  };
  
  const handleNextStory = () => {
    const nextIndex = state.currentStoryIndex + 1;
    
    if (nextIndex < state.stories.length) {
      const nextStory = state.stories[nextIndex];
      const newAnswers = new Array(nextStory.blanks.length).fill(-1);
      
      setState(prev => ({
        ...prev,
        currentStoryIndex: nextIndex,
        userAnswers: newAnswers,
        submitted: false
      }));
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Function to process the story text and replace placeholders with inputs or answers
  const renderStoryText = () => {
    if (state.stories.length === 0) return null;
    
    const currentStory = state.stories[state.currentStoryIndex];
    const parts = currentStory.text.split(/(\$BLANK_\d+)/);
    
    return parts.map((part, idx) => {
      const blankMatch = part.match(/\$BLANK_(\d+)/);
      
      if (blankMatch) {
        const blankIndex = parseInt(blankMatch[1], 10);
        const blank = currentStory.blanks.find(b => b.id === blankIndex);
        
        if (!blank) return <span key={idx}>[BLANK]</span>;
        
        const userAnswer = state.userAnswers[blankIndex];
        
        if (state.submitted) {
          const isCorrect = userAnswer === blank.correctIndex;
          const answer = blank.options[userAnswer];
          
          return (
            <span 
              key={idx} 
              className={`px-1 py-0.5 rounded font-semibold ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {answer}
            </span>
          );
        } else {
          return (
            <span key={idx} className="px-1 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
              {userAnswer !== -1 ? blank.options[userAnswer] : '______'}
            </span>
          );
        }
      }
      
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-primary text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold font-nunito">Story Completion</h2>
            <p className="text-blue-100">Fill in the blanks to complete the stories</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <span className="font-bold">{state.score}</span>
              <span className="text-blue-100">/{getTotalPossibleScore()} points</span>
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready for Story Completion?</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Read the story and fill in the blanks with the correct words. Try to complete all stories before time runs out!
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
                {state.score}/{getTotalPossibleScore()}
              </div>
              <p className="text-gray-600">
                You answered {state.score} out of {getTotalPossibleScore()} blanks correctly.
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
            {state.stories.length > 0 && (
              <>
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="font-semibold text-gray-800">Story {state.currentStoryIndex + 1} of {state.stories.length}</h3>
                    <div className="text-xs text-gray-500">Time remaining: {formatTime(state.timeRemaining)}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <p className="text-lg leading-relaxed text-gray-800 mb-4">
                      {renderStoryText()}
                    </p>
                    
                    {state.submitted && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Explanation</h4>
                        <ul className="space-y-2">
                          {state.stories[state.currentStoryIndex].blanks.map((blank, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className={`inline-block w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                                state.userAnswers[idx] === blank.correctIndex ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                              }`}>
                                {state.userAnswers[idx] === blank.correctIndex ? '✓' : '✗'}
                              </span>
                              <span>
                                Blank {idx + 1}: The correct answer is "{blank.options[blank.correctIndex]}".
                                {state.userAnswers[idx] !== blank.correctIndex && (
                                  <span className="text-red-600"> You selected "{blank.options[state.userAnswers[idx]]}".</span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {!state.submitted ? (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Fill in the blanks:</h4>
                      
                      {state.stories[state.currentStoryIndex].blanks.map((blank, blankIdx) => (
                        <div key={blankIdx} className="mb-6">
                          <h5 className="text-gray-700 mb-2">Blank {blankIdx + 1}:</h5>
                          <RadioGroup value={state.userAnswers[blankIdx].toString()} onValueChange={(value) => handleOptionSelect(blankIdx, parseInt(value))}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {blank.options.map((option, optIdx) => (
                                <div key={optIdx} className="flex items-start space-x-2">
                                  <RadioGroupItem value={optIdx.toString()} id={`blank-${blankIdx}-option-${optIdx}`} />
                                  <Label htmlFor={`blank-${blankIdx}-option-${optIdx}`} className="cursor-pointer">{option}</Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                      
                      <div className="mt-6 text-center">
                        <Button
                          onClick={handleSubmit}
                          className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 rounded-lg"
                        >
                          Submit Answers
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 text-center">
                      {state.currentStoryIndex < state.stories.length - 1 ? (
                        <Button
                          onClick={handleNextStory}
                          className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 rounded-lg"
                        >
                          Next Story
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setState(prev => ({ ...prev, gameComplete: true }))}
                          className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 rounded-lg"
                        >
                          Finish Game
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}