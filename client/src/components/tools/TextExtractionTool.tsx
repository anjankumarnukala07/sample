import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import { motion } from "framer-motion";
import { recognizeText } from "@/lib/ocr";
import { useSpeechRecognition } from "@/lib/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/lib/hooks/useSpeechSynthesis";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Camera, Copy, Volume2, Mic, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import stringSimilarity from "string-similarity";
import { Progress } from "@/components/ui/progress";

interface TextExtractionToolProps {
  user: Omit<User, "password">;
  currentLanguage: string;
}

export default function TextExtractionTool({ user, currentLanguage }: TextExtractionToolProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState<Array<{ correct: boolean; text: string }>>([]);
  const [listenCount, setListenCount] = useState(0);
  const [maxListenCount] = useState(3); // Maximum times a user can listen to the extracted text
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { speak, isSpeaking, cancel } = useSpeechSynthesis();
  // Pass the current language to the speech recognition hook
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    resetTranscript
  } = useSpeechRecognition({ language: currentLanguage });

  const saveExtractedTextMutation = useMutation({
    mutationFn: async (data: { text: string }) => {
      return apiRequest("POST", `/api/users/${user.id}/extracted-texts`, {
        text: data.text,
        languageId: currentLanguage === "te" ? 1 : currentLanguage === "hi" ? 2 : 3
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExtractedText("");
      setFeedbackVisible(false);
      setListenCount(0); // Reset listen count when selecting a new image
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExtractedText("");
      setFeedbackVisible(false);
      setListenCount(0); // Reset listen count when dropping a new image
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const captureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real app, we would show a video stream and let the user capture
      // For simplicity, we'll just alert that this feature isn't implemented
      toast({
        title: "Camera Capture",
        description: "Camera capture functionality would be implemented here."
      });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const extractText = async () => {
    if (!selectedImage) return;
    
    try {
      setIsExtracting(true);
      const text = await recognizeText(selectedImage);
      setExtractedText(text);
      
      // Reset listen count for new text
      setListenCount(0);
      
      // Save to backend
      saveExtractedTextMutation.mutate({ text });
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description: "Failed to extract text from the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard."
      });
    }
  };

  const speakText = () => {
    if (extractedText) {
      if (listenCount < maxListenCount) {
        speak(extractedText, currentLanguage);
        setListenCount(listenCount + 1); // Increment the listen count
        
        if (listenCount === maxListenCount - 1) {
          // This is the last allowed play
          toast({
            title: "Last listen used",
            description: "You've reached your maximum number of listens. Try reading it yourself!",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Listen limit reached",
          description: "You've reached the maximum number of listens. Practice reading it yourself now!",
          variant: "destructive"
        });
      }
    }
  };

  const handleRecordingStart = () => {
    resetTranscript();
    startListening();
  };

  const handleRecordingStop = () => {
    stopListening();
    
    // Compare the transcript with the extracted text using string similarity
    if (transcript && extractedText) {
      // For Telugu, we need a different approach since character-by-character
      // and word-by-word comparison might not work well
      if (currentLanguage === "te") {
        const similarityScore = stringSimilarity.compareTwoStrings(
          transcript.toLowerCase(), 
          extractedText.toLowerCase()
        );
        
        // Create a single feedback item based on overall similarity
        const newFeedback: Array<{ correct: boolean; text: string }> = [];
        
        // Threshold for "correct" pronunciation
        const scoreThreshold = 0.6;
        const isCorrect = similarityScore >= scoreThreshold;
        
        // Generate appropriate feedback
        if (isCorrect) {
          newFeedback.push({
            correct: true,
            text: `Good pronunciation! (${Math.round(similarityScore * 100)}% match)`
          });
        } else {
          newFeedback.push({
            correct: false,
            text: `Try again with clearer pronunciation (${Math.round(similarityScore * 100)}% match)`
          });
        }
        
        // If it's a partial match, add suggestions
        if (similarityScore > 0.3 && similarityScore < scoreThreshold) {
          newFeedback.push({
            correct: false,
            text: "Focus on pronouncing each character clearly"
          });
        }
        
        setFeedback(newFeedback);
        setFeedbackVisible(true);
      } else {
        // For non-Telugu languages, use word-by-word comparison
        const extractedWords = extractedText.toLowerCase().split(/\s+/);
        const spokenWords = transcript.toLowerCase().split(/\s+/);
        
        const newFeedback: Array<{ correct: boolean; text: string }> = [];
        
        // Word-by-word comparison using string similarity
        extractedWords.forEach((word, index) => {
          // Find the best matching word in the transcript
          let bestMatch = { target: "", rating: 0 };
          
          spokenWords.forEach(spokenWord => {
            const similarity = stringSimilarity.compareTwoStrings(word, spokenWord);
            if (similarity > bestMatch.rating) {
              bestMatch = { target: spokenWord, rating: similarity };
            }
          });
          
          // Consider it a match if the similarity is above a threshold
          const matched = bestMatch.rating >= 0.7;
          
          newFeedback.push({
            correct: matched,
            text: matched 
              ? `Good pronunciation of "${word}"` 
              : `Try "${word}" again (heard "${bestMatch.target}")`
          });
        });
        
        setFeedback(newFeedback);
        setFeedbackVisible(true);
      }
    }
  };

  return (
    <section className="mb-12" id="textExtraction">
      <motion.div 
        className="bg-white rounded-xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-primary text-white px-6 py-4">
          <h2 className="text-xl font-bold font-nunito">Text Extraction & Reading Practice</h2>
          <p className="text-blue-100">Upload an image, extract text, and practice reading it aloud</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Image Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Upload an image or take a photo</h3>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">Drag & drop an image here, or click to select</p>
                <div className="flex justify-center">
                  <Button 
                    variant="default" 
                    className="mr-3"
                    onClick={triggerFileInput}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={captureImage}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Camera
                  </Button>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Image Preview</h4>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Selected" 
                      className="h-full object-contain rounded-lg"
                    />
                  ) : (
                    <span className="text-gray-500">No image selected</span>
                  )}
                </div>
              </div>
              
              <Button 
                variant="default"
                className="w-full"
                disabled={!selectedImage || isExtracting}
                onClick={extractText}
              >
                {isExtracting ? "Extracting..." : "Extract Text"}
              </Button>
            </div>
            
            {/* Right Side - Text and Reading Practice */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 2: Practice reading the extracted text</h3>
              
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Extracted Text</h4>
                  <div className="flex">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-500 hover:text-primary"
                      onClick={copyToClipboard}
                      disabled={!extractedText}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-500 hover:text-primary ml-2"
                      onClick={speakText}
                      disabled={!extractedText || isSpeaking}
                      title="Listen to text"
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 h-32 overflow-y-auto">
                  {extractedText ? (
                    <p className="text-gray-800">{extractedText}</p>
                  ) : (
                    <p className="text-gray-500 text-center italic">Text will appear here after extraction</p>
                  )}
                </div>
                
                {extractedText && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Info className="w-3 h-3 mr-1" />
                        <span>Listen attempts remaining: {Math.max(0, maxListenCount - listenCount)}/{maxListenCount}</span>
                      </div>
                      <Progress 
                        className="w-24 h-2" 
                        value={(listenCount / maxListenCount) * 100} 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Practice Reading Aloud</h4>
                
                <div className="flex justify-center mb-4">
                  {!isListening ? (
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-full flex items-center transition-colors duration-200"
                      onClick={handleRecordingStart}
                      disabled={!extractedText}
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button 
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-full flex items-center transition-colors duration-200"
                      onClick={handleRecordingStop}
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"></path>
                      </svg>
                      Stop Recording
                    </Button>
                  )}
                </div>
                
                {isListening && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-center mb-2">
                      <div className="speaking-animation">
                        <div className="speaking-bar h-3"></div>
                        <div className="speaking-bar h-4"></div>
                        <div className="speaking-bar h-6"></div>
                        <div className="speaking-bar h-4"></div>
                        <div className="speaking-bar h-3"></div>
                      </div>
                    </div>
                    <p className="text-center text-gray-700">Listening to you read...</p>
                  </div>
                )}
                
                <p className="text-gray-600 text-sm mb-2">
                  <span className="text-primary">Tip:</span> Read slowly and clearly for best results.
                </p>
                
                {feedbackVisible && feedback.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2">Feedback</h5>
                    <div className="flex flex-col space-y-2">
                      {feedback.map((item, index) => (
                        <div key={index} className="flex items-center">
                          {item.correct ? (
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          )}
                          <span className="text-gray-700">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
