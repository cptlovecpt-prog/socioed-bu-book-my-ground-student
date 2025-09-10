import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Users, Clock, MapPin, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  facility: string;
  sport: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  shareToken: string;
  status: 'upcoming' | 'active' | 'completed';
}

const mockBookings: Booking[] = [
  {
    id: "1",
    facility: "Basketball Court A",
    sport: "Basketball",
    date: "Today",
    time: "14:00 - 16:00",
    location: "Sports Center",
    participants: 8,
    maxParticipants: 10,
    shareToken: "BK-ABC123",
    status: 'upcoming'
  },
  {
    id: "2", 
    facility: "Tennis Court 2",
    sport: "Tennis",
    date: "Tomorrow",
    time: "10:00 - 12:00",
    location: "Outdoor Courts",
    participants: 3,
    maxParticipants: 4,
    shareToken: "BK-XYZ789",
    status: 'upcoming'
  }
];

export const UserDashboard = () => {
  const { toast } = useToast();

  const handleShare = (shareToken: string) => {
    navigator.clipboard.writeText(`Join my booking: ${window.location.origin}/join/${shareToken}`);
    toast({
      title: "Share Link Copied!",
      description: "Your friends can now join your booking using this link.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Upcoming</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const weeklyBookings = mockBookings.filter(b => b.status === 'upcoming').length;
  const maxWeeklyBookings = 4;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Your Bookings</h2>
        <p className="text-muted-foreground">
          You have {weeklyBookings}/{maxWeeklyBookings} bookings this week
        </p>
      </div>

      <div className="grid gap-4">
        {mockBookings.map((booking) => (
          <Card key={booking.id} className="booking-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{booking.facility}</CardTitle>
                {getStatusBadge(booking.status)}
              </div>
              <p className="text-sm text-muted-foreground">{booking.sport}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <span>{booking.date} • {booking.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.location}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {booking.participants}/{booking.maxParticipants} joined
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {booking.shareToken}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleShare(booking.shareToken)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-primary"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {mockBookings.length === 0 && (
        <Card className="booking-card text-center py-12">
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-medium">No bookings yet</h3>
              <p className="text-sm text-muted-foreground">
                Book your first sports facility to get started!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};