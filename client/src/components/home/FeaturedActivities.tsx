import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";

export default function FeaturedActivities() {
  const { data: activities, isLoading, error } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-nunito">Featured Activities</h2>
          <Link href="/activities">
            <a className="text-primary hover:text-primary-600 font-medium text-sm flex items-center">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-8 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-40 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-nunito">Featured Activities</h2>
          <Link href="/activities">
            <a className="text-primary hover:text-primary-600 font-medium text-sm flex items-center">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </Link>
        </div>
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          Failed to load activities. Please try again later.
        </div>
      </section>
    );
  }

  const activitiesToDisplay = activities || [
    {
      id: 1,
      title: "Image to Text Reading",
      description: "Upload an image or take a photo, then read the text out loud. Perfect for practicing with real-world materials.",
      type: "image-ocr",
      imageUrl: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      duration: "10-15 mins",
      category: "new",
      badge: "New",
      languages: ["en", "te", "hi"]
    },
    {
      id: 2,
      title: "Word Scramble Game",
      description: "Drag and drop letters to form words. A fun way to improve vocabulary and spelling in different languages.",
      type: "game",
      imageUrl: "https://images.unsplash.com/photo-1555895315-2d672a4b2b0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      duration: "5-10 mins",
      category: "popular",
      badge: "Popular",
      languages: ["en", "te", "hi"]
    },
    {
      id: 3,
      title: "Story Builder",
      description: "Create your own stories by arranging words and phrases. Then read your creation aloud to practice pronunciation.",
      type: "story",
      imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      duration: "15-20 mins",
      category: "creative",
      badge: "Creative",
      languages: ["en", "te", "hi"]
    }
  ];

  // Map category to bg color
  const categoryColors = {
    new: "bg-primary",
    popular: "bg-[#10B981]",
    creative: "bg-[#F59E0B]",
  };

  const categoryTextColors = {
    new: "text-primary",
    popular: "text-[#10B981]",
    creative: "text-[#F59E0B]",
  };

  const getActivityUrl = (type: string) => {
    switch (type) {
      case 'image-ocr':
        return '/text-extraction';
      case 'game':
        return '/games';
      case 'story':
        return '/stories';
      default:
        return '/activities';
    }
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-nunito">Featured Activities</h2>
        <Link href="/activities">
          <a className="text-primary hover:text-primary-600 font-medium text-sm flex items-center">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activitiesToDisplay.map((activity, index) => (
          <motion.div 
            key={activity.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className={`${categoryColors[activity.category as keyof typeof categoryColors] || 'bg-primary'} text-white px-4 py-2 flex justify-between items-center`}>
              <span className="font-semibold">{activity.title}</span>
              <span className={`bg-white ${categoryTextColors[activity.category as keyof typeof categoryTextColors] || 'text-primary'} text-xs font-bold px-2 py-1 rounded-full`}>{activity.badge}</span>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <img 
                  src={activity.imageUrl} 
                  alt={activity.title} 
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <p className="text-gray-700 mb-3">{activity.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{activity.duration}</span>
                  <span className="mx-2">•</span>
                  <span>All languages</span>
                </div>
              </div>
              <Link href={getActivityUrl(activity.type)}>
                <Button className={`w-full ${categoryColors[activity.category as keyof typeof categoryColors] || 'bg-primary'} hover:bg-opacity-90 text-white font-semibold py-2 rounded-lg transition-colors duration-200`}>
                  {activity.type === 'image-ocr' ? 'Start Activity' : 
                   activity.type === 'game' ? 'Play Game' : 'Create Story'}
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
