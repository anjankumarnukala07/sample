import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Language } from "@shared/schema";
import { motion } from "framer-motion";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  user: Omit<User, "password">;
}

export default function LanguageSelector({ currentLanguage, onLanguageChange, user }: LanguageSelectorProps) {
  const { data: languages, isLoading, error } = useQuery<Language[]>({
    queryKey: ['/api/languages'],
  });

  // In a real application, we would fetch user progress for each language
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: [`/api/users/${user.id}/progress`],
    enabled: !!user.id,
  });

  // Mock language levels (in a real app, these would come from the user progress)
  const languageLevels = {
    te: { stars: 2, name: "Telugu" },
    hi: { stars: 3, name: "Hindi" },
    en: { stars: 4, name: "English" }
  };

  const handleLanguageSelect = (code: string) => {
    onLanguageChange(code);
  };

  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg 
          key={i} 
          className={`w-5 h-5 ${i < count ? 'text-[#F59E0B]' : 'text-gray-300'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-nunito">Choose Your Language</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 font-nunito">Choose Your Language</h2>
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          Failed to load languages. Please try again later.
        </div>
      </section>
    );
  }

  const languagesToDisplay = languages || [
    {
      id: 1,
      name: "Telugu",
      code: "te",
      imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 2,
      name: "Hindi",
      code: "hi",
      imageUrl: "https://images.unsplash.com/photo-1597324819116-1c295a3dfac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 3,
      name: "English",
      code: "en",
      imageUrl: "https://images.unsplash.com/photo-1510081887155-56fe96846e71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-nunito">Choose Your Language</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {languagesToDisplay.map((language, index) => (
          <motion.div 
            key={language.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => handleLanguageSelect(language.code)}
          >
            <div className="relative h-36 overflow-hidden">
              <img 
                src={language.imageUrl} 
                alt={`${language.name} language`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
              <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">{language.name}</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Level</p>
                  <div className="flex">
                    {renderStars(languageLevels[language.code as keyof typeof languageLevels]?.stars || 0)}
                  </div>
                </div>
                <Button 
                  className={`${language.code === currentLanguage ? 'bg-primary/90' : 'bg-primary'} hover:bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200`}
                >
                  Start
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
