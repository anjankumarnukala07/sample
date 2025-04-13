import { User } from "@shared/schema";
import TextExtractionTool from "@/components/tools/TextExtractionTool";
import { useEffect } from "react";

interface TextExtractionPageProps {
  user: Omit<User, "password">;
  currentLanguage: string;
}

export default function TextExtraction({ user, currentLanguage }: TextExtractionPageProps) {
  useEffect(() => {
    document.title = "Text Extraction - Read-Mentor";
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 font-nunito">Text Extraction & Reading Practice</h1>
      <p className="text-gray-600 mb-8">
        Upload an image containing text in {currentLanguage === "te" ? "Telugu" : currentLanguage === "hi" ? "Hindi" : "English"}, 
        extract the text, and practice reading it aloud. Our speech recognition technology will provide feedback on your pronunciation.
      </p>
      
      <TextExtractionTool 
        user={user} 
        currentLanguage={currentLanguage} 
      />
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 font-nunito">How to Use This Tool</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Upload an image containing text, or take a photo using your device camera</li>
          <li>Click "Extract Text" to process the image</li>
          <li>Review the extracted text and click the speaker icon to hear how it should be pronounced</li>
          <li>Click "Start Recording" and read the text aloud</li>
          <li>When you're finished, click "Stop Recording" to receive feedback on your pronunciation</li>
        </ol>
      </div>
    </main>
  );
}
