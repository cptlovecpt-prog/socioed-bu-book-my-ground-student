import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Moon, Sun, User, Menu, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignInModal from "./SignInModal";
import HelpSupportModal from "./HelpSupportModal";
import { LOGO_IMAGE } from "@/constants/images";

interface NavigationProps {
  isSignedIn: boolean;
  setIsSignedIn: (value: boolean) => void;
  userData: { name: string; email: string } | null;
  setUserData: (data: { name: string; email: string } | null) => void;
}

const Navigation = ({ isSignedIn, setIsSignedIn, userData, setUserData }: NavigationProps) => {
  const { theme, setTheme } = useTheme();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isHelpSupportModalOpen, setIsHelpSupportModalOpen] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignIn = (data: { name: string; email: string }) => {
    setUserData(data);
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setUserData(null);
    // Navigate to home page if on My Bookings page, otherwise reload
    if (window.location.pathname === '/my-bookings') {
      navigate('/');
    } else {
      window.location.reload();
    }
  };

  const openSignInModal = () => {
    if (!isSignedIn) {
      setIsSignInModalOpen(true);
    }
  };

  const navigateToHome = () => {
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo and Name */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={navigateToHome}>
            <img src={LOGO_IMAGE} alt="Book My Ground" className="h-8 sm:h-12 w-auto" />
            <span className="text-lg sm:text-xl font-bold hover:text-primary transition-colors">Book My Ground</span>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark mode toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* User sign-in/profile */}
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{userData?.name}</span>
                    <span className="sm:hidden">{userData?.name?.split(' ')[0]}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleSignOut}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={openSignInModal}
                className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign</span>
              </Button>
            )}

            {/* Hamburger Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-9 h-9">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isSignedIn && (
                  <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                    My Bookings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setIsHelpSupportModalOpen(true)}>
                  Help & Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignIn={handleSignIn}
      />
      
      <HelpSupportModal
        isOpen={isHelpSupportModalOpen}
        onClose={() => setIsHelpSupportModalOpen(false)}
      />
    </nav>
  );
};

export default Navigation;