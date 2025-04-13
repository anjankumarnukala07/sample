import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface WelcomeHeroProps {
  user: Omit<User, "password">;
}

export default function WelcomeHero({ user }: WelcomeHeroProps) {
  const [progress, setProgress] = useState({
    days: 4,
    totalDays: 7,
    percentage: 57
  });

  // In a real app, we would fetch this data from the backend
  const { data: userProgress, isLoading } = useQuery({
    queryKey: [`/api/users/${user.id}/progress`],
    enabled: !!user.id,
  });

  useEffect(() => {
    if (userProgress) {
      // Process user progress data here
      // For now, we'll use the default progress state
    }
  }, [userProgress]);

  return (
    <section className="mb-12">
      <motion.div 
        className="rounded-2xl gradient-bg p-8 md:p-12 flex flex-col md:flex-row items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          background: "linear-gradient(120deg, #4F46E5 0%, #60a5fa 100%)"
        }}
      >
        <div className="md:w-1/2 mb-8 md:mb-0">
          <motion.h1 
            className="text-3xl md:text-4xl font-extrabold text-white mb-4 font-nunito"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Welcome back, {user.name}!
          </motion.h1>
          <motion.p 
            className="text-blue-100 text-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Continue your reading adventure today. You're making great progress!
          </motion.p>
          <motion.div 
            className="bg-white bg-opacity-20 rounded-lg p-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex justify-between text-white mb-2">
              <span>Weekly Reading Goal</span>
              <span>{progress.days}/{progress.totalDays} days</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
              <motion.div 
                className="bg-[#F59E0B] rounded-full h-3"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link href="/text-extraction">
              <Button className="bg-white text-primary-600 hover:bg-opacity-90 font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105">
                Continue Reading
              </Button>
            </Link>
          </motion.div>
        </div>
        <div className="md:w-1/2 md:pl-8">
          <motion.img 
            src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
            alt="Child reading a book" 
            className="rounded-xl shadow-lg w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </div>
      </motion.div>
    </section>
  );
}
