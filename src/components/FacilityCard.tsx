import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface FacilityCardProps {
  id: string;
  name: string;
  sport: string;
  capacity: number;
  available: number;
  location: string;
  nextSlot: string;
  image: string;
  status: 'available' | 'full' | 'maintenance';
  rating: number;
  votes: number;
  onBook: (facilityId: string) => void;
  maintenanceMessage?: string;
  apiStatus?: 'available' | 'full' | 'maintenance';
}

export const FacilityCard = ({ 
  id, 
  name, 
  sport, 
  capacity, 
  available, 
  location, 
  nextSlot, 
  image, 
  status,
  rating,
  votes,
  onBook,
  maintenanceMessage,
  apiStatus
}: FacilityCardProps) => {
  // Use API status if provided, otherwise fall back to original status
  // If no slots are available, force status to 'full' (Not Available)
  const actualStatus = available === 0 ? 'full' : (apiStatus || status);

  const getStatusBadge = () => {
    switch (actualStatus) {
      case 'available':
        return <Badge className="facility-available">Available</Badge>;
      case 'full':
        return <Badge className="facility-full">Not Available</Badge>;
      case 'maintenance':
        return <Badge className="facility-maintenance">Down for Maintenance</Badge>;
    }
  };

  const getCourtsForSport = (sport: string, facilityName: string) => {
    // Map facility name and sport to court count based on Excel data
    const courtMap: { [key: string]: number } = {
      'Basketball Court': 2,
      'Half Basketball Court': 2,
      'Volleyball Court': 2,
      'Tennis Court': 2,
      'Badminton Court': 3, // Default, will be overridden by location
      'Squash Court': 3,
      'Swimming Pool': 1,
      'Pickleball Courts': 10,
      'Gym': 1,
      'Padel Court': 2,
      'Table Tennis': 6,
      'Kabaddi Court': 1,
      'Chess Room': 1,
      'Football Ground': 1,
      'Cricket Ground': 1
    };
    
    // Special handling for facilities with multiple locations
    if (facilityName === 'Badminton Court') {
      if (location.includes('German')) return 10;
      if (location.includes('C10-C11')) return 3;
      return 3; // Sports Complex default
    }
    
    return courtMap[facilityName] || 1;
  };

  return (
    <div className="w-full max-w-[278px] mx-auto">
      <Card 
        className={`booking-card group w-full h-[300px] sm:h-[350px] lg:h-[417px] overflow-hidden bg-card dark:bg-card relative ${
          actualStatus === 'available' ? 'cursor-pointer' : 'cursor-default'
        }`} 
        onClick={actualStatus === 'available' ? () => onBook(id) : undefined}
        style={{ cursor: actualStatus === 'available' ? 'pointer' : 'default' }}
      >
        <div className="relative h-full">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
          {/* Gray overlay for full status */}
          {actualStatus === 'full' && (
            <div className="absolute inset-0 bg-gray-500/90 z-10" />
          )}
          {/* Gray overlay for maintenance status */}
          {actualStatus === 'maintenance' && (
            <div className="absolute inset-0 bg-gray-500/90 z-10" />
          )}
          {/* Drop shadow overlay for text visibility */}
          <div className="absolute inset-x-0 bottom-0 h-[120px] sm:h-[150px] lg:h-[175px] bg-gradient-to-t from-black/95 via-black/70 to-transparent z-20" />
          
          <div className="absolute top-2 left-2 z-30">
            {getStatusBadge()}
          </div>
          
          {/* Maintenance message */}
          {actualStatus === 'maintenance' && maintenanceMessage && (
            <div className="absolute inset-0 flex items-center justify-center z-30 p-4">
              <p className="text-center font-bold leading-relaxed text-white drop-shadow-lg bg-black/60 p-4 rounded-lg">
                {maintenanceMessage}
              </p>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 space-y-1 text-white z-30">
            <p className="text-xs sm:text-sm text-white/95 font-medium drop-shadow-md">{capacity} persons</p>
            <p className="text-xs sm:text-sm text-white/95 font-medium drop-shadow-md">{location}</p>
          </div>
        </div>
      </Card>
      
      {/* Sport name and courts below card */}
      <div className="mt-2 sm:mt-3 space-y-1 text-center sm:text-left">
        <p className="text-3xl sm:text-4xl font-anton font-bold text-foreground uppercase">{sport}</p>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">{getCourtsForSport(sport, name)} {getCourtsForSport(sport, name) === 1 ? 'court' : 'courts'}</p>
      </div>
    </div>
  );
};