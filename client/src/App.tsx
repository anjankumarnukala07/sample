import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TextExtraction from "@/pages/TextExtraction";
import Games from "@/pages/Games";
import Progress from "@/pages/Progress";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

function App() {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  useEffect(() => {
    // Check local storage for user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data from localStorage");
        localStorage.removeItem("user");
      }
    }

    // Check for saved language preference
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
  }, []);

  const handleLogin = (userData: Omit<User, "password">) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem("language", language);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header 
          user={user} 
          onLogout={handleLogout}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
        <div className="flex-grow">
          <Switch>
            <Route path="/login">
              {user ? <Home user={user} currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} /> : <Login onLogin={handleLogin} />}
            </Route>
            <Route path="/register">
              {user ? <Home user={user} currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} /> : <Register onRegister={handleLogin} />}
            </Route>
            <Route path="/text-extraction">
              {user ? <TextExtraction user={user} currentLanguage={currentLanguage} /> : <Login onLogin={handleLogin} />}
            </Route>
            <Route path="/games">
              {user ? <Games user={user} currentLanguage={currentLanguage} /> : <Login onLogin={handleLogin} />}
            </Route>
            <Route path="/progress">
              {user ? <Progress user={user} currentLanguage={currentLanguage} /> : <Login onLogin={handleLogin} />}
            </Route>
            <Route path="/">
              {user ? <Home user={user} currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} /> : <Login onLogin={handleLogin} />}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </div>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

export default App;
