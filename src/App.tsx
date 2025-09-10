import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { BookingProvider } from "@/contexts/BookingContext";
import { useState } from "react";
import Index from "./pages/Index";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <BookingProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <Index 
                      isSignedIn={isSignedIn}
                      setIsSignedIn={setIsSignedIn}
                      userData={userData}
                      setUserData={setUserData}
                    />
                  } 
                />
                <Route 
                  path="/my-bookings" 
                  element={
                    <MyBookings 
                      isSignedIn={isSignedIn}
                      setIsSignedIn={setIsSignedIn}
                      userData={userData}
                      setUserData={setUserData}
                    />
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </BookingProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
