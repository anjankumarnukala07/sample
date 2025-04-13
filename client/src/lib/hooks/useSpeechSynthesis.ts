import { useState, useCallback, useEffect } from "react";

interface UseSpeechSynthesisReturn {
  speak: (text: string, lang?: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  pause: () => void;
  resume: () => void;
  voices: SpeechSynthesisVoice[];
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Check if the SpeechSynthesis API is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      // Get available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      
      loadVoices();
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Set up event listeners for speech synthesis state
      const handleSpeechStart = () => setIsSpeaking(true);
      const handleSpeechEnd = () => setIsSpeaking(false);
      const handleSpeechPause = () => setIsPaused(true);
      const handleSpeechResume = () => setIsPaused(false);
      
      window.speechSynthesis.addEventListener('start', handleSpeechStart);
      window.speechSynthesis.addEventListener('end', handleSpeechEnd);
      window.speechSynthesis.addEventListener('pause', handleSpeechPause);
      window.speechSynthesis.addEventListener('resume', handleSpeechResume);
      
      return () => {
        window.speechSynthesis.removeEventListener('start', handleSpeechStart);
        window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
        window.speechSynthesis.removeEventListener('pause', handleSpeechPause);
        window.speechSynthesis.removeEventListener('resume', handleSpeechResume);
      };
    }
  }, []);

  // Find the best voice for the current language
  const findVoiceForLanguage = useCallback((lang: string): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;
    
    // Language codes mapping
    const languageCodes: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      te: 'te-IN'
    };
    
    const langCode = languageCodes[lang] || lang;
    
    // Try to find an exact match first
    let voice = voices.find(voice => voice.lang === langCode);
    
    // If no exact match, try to find a voice that starts with the language code
    if (!voice) {
      voice = voices.find(voice => voice.lang.startsWith(langCode.split('-')[0]));
    }
    
    // Fallback to the first available voice
    return voice || voices[0];
  }, [voices]);

  const speak = useCallback((text: string, lang = 'en') => {
    if (!isSupported) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = findVoiceForLanguage(lang);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    // Set language based on the selected language
    switch(lang) {
      case 'te':
        utterance.lang = 'te-IN';
        break;
      case 'hi':
        utterance.lang = 'hi-IN';
        break;
      default:
        utterance.lang = 'en-US';
    }
    
    // Set other properties
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [isSupported, findVoiceForLanguage]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  return {
    speak,
    cancel,
    isSpeaking,
    isPaused,
    isSupported,
    pause,
    resume,
    voices
  };
}
