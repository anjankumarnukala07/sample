import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real application, we would send this to a backend
      toast({
        title: "Subscribed!",
        description: "You have been subscribed to our newsletter.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-8 h-8 text-white" />
              <span className="text-xl font-bold">Read-Mentor</span>
            </div>
            <p className="text-gray-400 mb-4">
              Enhancing literacy across multiple languages with innovative technology and engaging learning experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <i className="ri-facebook-fill text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <i className="ri-twitter-fill text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <i className="ri-instagram-line text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <i className="ri-youtube-fill text-lg"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-white transition-colors duration-200">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-400 hover:text-white transition-colors duration-200">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/features">
                  <a className="text-gray-400 hover:text-white transition-colors duration-200">Features</a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="text-gray-400 hover:text-white transition-colors duration-200">Pricing</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-400 hover:text-white transition-colors duration-200">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog">
                  <a className="text-gray-400 hover:text-white transition-colors duration-200">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/help">
                  <a className="text-gray-400 hover:text-white transition-colors duration-200">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="/guides">
                  <a className="text-gray-400 hover:text-white transition-colors duration-200">Language Guides</a>
                </Link>
              </li>
              <li>
                <Link href="/teachers">
                  <a className="text-gray-400 hover:text-white transition-colors duration-200">Teacher Resources</a>
                </Link>
              </li>
              <li>
                <Link href="/api">
                  <a className="text-gray-400 hover:text-white transition-colors duration-200">API Documentation</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Stay updated with our latest features and releases</p>
            <form className="flex" onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder="Your email"
                className="rounded-r-none text-gray-900 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-l-none">
                <i className="ri-send-plane-fill"></i>
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Read-Mentor. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy">
              <a className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Privacy Policy</a>
            </Link>
            <Link href="/terms">
              <a className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Terms of Service</a>
            </Link>
            <Link href="/cookies">
              <a className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Cookie Policy</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
