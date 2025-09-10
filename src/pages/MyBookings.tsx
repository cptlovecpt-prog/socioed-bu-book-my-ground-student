import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, MapPin, Users, QrCode, X, Building } from "lucide-react";
import { useState } from "react";
import { useBookings } from "@/contexts/BookingContext";
import { QRCodeDialog } from "@/components/QRCodeDialog";
import { useToast } from "@/hooks/use-toast";
import { addDays, parseISO, parse, isBefore, addHours } from "date-fns";
import { isWithinOneHourOfEvent, isQRCodeAvailable } from "@/utils/timeUtils";

// Utility function to check if event is more than 1 hour away
const isEventMoreThanOneHourAway = (date: string, time: string): boolean => {
  try {
    const now = new Date();
    let bookingDate: Date;
    
    // Parse the date
    if (date === "Today") {
      bookingDate = new Date();
    } else if (date === "Tomorrow") {
      bookingDate = addDays(new Date(), 1);
    } else {
      // Try to parse date formats like "Dec 12" or "Dec 12, 2024"
      const currentYear = new Date().getFullYear();
      const dateWithYear = date.includes(',') ? date : `${date}, ${currentYear}`;
      bookingDate = parse(dateWithYear, 'MMM dd, yyyy', new Date());
    }
    
    // Parse the start time
    const startTime = time.split(' - ')[0];
    const [hours, minutes] = startTime.split(':').map(Number);
    
    // Set the booking time
    bookingDate.setHours(hours, minutes, 0, 0);
    
    // Check if event is more than 1 hour away
    const oneHourFromNow = addHours(now, 1);
    
    return bookingDate > oneHourFromNow;
  } catch (error) {
    console.error('Error parsing booking time:', error);
    return false;
  }
};

// Utility function to check if cancellation is allowed (more than 1 hour before event)
const isCancellationAllowed = (date: string, time: string): boolean => {
  try {
    const now = new Date();
    let bookingDate: Date;
    
    // Parse the date
    if (date === "Today") {
      bookingDate = new Date();
    } else if (date === "Tomorrow") {
      bookingDate = addDays(new Date(), 1);
    } else {
      // Try to parse date formats like "Dec 12" or "Dec 12, 2024"
      const currentYear = new Date().getFullYear();
      const dateWithYear = date.includes(',') ? date : `${date}, ${currentYear}`;
      bookingDate = parse(dateWithYear, 'MMM dd, yyyy', new Date());
    }
    
    // Parse the start time (we only care about start time for cancellation)
    const startTime = time.split(' - ')[0];
    const [hours, minutes] = startTime.split(':').map(Number);
    
    // Set the booking time
    bookingDate.setHours(hours, minutes, 0, 0);
    
    // Check if current time is more than 1 hour before booking time
    const oneHourBeforeBooking = addHours(bookingDate, -1);
    
    return isBefore(now, oneHourBeforeBooking);
  } catch (error) {
    console.error('Error parsing booking time:', error);
    // If parsing fails, allow cancellation to be safe
    return true;
  }
};

// Utility function to convert 24-hour time to AM/PM format
const convertTo12HourFormat = (timeRange: string) => {
  // Check if time already has AM/PM format
  if (timeRange.includes('AM') || timeRange.includes('PM')) {
    return timeRange; // Already formatted, return as is
  }
  
  const [startTime, endTime] = timeRange.split(' - ');
  
  const convertTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  return `${convertTime(startTime)} - ${convertTime(endTime)}`;
};

interface MyBookingsProps {
  isSignedIn: boolean;
  setIsSignedIn: (value: boolean) => void;
  userData: { name: string; email: string } | null;
  setUserData: (data: { name: string; email: string } | null) => void;
}

const MyBookings = ({ isSignedIn, setIsSignedIn, userData, setUserData }: MyBookingsProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [bookingForQRCode, setBookingForQRCode] = useState<any>(null);
  
  const { bookings, cancelBooking } = useBookings();
  const { toast } = useToast();

  // Sort bookings from latest first
  const sortedBookings = [...bookings].sort((a, b) => {
    // Helper function to convert booking date/time to Date object for comparison
    const getBookingDateTime = (booking: any) => {
      let bookingDate: Date;
      
      if (booking.date === "Today") {
        bookingDate = new Date();
      } else if (booking.date === "Tomorrow") {
        bookingDate = addDays(new Date(), 1);
      } else {
        // Try different date formats
        try {
          // First try parsing as full date (e.g., "Sep 12, 2025")
          if (booking.date.includes(',')) {
            bookingDate = new Date(booking.date);
          } else {
            // Try parsing formats like "Dec 12" by adding current year
            const currentYear = new Date().getFullYear();
            const dateWithYear = `${booking.date}, ${currentYear}`;
            bookingDate = new Date(dateWithYear);
            
            // If the parsed date is invalid, try next year
            if (isNaN(bookingDate.getTime())) {
              const nextYear = currentYear + 1;
              const dateWithNextYear = `${booking.date}, ${nextYear}`;
              bookingDate = new Date(dateWithNextYear);
            }
          }
        } catch (error) {
          console.error('Error parsing date:', booking.date, error);
          bookingDate = new Date(); // Fallback to current date
        }
      }
      
      // Add time information for more precise sorting
      if (booking.time && typeof booking.time === 'string') {
        const startTime = booking.time.split(' - ')[0];
        if (startTime) {
          // Handle both 12-hour and 24-hour formats
          const timeParts = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = parseInt(timeParts[2]);
            const ampm = timeParts[3];
            
            if (ampm) {
              // 12-hour format
              if (ampm.toUpperCase() === 'PM' && hours !== 12) {
                hours += 12;
              } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
                hours = 0;
              }
            }
            
            bookingDate.setHours(hours, minutes, 0, 0);
          }
        }
      }
      
      return bookingDate;
    };
    
    const dateA = getBookingDateTime(a);
    const dateB = getBookingDateTime(b);
    
    // Sort by date/time in descending order (latest first)
    return dateB.getTime() - dateA.getTime();
  });

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setShowCancelDialog(true);
  };

  const handleQRCodeClick = (booking: any) => {
    if (isQRCodeAvailable(booking.date, booking.time)) {
      setBookingForQRCode(booking);
      setShowQRCodeDialog(true);
    }
  };

  const handleConfirmCancel = () => {
    if (bookingToCancel) {
      cancelBooking(bookingToCancel);
      toast({
        title: "Booking Cancellation",
        description: "Booking cancelled successfully, details have been shared on mail",
        duration: 4000,
      });
    }
    setShowCancelDialog(false);
    setBookingToCancel(null);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Navigation 
          isSignedIn={isSignedIn}
          setIsSignedIn={setIsSignedIn}
          userData={userData}
          setUserData={setUserData}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Bookings</h1>
            <p className="text-muted-foreground">You have {sortedBookings.length} booking{sortedBookings.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="space-y-6">
            {sortedBookings.length === 0 ? (
              <Card className="w-full">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground text-lg">No bookings found</p>
                  <p className="text-muted-foreground text-sm mt-2">Book a facility to see it here</p>
                </CardContent>
              </Card>
            ) : (
              sortedBookings.map((booking) => (
                <Card key={booking.id} className="w-full relative">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{booking.facilityName}</h3>
                          <Badge 
                            variant="secondary" 
                            className={
                              booking.status === 'Upcoming' 
                                ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800" 
                                : booking.status === 'Cancelled'
                                ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800"
                                : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{booking.sport}</p>
                      </div>
                      <span className="text-sm text-muted-foreground font-mono">{booking.id}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{booking.date} • {convertTo12HourFormat(booking.time)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.participants}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.facilitySize} sq mtrs.</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {isQRCodeAvailable(booking.date, booking.time) ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2 text-[#05a25b] border-[#05a25b] hover:bg-[#05a25b] hover:text-white"
                          onClick={() => handleQRCodeClick(booking)}
                        >
                          <QrCode className="h-4 w-4" />
                          <span className="hidden sm:inline">QR Code</span>
                        </Button>
                      ) : isEventMoreThanOneHourAway(booking.date, booking.time) ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2 text-[#ac909c] border-[#ac909c] hover:bg-[#ac909c] hover:text-white"
                          onClick={() => {
                            toast({
                              title: "QR Code Not Available",
                              description: "QR Code will be available from 1 hr before the event till 20 mins after event starts",
                              duration: 4000,
                            });
                          }}
                        >
                          <QrCode className="h-4 w-4" />
                          <span className="hidden sm:inline">QR Code</span>
                        </Button>
                       ) : (
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button 
                               variant="outline" 
                               size="sm" 
                               className="flex items-center gap-2 text-[#ac909c] border-[#ac909c] opacity-50 cursor-not-allowed"
                               disabled={true}
                             >
                               <QrCode className="h-4 w-4" />
                               <span className="hidden sm:inline">QR Code</span>
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>QR Code is no longer available for this event</p>
                           </TooltipContent>
                         </Tooltip>
                       )}
                      
                      {booking.status === 'Upcoming' && (
                        (() => {
                          const canCancel = isCancellationAllowed(booking.date, booking.time);
                           return canCancel ? (
                             <Button 
                               variant="outline" 
                               size="sm" 
                               className="flex items-center gap-2 text-destructive hover:text-white hover:bg-destructive border-destructive"
                               onClick={() => handleCancelClick(booking.id)}
                             >
                               <X className="h-4 w-4" />
                               <span className="hidden sm:inline">Cancel</span>
                             </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-2 text-[#ab909c] border-[#ab909c] hover:bg-[#ab909c] hover:text-white"
                                onClick={() => {
                                  toast({
                                    title: "Cancellation Not Allowed",
                                    description: "Booking cannot be cancelled within 1 hr from event starting time",
                                    duration: 4000,
                                  });
                                }}
                              >
                                <X className="h-4 w-4" />
                                <span className="hidden sm:inline">Cancel</span>
                              </Button>
                            );
                        })()
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
        
        {bookingForQRCode && (
          <QRCodeDialog
            isOpen={showQRCodeDialog}
            onClose={() => {
              setShowQRCodeDialog(false);
              setBookingForQRCode(null);
            }}
            booking={bookingForQRCode}
            isQRAvailable={isQRCodeAvailable(bookingForQRCode.date, bookingForQRCode.time)}
          />
        )}
        
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alert</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your reservation?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmCancel}>
                Yes, Cancel Reservation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default MyBookings;