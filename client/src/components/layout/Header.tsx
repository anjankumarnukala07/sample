import { Link, useLocation } from "wouter";
import { useState } from "react";
import { User } from "@shared/schema";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface HeaderProps {
  user: Omit<User, "password"> | null;
  onLogout: () => void;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function Header({ user, onLogout, currentLanguage, onLanguageChange }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const languages = [
    { name: "English", code: "en" },
    { name: "Telugu", code: "te" },
    { name: "Hindi", code: "hi" }
  ];
  
  const currentLanguageName = languages.find(l => l.code === currentLanguage)?.name || "English";

  const navigationLinks = [
    { name: "Home", path: "/" },
    { name: "Library", path: "/library" },
    { name: "Games", path: "/games" },
    { name: "Progress", path: "/progress" },
    { name: "Help", path: "/help" }
  ];
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-primary font-nunito">Read-Mentor</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          {navigationLinks.map((link) => (
            <Link key={link.path} href={link.path}>
              <a className={`text-gray-700 hover:text-primary font-medium transition-colors duration-200 ${location === link.path ? 'text-primary' : ''}`}>
                {link.name}
              </a>
            </Link>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors duration-200">
                <span className="text-sm font-medium">{currentLanguageName}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {languages.map((language) => (
                <DropdownMenuItem 
                  key={language.code}
                  onClick={() => onLanguageChange(language.code)}
                  className={language.code === currentLanguage ? "bg-primary/10" : ""}
                >
                  {language.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2">
                  <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center ring-2 ring-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-semibold">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="w-full">Profile</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <a className="w-full">Settings</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="default">Login</Button>
            </Link>
          )}
          
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-1">
            {navigationLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <a 
                  className={`py-2 px-4 rounded-md ${location === link.path ? 'bg-primary/10 text-primary' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
