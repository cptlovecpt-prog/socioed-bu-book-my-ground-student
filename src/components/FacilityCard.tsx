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
  status: 'available' | 'full';
  rating: number;
  votes: number;
  onBook: (facilityId: string) => void;
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
  onBook 
}: FacilityCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return <Badge className="facility-available">Available</Badge>;
      case 'full':
        return <Badge className="facility-full">Not Available</Badge>;
    }
  };

  const getSizeForSport = (sport: string) => {
    const sizes: { [key: string]: number } = {
      'Football': 8968,
      'Cricket': 7400,
      'Volleyball': 960,
      'Tennis': 1338,
      'Badminton': 480,
      'Squash': 187,
      'Basketball': 536,
      'Swimming': 1474,
      'Pickleball': 736,
      'Gym': 382,
      'Padel': 832,
      'Table Tennis': 1200,
      'Chess': 1048
    };
    return sizes[sport] || 500;
  };

  return (
    <div className="w-full max-w-[278px] mx-auto">
      <Card 
        className={`booking-card group w-full h-[300px] sm:h-[350px] lg:h-[417px] overflow-hidden bg-card dark:bg-card relative ${
          status === 'available' ? 'cursor-pointer' : 'cursor-default'
        }`} 
        onClick={status === 'available' ? () => onBook(id) : undefined}
        style={{ cursor: status === 'available' ? 'pointer' : 'default' }}
      >
        <div className="relative h-full">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
          {/* Gray overlay for full status */}
          {status === 'full' && (
            <div className="absolute inset-0 bg-gray-500/90 z-10" />
          )}
          {/* Drop shadow overlay for text visibility */}
          <div className="absolute inset-x-0 bottom-0 h-[120px] sm:h-[150px] lg:h-[175px] bg-gradient-to-t from-black/95 via-black/70 to-transparent z-20" />
          
          <div className="absolute top-2 left-2 z-30">
            {getStatusBadge()}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 space-y-1 text-white z-30">
            <p className="text-xs sm:text-sm text-white/90">{capacity} persons</p>
            <p className="text-xs sm:text-sm text-white/90">{location}</p>
          </div>
        </div>
      </Card>
      
      {/* Sport name and size below card */}
      <div className="mt-2 sm:mt-3 space-y-1 text-center sm:text-left">
        <p className="text-base sm:text-lg font-semibold text-foreground">{sport}</p>
        <p className="text-xs sm:text-sm text-muted-foreground">{getSizeForSport(sport)} sq mtrs.</p>
      </div>
    </div>
  );
};