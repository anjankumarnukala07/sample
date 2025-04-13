import { User, UserProgress } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays } from "date-fns";

interface ProgressProps {
  user: Omit<User, "password">;
  currentLanguage: string;
}

export default function Progress({ user, currentLanguage }: ProgressProps) {
  const [activeTab, setActiveTab] = useState(currentLanguage);
  
  useEffect(() => {
    document.title = "My Progress - Read-Mentor";
    // Set the active tab based on the current language
    setActiveTab(currentLanguage);
  }, [currentLanguage]);

  const { data: userProgress, isLoading } = useQuery<UserProgress[]>({
    queryKey: [`/api/users/${user.id}/progress`],
    enabled: !!user.id,
  });

  const { data: activityHistory } = useQuery({
    queryKey: [`/api/users/${user.id}/activity-history`],
    enabled: !!user.id,
  });

  // Mock progress data for demonstration (in a real app, this would come from the API)
  const progressData = {
    te: {
      readingAccuracy: 78,
      vocabularyCount: 45,
      activitiesCompleted: 12,
      totalActivities: 30,
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      weeklyData: [
        { day: "Mon", accuracy: 70, vocabulary: 3, activities: 1 },
        { day: "Tue", accuracy: 72, vocabulary: 5, activities: 2 },
        { day: "Wed", accuracy: 75, vocabulary: 8, activities: 1 },
        { day: "Thu", accuracy: 73, vocabulary: 6, activities: 0 },
        { day: "Fri", accuracy: 76, vocabulary: 9, activities: 3 },
        { day: "Sat", accuracy: 77, vocabulary: 7, activities: 2 },
        { day: "Sun", accuracy: 78, vocabulary: 7, activities: 3 },
      ],
      activityTypes: [
        { name: "Image OCR", value: 6 },
        { name: "Games", value: 4 },
        { name: "Stories", value: 2 },
      ],
    },
    hi: {
      readingAccuracy: 92,
      vocabularyCount: 82,
      activitiesCompleted: 25,
      totalActivities: 30,
      lastActivity: new Date(), // today
      weeklyData: [
        { day: "Mon", accuracy: 85, vocabulary: 7, activities: 3 },
        { day: "Tue", accuracy: 87, vocabulary: 9, activities: 4 },
        { day: "Wed", accuracy: 88, vocabulary: 8, activities: 3 },
        { day: "Thu", accuracy: 90, vocabulary: 12, activities: 4 },
        { day: "Fri", accuracy: 90, vocabulary: 14, activities: 3 },
        { day: "Sat", accuracy: 91, vocabulary: 16, activities: 4 },
        { day: "Sun", accuracy: 92, vocabulary: 16, activities: 4 },
      ],
      activityTypes: [
        { name: "Image OCR", value: 10 },
        { name: "Games", value: 10 },
        { name: "Stories", value: 5 },
      ],
    },
    en: {
      readingAccuracy: 85,
      vocabularyCount: 65,
      activitiesCompleted: 18,
      totalActivities: 30,
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      weeklyData: [
        { day: "Mon", accuracy: 78, vocabulary: 5, activities: 2 },
        { day: "Tue", accuracy: 79, vocabulary: 7, activities: 3 },
        { day: "Wed", accuracy: 81, vocabulary: 8, activities: 2 },
        { day: "Thu", accuracy: 83, vocabulary: 10, activities: 3 },
        { day: "Fri", accuracy: 84, vocabulary: 12, activities: 3 },
        { day: "Sat", accuracy: 85, vocabulary: 11, activities: 2 },
        { day: "Sun", accuracy: 85, vocabulary: 12, activities: 3 },
      ],
      activityTypes: [
        { name: "Image OCR", value: 8 },
        { name: "Games", value: 7 },
        { name: "Stories", value: 3 },
      ],
    },
  };

  // Last 7 days streak data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(format(subDays(new Date(), i), "EEE"));
    }
    return days;
  };

  const last7Days = getLast7Days();
  
  // Daily activity data
  const dailyActivityData = last7Days.map((day, index) => ({
    name: day,
    active: Math.random() > 0.3, // Simulated activity status
  }));

  // COLORS for charts
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 font-nunito">Your Progress</h1>
        <div className="grid grid-cols-1 gap-6 animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-full md:w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded mt-6"></div>
        </div>
      </div>
    );
  }

  const getLanguageName = (code: string) => {
    switch (code) {
      case 'te': return 'Telugu';
      case 'hi': return 'Hindi';
      case 'en': return 'English';
      default: return 'Unknown';
    }
  };

  const renderTabContent = (languageCode: string) => {
    const data = progressData[languageCode as keyof typeof progressData];
    
    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Reading Accuracy</CardTitle>
              <CardDescription>Your pronunciation accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{data.readingAccuracy}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-primary rounded-full h-2.5" 
                  style={{ width: `${data.readingAccuracy}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Vocabulary</CardTitle>
              <CardDescription>Words mastered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#F59E0B]">{data.vocabularyCount}</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-[#F59E0B] rounded-full h-2.5" 
                  style={{ width: `${(data.vocabularyCount / 100) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Activities</CardTitle>
              <CardDescription>Completed lessons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#10B981]">
                {data.activitiesCompleted}/{data.totalActivities}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-[#10B981] rounded-full h-2.5" 
                  style={{ width: `${(data.activitiesCompleted / data.totalActivities) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your reading accuracy and activities over the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.weeklyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="accuracy" name="Reading Accuracy (%)" fill="#4F46E5" />
                  <Bar yAxisId="right" dataKey="vocabulary" name="New Words Learned" fill="#F59E0B" />
                  <Bar yAxisId="right" dataKey="activities" name="Activities Completed" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Types</CardTitle>
              <CardDescription>Breakdown of your learning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.activityTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.activityTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Daily Streak</CardTitle>
              <CardDescription>Your activity streak for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-64 justify-center">
                <div className="flex justify-between items-end h-32 mb-4">
                  {dailyActivityData.map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className={`w-10 rounded-t-md ${day.active ? 'bg-primary' : 'bg-gray-200'}`} 
                        style={{ height: day.active ? '100%' : '30%' }}
                      ></div>
                      <div className="mt-2 text-xs font-medium">{day.name}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <p className="text-lg font-semibold">5 Day Streak!</p>
                  <p className="text-sm text-gray-500">Keep it going to earn rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Personalized suggestions to improve your {getLanguageName(languageCode)} skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Practice Pronunciation</h3>
                <p className="text-gray-700 mb-3">Your accuracy is good, but you could improve with more speaking practice.</p>
                <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
                  Start Speaking Exercise
                </Button>
              </div>
              
              <div className="p-4 bg-[#F59E0B]/10 rounded-lg">
                <h3 className="font-semibold text-[#F59E0B] mb-2">Expand Vocabulary</h3>
                <p className="text-gray-700 mb-3">Try the word matching game to increase your vocabulary.</p>
                <Button variant="outline" className="text-[#F59E0B] border-[#F59E0B] hover:bg-[#F59E0B] hover:text-white">
                  Play Word Match
                </Button>
              </div>
              
              <div className="p-4 bg-[#10B981]/10 rounded-lg">
                <h3 className="font-semibold text-[#10B981] mb-2">Complete More Activities</h3>
                <p className="text-gray-700 mb-3">You're making good progress! Keep going to reach your goal.</p>
                <Button variant="outline" className="text-[#10B981] border-[#10B981] hover:bg-[#10B981] hover:text-white">
                  View Activities
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-6 font-nunito">Your Progress</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-1/3 grid-cols-3">
            <TabsTrigger value="te">Telugu</TabsTrigger>
            <TabsTrigger value="hi">Hindi</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          <TabsContent value="te" className="mt-6">
            {renderTabContent('te')}
          </TabsContent>
          <TabsContent value="hi" className="mt-6">
            {renderTabContent('hi')}
          </TabsContent>
          <TabsContent value="en" className="mt-6">
            {renderTabContent('en')}
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}
