import { useState, useEffect, useCallback, useRef } from "react";

// Add TypeScript definitions for SpeechRecognition API
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionAlternative {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative & {
    isFinal?: boolean;
  };
}

interface SpeechRecognitionEvent {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

// Add global declarations
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface UseSpeechRecognitionOptions {
  language?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasRecognitionSupport: boolean;
}

export function useSpeechRecognition(options?: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Map language codes to speech recognition language codes
  const getLanguageCode = (lang?: string) => {
    if (!lang) return 'en-US';
    
    const languageMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      te: 'te-IN'
    };
    
    return languageMap[lang] || 'en-US';
  };

  useEffect(() => {
    // Check if SpeechRecognition is supported
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognitionInstance = new SpeechRecognitionClass();
        
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        
        // Set language if provided
        if (options?.language) {
          recognitionInstance.lang = getLanguageCode(options.language);
        }
        
        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            // For Telugu, sometimes we need to access all alternatives, not just the first one
            if (options?.language === 'te') {
              // Get the best result (highest confidence)
              let bestResult = event.results[i][0];
              for (let j = 0; j < event.results[i].length; j++) {
                if (event.results[i][j].confidence > bestResult.confidence) {
                  bestResult = event.results[i][j];
                }
              }
              // Check if this result is final
              const isFinal = 'isFinal' in event.results[i] && event.results[i].isFinal;
              if (isFinal) {
                currentTranscript += bestResult.transcript + ' ';
              }
            } else {
              // Default behavior for other languages
              const isFinal = 'isFinal' in event.results[i] && event.results[i].isFinal;
              if (isFinal) {
                currentTranscript += event.results[i][0].transcript + ' ';
              }
            }
          }
          setTranscript(currentTranscript.trim());
        };
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        // Store the instance in the ref only
        recognitionRef.current = recognitionInstance;
        setHasRecognitionSupport(true);
      }
    } else {
      console.warn('Speech Recognition is not supported in this browser.');
      setHasRecognitionSupport(false);
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [options?.language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        // Update language if needed
        if (options?.language) {
          recognitionRef.current.lang = getLanguageCode(options.language);
        }
        
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [options?.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport
  };
}
