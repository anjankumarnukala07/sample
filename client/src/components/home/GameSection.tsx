import { useQuery } from "@tanstack/react-query";
import { Game } from "@shared/schema";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function GameSection() {
  const { data: games, isLoading, error } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#10B981] to-[#0d9488] text-white px-6 py-4">
            <h2 className="text-xl font-bold font-nunito">Fun Learning Games</h2>
            <p className="text-green-100">Play these games to improve your language skills</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="h-28 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded mb-1 w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <div className="h-10 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#10B981] to-[#0d9488] text-white px-6 py-4">
            <h2 className="text-xl font-bold font-nunito">Fun Learning Games</h2>
            <p className="text-green-100">Play these games to improve your language skills</p>
          </div>
          
          <div className="p-6">
            <div className="bg-red-100 p-4 rounded-lg text-red-700">
              Failed to load games. Please try again later.
            </div>
          </div>
        </div>
      </section>
    );
  }

  const gamesToDisplay = games || [
    {
      id: 1,
      title: "Word Match",
      description: "Match words with their meanings",
      imageUrl: "https://images.unsplash.com/photo-1499078124630-c1e2e55fbe7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      difficulty: "beginner",
      languages: ["en", "te", "hi"]
    },
    {
      id: 2,
      title: "Sentence Builder",
      description: "Arrange words to form sentences",
      imageUrl: "https://images.unsplash.com/photo-1568377210220-151e1d7f42c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      difficulty: "intermediate",
      languages: ["en", "te", "hi"]
    },
    {
      id: 3,
      title: "Rapid Fire",
      description: "Read words quickly against timer",
      imageUrl: "https://images.unsplash.com/photo-1553481187-be93c21490a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      difficulty: "advanced",
      languages: ["en", "te", "hi"]
    },
    {
      id: 4,
      title: "Story Completion",
      description: "Fill in blanks to complete stories",
      imageUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      difficulty: "all",
      languages: ["en", "te", "hi"]
    }
  ];

  return (
    <section className="mb-12">
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-[#10B981] to-[#0d9488] text-white px-6 py-4">
          <h2 className="text-xl font-bold font-nunito">Fun Learning Games</h2>
          <p className="text-green-100">Play these games to improve your language skills</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gamesToDisplay.map((game, index) => (
              <motion.div 
                key={game.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#10B981] transition-colors duration-200 cursor-pointer group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link href={`/games/${game.id}`}>
                  <div className="h-28 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img 
                      src={game.imageUrl} 
                      alt={game.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold mb-1 text-gray-800 group-hover:text-[#10B981] transition-colors duration-200">{game.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{game.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full">
                      {game.difficulty === 'beginner' ? 'Beginner' : 
                       game.difficulty === 'intermediate' ? 'Intermediate' : 
                       game.difficulty === 'advanced' ? 'Advanced' : 'All Levels'}
                    </span>
                    <span className="mx-2">•</span>
                    <span>All languages</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/games">
              <Button className="bg-[#10B981] hover:bg-[#0d9488] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
                Explore All Games
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
