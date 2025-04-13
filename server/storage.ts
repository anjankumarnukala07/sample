import { 
  User, InsertUser, Language, InsertLanguage, UserProgress, InsertUserProgress,
  Activity, InsertActivity, UserActivityHistory, InsertUserActivityHistory,
  ExtractedText, InsertExtractedText, Game, InsertGame
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Language methods
  getLanguages(): Promise<Language[]>;
  getLanguage(id: number): Promise<Language | undefined>;
  getLanguageByCode(code: string): Promise<Language | undefined>;
  createLanguage(language: InsertLanguage): Promise<Language>;
  
  // User Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserProgressByLanguage(userId: number, languageId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: number, progress: Partial<UserProgress>): Promise<UserProgress | undefined>;
  
  // Activity methods
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByType(type: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // User Activity History methods
  getUserActivityHistory(userId: number): Promise<UserActivityHistory[]>;
  createUserActivityHistory(history: InsertUserActivityHistory): Promise<UserActivityHistory>;
  updateUserActivityHistory(id: number, history: Partial<UserActivityHistory>): Promise<UserActivityHistory | undefined>;
  
  // Extracted Text methods
  getExtractedTexts(userId: number): Promise<ExtractedText[]>;
  getExtractedText(id: number): Promise<ExtractedText | undefined>;
  createExtractedText(text: InsertExtractedText): Promise<ExtractedText>;
  
  // Game methods
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private languages: Map<number, Language>;
  private userProgress: Map<number, UserProgress>;
  private activities: Map<number, Activity>;
  private userActivityHistory: Map<number, UserActivityHistory>;
  private extractedTexts: Map<number, ExtractedText>;
  private games: Map<number, Game>;
  
  private currentUserId: number;
  private currentLanguageId: number;
  private currentUserProgressId: number;
  private currentActivityId: number;
  private currentUserActivityHistoryId: number;
  private currentExtractedTextId: number;
  private currentGameId: number;

  constructor() {
    this.users = new Map();
    this.languages = new Map();
    this.userProgress = new Map();
    this.activities = new Map();
    this.userActivityHistory = new Map();
    this.extractedTexts = new Map();
    this.games = new Map();
    
    this.currentUserId = 1;
    this.currentLanguageId = 1;
    this.currentUserProgressId = 1;
    this.currentActivityId = 1;
    this.currentUserActivityHistoryId = 1;
    this.currentExtractedTextId = 1;
    this.currentGameId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Add default languages
    const telugu: InsertLanguage = {
      name: "Telugu",
      code: "te",
      imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    };
    
    const hindi: InsertLanguage = {
      name: "Hindi",
      code: "hi",
      imageUrl: "https://images.unsplash.com/photo-1597324819116-1c295a3dfac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    };
    
    const english: InsertLanguage = {
      name: "English",
      code: "en",
      imageUrl: "https://images.unsplash.com/photo-1510081887155-56fe96846e71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    };
    
    this.createLanguage(telugu);
    this.createLanguage(hindi);
    this.createLanguage(english);
    
    // Add featured activities
    const imageOcr: InsertActivity = {
      title: "Image to Text Reading",
      description: "Upload an image or take a photo, then read the text out loud. Perfect for practicing with real-world materials.",
      type: "image-ocr",
      imageUrl: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      duration: "10-15 mins",
      category: "new",
      badge: "New",
      languages: ["en", "te", "hi"]
    };
    
    const wordScramble: InsertActivity = {
      title: "Word Scramble Game",
      description: "Drag and drop letters to form words. A fun way to improve vocabulary and spelling in different languages.",
      type: "game",
      imageUrl: "https://images.unsplash.com/photo-1555895315-2d672a4b2b0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      duration: "5-10 mins",
      category: "popular",
      badge: "Popular",
      languages: ["en", "te", "hi"]
    };
    
    const storyBuilder: InsertActivity = {
      title: "Story Builder",
      description: "Create your own stories by arranging words and phrases. Then read your creation aloud to practice pronunciation.",
      type: "story",
      imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      duration: "15-20 mins",
      category: "creative",
      badge: "Creative",
      languages: ["en", "te", "hi"]
    };
    
    this.createActivity(imageOcr);
    this.createActivity(wordScramble);
    this.createActivity(storyBuilder);
    
    // Add games
    const wordMatch: InsertGame = {
      title: "Word Match",
      description: "Match words with their meanings",
      imageUrl: "https://images.unsplash.com/photo-1499078124630-c1e2e55fbe7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      difficulty: "beginner",
      languages: ["en", "te", "hi"]
    };
    
    const sentenceBuilder: InsertGame = {
      title: "Sentence Builder",
      description: "Arrange words to form sentences",
      imageUrl: "https://images.unsplash.com/photo-1568377210220-151e1d7f42c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      difficulty: "intermediate",
      languages: ["en", "te", "hi"]
    };
    
    const rapidFire: InsertGame = {
      title: "Rapid Fire",
      description: "Read words quickly against timer",
      imageUrl: "https://images.unsplash.com/photo-1553481187-be93c21490a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      difficulty: "advanced",
      languages: ["en", "te", "hi"]
    };
    
    const storyCompletion: InsertGame = {
      title: "Story Completion",
      description: "Fill in blanks to complete stories",
      imageUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      difficulty: "all",
      languages: ["en", "te", "hi"]
    };
    
    this.createGame(wordMatch);
    this.createGame(sentenceBuilder);
    this.createGame(rapidFire);
    this.createGame(storyCompletion);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Language methods
  async getLanguages(): Promise<Language[]> {
    return Array.from(this.languages.values());
  }
  
  async getLanguage(id: number): Promise<Language | undefined> {
    return this.languages.get(id);
  }
  
  async getLanguageByCode(code: string): Promise<Language | undefined> {
    return Array.from(this.languages.values()).find(
      (language) => language.code === code,
    );
  }
  
  async createLanguage(insertLanguage: InsertLanguage): Promise<Language> {
    const id = this.currentLanguageId++;
    const language: Language = { ...insertLanguage, id };
    this.languages.set(id, language);
    return language;
  }
  
  // User Progress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      (progress) => progress.userId === userId,
    );
  }
  
  async getUserProgressByLanguage(userId: number, languageId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      (progress) => progress.userId === userId && progress.languageId === languageId,
    );
  }
  
  async createUserProgress(insertUserProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentUserProgressId++;
    const now = new Date();
    const userProgress: UserProgress = { ...insertUserProgress, id, lastActivity: now };
    this.userProgress.set(id, userProgress);
    return userProgress;
  }
  
  async updateUserProgress(id: number, update: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const userProgress = this.userProgress.get(id);
    if (!userProgress) return undefined;
    
    const updatedUserProgress = { ...userProgress, ...update, lastActivity: new Date() };
    this.userProgress.set(id, updatedUserProgress);
    return updatedUserProgress;
  }
  
  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivitiesByType(type: string): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(
      (activity) => activity.type === type,
    );
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }
  
  // User Activity History methods
  async getUserActivityHistory(userId: number): Promise<UserActivityHistory[]> {
    return Array.from(this.userActivityHistory.values()).filter(
      (history) => history.userId === userId,
    );
  }
  
  async createUserActivityHistory(insertUserActivityHistory: InsertUserActivityHistory): Promise<UserActivityHistory> {
    const id = this.currentUserActivityHistoryId++;
    const now = new Date();
    const userActivityHistory: UserActivityHistory = { 
      ...insertUserActivityHistory, 
      id, 
      startTime: now, 
      endTime: undefined,
      score: undefined,
      feedback: undefined 
    };
    this.userActivityHistory.set(id, userActivityHistory);
    return userActivityHistory;
  }
  
  async updateUserActivityHistory(id: number, update: Partial<UserActivityHistory>): Promise<UserActivityHistory | undefined> {
    const userActivityHistory = this.userActivityHistory.get(id);
    if (!userActivityHistory) return undefined;
    
    const updatedUserActivityHistory = { ...userActivityHistory, ...update };
    this.userActivityHistory.set(id, updatedUserActivityHistory);
    return updatedUserActivityHistory;
  }
  
  // Extracted Text methods
  async getExtractedTexts(userId: number): Promise<ExtractedText[]> {
    return Array.from(this.extractedTexts.values()).filter(
      (text) => text.userId === userId,
    );
  }
  
  async getExtractedText(id: number): Promise<ExtractedText | undefined> {
    return this.extractedTexts.get(id);
  }
  
  async createExtractedText(insertExtractedText: InsertExtractedText): Promise<ExtractedText> {
    const id = this.currentExtractedTextId++;
    const now = new Date();
    const extractedText: ExtractedText = { ...insertExtractedText, id, createdAt: now };
    this.extractedTexts.set(id, extractedText);
    return extractedText;
  }
  
  // Game methods
  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }
  
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }
  
  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    const game: Game = { ...insertGame, id };
    this.games.set(id, game);
    return game;
  }
}

export const storage = new MemStorage();
