import { useQuery } from "@tanstack/react-query";
import { User, UserProgress, Language } from "@shared/schema";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ProgressSectionProps {
  user: Omit<User, "password">;
  currentLanguage: string;
}

export default function ProgressSection({ user, currentLanguage }: ProgressSectionProps) {
  const { data: languages } = useQuery<Language[]>({
    queryKey: ['/api/languages'],
  });

  const { data: userProgress, isLoading, error } = useQuery<UserProgress[]>({
    queryKey: [`/api/users/${user.id}/progress`],
    enabled: !!user.id,
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-nunito">Your Progress</h2>
          <Link href="/progress">
            <a className="text-primary hover:text-primary-600 font-medium text-sm flex items-center">
              View Detailed Stats
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Demo progress data - in a real app, this would come from the backend
  const progressData = [
    {
      id: 1,
      languageId: 1,
      language: "Telugu",
      readingAccuracy: 78,
      vocabularyCount: 45,
      activitiesCompleted: 12,
      totalActivities: 30,
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: 2,
      languageId: 2,
      language: "Hindi",
      readingAccuracy: 92,
      vocabularyCount: 82,
      activitiesCompleted: 25,
      totalActivities: 30,
      lastActivity: new Date() // today
    },
    {
      id: 3,
      languageId: 3,
      language: "English",
      readingAccuracy: 85,
      vocabularyCount: 65,
      activitiesCompleted: 18,
      totalActivities: 30,
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    }
  ];

  const displayProgress = userProgress || progressData;

  const getLanguageName = (languageId: number) => {
    if (languages) {
      const language = languages.find(l => l.id === languageId);
      return language ? language.name : "Unknown";
    }
    // Fallback if languages are not loaded yet
    return progressData.find(p => p.languageId === languageId)?.language || "Unknown";
  };

  const formatLastActivity = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-nunito">Your Progress</h2>
        <Link href="/progress">
          <a className="text-primary hover:text-primary-600 font-medium text-sm flex items-center">
            View Detailed Stats
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayProgress.map((progress, index) => (
          <motion.div 
            key={progress.id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{getLanguageName(progress.languageId)}</h3>
                <span className="text-sm text-gray-500">
                  Last activity: {formatLastActivity(progress.lastActivity)}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Reading Accuracy</span>
                  <span className="font-medium">{progress.readingAccuracy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary rounded-full h-2.5" 
                    style={{ width: `${progress.readingAccuracy}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Vocabulary</span>
                  <span className="font-medium">{progress.vocabularyCount} words</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#F59E0B] rounded-full h-2.5" 
                    style={{ width: `${(progress.vocabularyCount / 100) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Completed Activities</span>
                  <span className="font-medium">{progress.activitiesCompleted}/{progress.totalActivities}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#10B981] rounded-full h-2.5" 
                    style={{ width: `${(progress.activitiesCompleted / progress.totalActivities) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <Button 
                className={getLanguageName(progress.languageId).toLowerCase() === currentLanguage 
                  ? "w-full bg-primary hover:bg-primary-600 text-white font-medium py-2 rounded-lg transition-colors duration-200 mt-2"
                  : "w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg transition-colors duration-200 mt-2"
                }
              >
                Continue Learning
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
