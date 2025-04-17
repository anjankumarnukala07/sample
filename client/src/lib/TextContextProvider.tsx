import React, { useState, createContext, ReactNode } from "react";

// Define types for context value
interface TextContextType {
  passage: string;
  setpassage: React.Dispatch<React.SetStateAction<string>>;
  incorrectWords: string[] | undefined;
  setIncorrectWords: React.Dispatch<React.SetStateAction<string[] | undefined>>;
}

// Creating context with default undefined
export const TextContext = createContext<TextContextType | undefined>(undefined);

// Props for provider
interface TextContextProviderProps {
  children: ReactNode;
}

// Creating Context Provider
function TextContextProvider({ children }: TextContextProviderProps) {
  const [passage, setpassage] = useState<string>('');
  const [incorrectWords, setIncorrectWords] = useState<string[] | undefined>();

  return (
    <TextContext.Provider value={{ passage, setpassage, incorrectWords, setIncorrectWords }}>
      {children}
    </TextContext.Provider>
  );
}

export default TextContextProvider;
