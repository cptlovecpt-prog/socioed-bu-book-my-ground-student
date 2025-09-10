import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

import { useState, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (userData: { name: string; email: string }) => void;
}

const SignInModal = ({ isOpen, onClose, onSignIn }: SignInModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    
    // Trigger browser password save prompt when Remember Me is checked
    if (checked && email && password) {
      // Create a temporary form submission to trigger browser password saving
      const form = formRef.current;
      if (form && 'credentials' in navigator) {
        // Modern browsers will automatically prompt for password saving on form submission
        // when autocomplete attributes are properly set
      }
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && password) {
      // Extract name from email for display purposes
      const name = email.split('@')[0];
      
      // If remember me is checked, let browser handle password saving
      if (rememberMe) {
        // The browser will automatically prompt to save password on successful form submission
        // when the form has proper autocomplete attributes
      }
      
      onSignIn({ name, email });
      
      toast({
        title: "Welcome to Book My Ground",
        description: "You have successfully signed in.",
      });
      
      onClose();
      setEmail("");
      setPassword("");
      setRememberMe(false);
      setShowPassword(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">Sign In</DialogTitle>
        </DialogHeader>
        
        <form ref={formRef} onSubmit={handleSignIn} className="space-y-4 mt-4" autoComplete="on">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email here"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password here"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => handleRememberMeChange(checked === true)}
            />
            <Label htmlFor="remember-me" className="text-sm">
              Remember me
            </Label>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;