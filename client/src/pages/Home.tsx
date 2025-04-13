import { User } from "@shared/schema";
import WelcomeHero from "@/components/home/WelcomeHero";
import LanguageSelector from "@/components/home/LanguageSelector";
import FeaturedActivities from "@/components/home/FeaturedActivities";
import TextExtractionTool from "@/components/tools/TextExtractionTool";
import ProgressSection from "@/components/home/ProgressSection";
import GameSection from "@/components/home/GameSection";
import { useEffect } from "react";

interface HomeProps {
  user: Omit<User, "password">;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function Home({ user, currentLanguage, onLanguageChange }: HomeProps) {
  useEffect(() => {
    document.title = "Read-Mentor - Enhancing Literacy";
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <WelcomeHero user={user} />
      <LanguageSelector 
        currentLanguage={currentLanguage} 
        onLanguageChange={onLanguageChange}
        user={user}
      />
      <FeaturedActivities />
      <TextExtractionTool 
        user={user}
        currentLanguage={currentLanguage}
      />
      <ProgressSection 
        user={user}
        currentLanguage={currentLanguage}
      />
      <GameSection />
    </main>
  );
}
