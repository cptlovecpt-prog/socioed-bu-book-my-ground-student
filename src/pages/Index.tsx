import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Filter, X } from "lucide-react";
import { FacilityCard } from "@/components/FacilityCard";
import { BookingModal } from "@/components/BookingModal";
import { UserDashboard } from "@/components/UserDashboard";
import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import Footer from "@/components/Footer";
import YourBookings from "@/components/YourBookings";
import { useToast } from "@/hooks/use-toast";
import { SPORT_IMAGES } from "@/constants/images";

interface IndexProps {
  isSignedIn: boolean;
  setIsSignedIn: (value: boolean) => void;
  userData: { name: string; email: string } | null;
  setUserData: (data: { name: string; email: string } | null) => void;
}

const indoorFacilities = [
  {
    id: "indoor-1",
    name: "Badminton Court",
    sport: "Badminton",
    capacity: 12,
    available: 8,
    location: "K block",
    nextSlot: "10:00 - 12:00",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop",
    status: 'available' as const,
    rating: 4.3,
    votes: 480
  },
  {
    id: "indoor-2",
    name: "Squash Court",
    sport: "Squash",
    capacity: 6,
    available: 0,
    location: "K block",
    nextSlot: "12:00 - 14:00",
    image: SPORT_IMAGES.SQUASH,
    status: 'full' as const,
    rating: 4.2,
    votes: 187
  },
  {
    id: "indoor-3",
    name: "Basketball Court",
    sport: "Basketball",
    capacity: 20,
    available: 15,
    location: "Near K block",
    nextSlot: "09:00 - 18:00",
    image: SPORT_IMAGES.BASKETBALL,
    status: 'available' as const,
    rating: 4.4,
    votes: 536
  },
  {
    id: "indoor-4",
    name: "Gym",
    sport: "Gym",
    capacity: 40,
    available: 25,
    location: "DG",
    nextSlot: "06:00 - 22:00",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    status: 'available' as const,
    rating: 4.6,
    votes: 308
  },
  {
    id: "indoor-5",
    name: "Gym",
    sport: "Gym",
    capacity: 40,
    available: 30,
    location: "K block",
    nextSlot: "06:00 - 22:00",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    status: 'available' as const,
    rating: 4.5,
    votes: 382
  },
  {
    id: "indoor-6",
    name: "Badminton Court",
    sport: "Badminton",
    capacity: 10,
    available: 7,
    location: "German House",
    nextSlot: "16:00 - 18:00",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop",
    status: 'available' as const,
    rating: 4.2,
    votes: 1120
  },
  {
    id: "indoor-7",
    name: "Padel Court",
    sport: "Padel",
    capacity: 8,
    available: 0,
    location: "C11-C12 Block",
    nextSlot: "14:00 - 16:00",
    image: SPORT_IMAGES.PADEL,
    status: 'full' as const,
    rating: 4.1,
    votes: 832
  },
  {
    id: "indoor-8",
    name: "Chess Room",
    sport: "Chess",
    capacity: 10,
    available: 6,
    location: "C12 Block",
    nextSlot: "16:00 - 18:00",
    image: SPORT_IMAGES.CHESS,
    status: 'available' as const,
    rating: 4.1,
    votes: 2048
  },
  {
    id: "indoor-9",
    name: "Table Tennis",
    sport: "Table Tennis",
    capacity: 48,
    available: 35,
    location: "Hostel Blocks",
    nextSlot: "18:00 - 20:00",
    image: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&h=300&fit=crop",
    status: 'available' as const,
    rating: 4.5,
    votes: 1200
  }
];

const outdoorFacilities = [
  {
    id: "outdoor-1",
    name: "Football Ground",
    sport: "Football",
    capacity: 22,
    available: 18,
    location: "Near K block",
    nextSlot: "14:00 - 18:00",
    image: SPORT_IMAGES.FOOTBALL,
    status: 'available' as const,
    rating: 4.7,
    votes: 8968
  },
  {
    id: "outdoor-2",
    name: "Cricket Ground",
    sport: "Cricket",
    capacity: 22,
    available: 18,
    location: "Old Ground",
    nextSlot: "10:00 - 12:00",
    image: SPORT_IMAGES.CRICKET,
    status: 'available' as const,
    rating: 4.8,
    votes: 7400
  },
  {
    id: "outdoor-3",
    name: "Basketball Court",
    sport: "Basketball",
    capacity: 20,
    available: 0,
    location: "Near K block",
    nextSlot: "16:00 - 18:00",
    image: SPORT_IMAGES.BASKETBALL,
    status: 'full' as const,
    rating: 4.5,
    votes: 1292
  },
  {
    id: "outdoor-4",
    name: "Volleyball Court",
    sport: "Volleyball",
    capacity: 24,
    available: 20,
    location: "Near Gate No. 3",
    nextSlot: "12:00 - 14:00",
    image: SPORT_IMAGES.VOLLEYBALL,
    status: 'available' as const,
    rating: 4.4,
    votes: 960
  },
  {
    id: "outdoor-5",
    name: "Tennis Court",
    sport: "Tennis",
    capacity: 8,
    available: 0,
    location: "Near K block",
    nextSlot: "18:00 - 20:00",
    image: SPORT_IMAGES.TENNIS,
    status: 'full' as const,
    rating: 4.6,
    votes: 1338
  },
  {
    id: "outdoor-6",
    name: "Swimming Pool",
    sport: "Swimming",
    capacity: 35,
    available: 25,
    location: "K block",
    nextSlot: "10:00 - 12:00",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop",
    status: 'available' as const,
    rating: 4.9,
    votes: 1474
  },
  {
    id: "outdoor-7",
    name: "Pickleball Courts",
    sport: "Pickleball",
    capacity: 40,
    available: 30,
    location: "Near H block",
    nextSlot: "08:00 - 10:00",
    image: SPORT_IMAGES.PICKLEBALL,
    status: 'available' as const,
    rating: 4.3,
    votes: 736
  },
  {
    id: "outdoor-8",
    name: "Badminton Court",
    sport: "Badminton",
    capacity: 12,
    available: 8,
    location: "C10-C11 block",
    nextSlot: "16:00 - 18:00",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop",
    status: 'available' as const,
    rating: 4.2,
    votes: 261
  },
  {
    id: "outdoor-9",
    name: "Badminton Court",
    sport: "Badminton",
    capacity: 8,
    available: 6,
    location: "C & D block",
    nextSlot: "14:00 - 16:00",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop",
    status: 'available' as const,
    rating: 4.1,
    votes: 174
  },
  {
    id: "outdoor-10",
    name: "Half Basketball Court",
    sport: "Basketball",
    capacity: 12,
    available: 10,
    location: "C & D block",
    nextSlot: "14:00 - 16:00",
    image: SPORT_IMAGES.BASKETBALL,
    status: 'available' as const,
    rating: 4.4,
    votes: 480
  }
];

const Index = ({ isSignedIn, setIsSignedIn, userData, setUserData }: IndexProps) => {
  const [selectedFacility, setSelectedFacility] = useState<(typeof indoorFacilities[0]) | (typeof outdoorFacilities[0]) | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const { toast } = useToast();

  const allSports = [
    "Football", "Cricket", "Basketball", "Volleyball", "Tennis", 
    "Badminton", "Squash", "Swimming", "Pickleball", "Gym", "Chess", "Padel"
  ];

  const handleSportToggle = (sport: string) => {
    setSelectedSports(prev => 
      prev.includes(sport) 
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const clearFilters = () => {
    setSelectedSports([]);
    setShowOnlyAvailable(false);
  };

  const filterFacilities = (facilities: Array<{
    id: string;
    name: string;
    sport: string;
    capacity: number;
    available: number;
    location: string;
    nextSlot: string;
    image: string;
    status: 'available' | 'full';
    rating: number;
    votes: number;
  }>) => {
    let filtered = facilities;
    
    // Filter by selected sports
    if (selectedSports.length > 0) {
      filtered = filtered.filter(facility => selectedSports.includes(facility.sport));
    }
    
    // Filter by availability
    if (showOnlyAvailable) {
      filtered = filtered.filter(facility => facility.status === 'available');
    }
    
    return filtered;
  };

  const handleBooking = (facilityId: string) => {
    if (!isSignedIn) {
      toast({
        title: "Please sign-in to continue your booking",
        duration: 4000,
      });
      return;
    }
    
    const allFacilities = [...indoorFacilities, ...outdoorFacilities];
    const facility = allFacilities.find(f => f.id === facilityId);
    if (facility) {
      setSelectedFacility(facility);
      setIsBookingModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        isSignedIn={isSignedIn}
        setIsSignedIn={setIsSignedIn}
        userData={userData}
        setUserData={setUserData}
      />
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Your Bookings Section - shown when signed in */}
      <div id="your-bookings-section" className="scroll-mt-20">
        <YourBookings isSignedIn={isSignedIn} />
      </div>

      {/* Book Your Sport Section */}
      <section id="book-your-sport-section" className="py-6 sm:py-8 px-3 sm:px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">Book Your Sport</h2>
          
          <Tabs defaultValue="outdoor" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="outdoor" className="text-base sm:text-lg font-bold">Outdoor</TabsTrigger>
                <TabsTrigger value="indoor" className="text-base sm:text-lg font-bold">Indoor</TabsTrigger>
              </TabsList>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Show Only Available Toggle */}
                <div className="flex items-center justify-between sm:justify-start space-x-2">
                  <Switch 
                    id="show-available" 
                    checked={showOnlyAvailable}
                    onCheckedChange={setShowOnlyAvailable}
                  />
                  <label 
                    htmlFor="show-available" 
                    className="text-sm font-medium text-foreground"
                  >
                    Show only available
                  </label>
                </div>

                {/* Sports Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                      <Filter className="h-4 w-4" />
                      Filter
                      {selectedSports.length > 0 && (
                        <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                          {selectedSports.length}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filter by Sports</h4>
                        {(selectedSports.length > 0 || showOnlyAvailable) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-6 px-2 text-xs"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {allSports.map((sport) => (
                          <div key={sport} className="flex items-center space-x-2">
                            <Checkbox
                              id={sport}
                              checked={selectedSports.includes(sport)}
                              onCheckedChange={() => handleSportToggle(sport)}
                            />
                            <label
                              htmlFor={sport}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {sport}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Filter Tags */}
            {(selectedSports.length > 0 || showOnlyAvailable) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {showOnlyAvailable && (
                  <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-md">
                    Show only available
                    <button
                      onClick={() => setShowOnlyAvailable(false)}
                      className="hover:bg-secondary/80 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedSports.map((sport) => (
                  <span
                    key={sport}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md"
                  >
                    {sport}
                    <button
                      onClick={() => handleSportToggle(sport)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <TabsContent value="outdoor">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-x-6 sm:gap-y-8 lg:gap-y-12 justify-items-center">
                {filterFacilities(outdoorFacilities).map((facility) => (
                  <FacilityCard
                    key={facility.id}
                    {...facility}
                    onBook={handleBooking}
                  />
                ))}
              </div>
              {filterFacilities(outdoorFacilities).length === 0 && (selectedSports.length > 0 || showOnlyAvailable) && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No outdoor facilities found matching your filters.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="indoor">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-x-6 sm:gap-y-8 lg:gap-y-12 justify-items-center">
                {filterFacilities(indoorFacilities).map((facility) => (
                  <FacilityCard
                    key={facility.id}
                    {...facility}
                    onBook={handleBooking}
                  />
                ))}
              </div>
              {filterFacilities(indoorFacilities).length === 0 && (selectedSports.length > 0 || showOnlyAvailable) && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No indoor facilities found matching your filters.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        facility={selectedFacility}
        isSignedIn={isSignedIn}
      />
      
      <Footer isSignedIn={isSignedIn} />
    </div>
  );
};

export default Index;