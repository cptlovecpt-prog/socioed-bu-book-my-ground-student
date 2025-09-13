import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { QrCode, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useBookings } from "@/contexts/BookingContext";
import { QRCodeDialog } from "./QRCodeDialog";
import { useToast } from "@/hooks/use-toast";
import { addDays } from "date-fns";
import { isQRCodeAvailable } from "@/utils/timeUtils";
import { isBookingUpcoming, isCancellationAllowed } from "@/utils/bookingUtils";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface YourBookingsProps {
  isSignedIn: boolean;
}

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

const YourBookings = ({ isSignedIn }: YourBookingsProps) => {
  const { bookings, cancelBooking } = useBookings();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  
  // Filter to only show upcoming bookings that haven't expired (strict filter for this section only)
  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'Upcoming' && isBookingUpcoming(booking.date, booking.time)
  );
  
  // Reset currentIndex if it exceeds the available bookings
  useEffect(() => {
    if (currentIndex >= upcomingBookings.length && upcomingBookings.length > 0) {
      setCurrentIndex(0);
    }
  }, [upcomingBookings.length, currentIndex]);
  
  if (!isSignedIn || upcomingBookings.length === 0) return null;

  // Sort bookings by latest first, prioritizing "Today" and "Tomorrow"
  const sortedBookings = [...upcomingBookings].sort((a, b) => {
    const dateOrder = { "Today": 0, "Tomorrow": 1 };
    const aOrder = dateOrder[a.date as keyof typeof dateOrder] ?? 2;
    const bOrder = dateOrder[b.date as keyof typeof dateOrder] ?? 2;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // For same category, sort by date string (newest first for regular dates)
    if (aOrder === 2 && bOrder === 2) {
      return new Date(b.date) > new Date(a.date) ? 1 : -1;
    }
    
    return 0;
  });

  // Ensure currentIndex is within bounds
  const safeCurrentIndex = Math.min(currentIndex, sortedBookings.length - 1);
  const currentBooking = sortedBookings[safeCurrentIndex];
  
  // Check if cancellation is allowed for current booking
  const canCancel = currentBooking ? isCancellationAllowed(currentBooking.date, currentBooking.time) : false;
  
  // Check if QR code is available (1 hour before to 20 minutes after event start)
  const isQRAvailable = currentBooking ? isQRCodeAvailable(currentBooking.date, currentBooking.time) : false;
  
  // Check if event is more than 1 hour away (using same logic as MyBookings)
  const isMoreThanOneHourAway = currentBooking ? (() => {
    try {
      const now = new Date();
      let bookingDate: Date;
      
      if (currentBooking.date === "Today") {
        bookingDate = new Date();
      } else if (currentBooking.date === "Tomorrow") {
        bookingDate = addDays(new Date(), 1);
      } else {
        const currentYear = new Date().getFullYear();
        const dateWithYear = currentBooking.date.includes(',') ? currentBooking.date : `${currentBooking.date}, ${currentYear}`;
        bookingDate = new Date(dateWithYear);
      }
      
      const startTime = currentBooking.time.split(' - ')[0];
      const timeParts = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const ampm = timeParts[3];
        
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
          } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
          }
        }
        
        bookingDate.setHours(hours, minutes, 0, 0);
      }
      
      const oneHourFromNow = addDays(now, 0);
      oneHourFromNow.setHours(now.getHours() + 1, now.getMinutes(), 0, 0);
      
      return bookingDate > oneHourFromNow;
    } catch (error) {
      return false;
    }
  })() : false;

  const nextBooking = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedBookings.length);
  };

  const prevBooking = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedBookings.length) % sortedBookings.length);
  };

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setShowCancelDialog(true);
  };

  const handleQRCodeClick = () => {
    if (isQRAvailable) {
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
      if (currentIndex >= sortedBookings.length - 1) {
        setCurrentIndex(Math.max(0, sortedBookings.length - 2));
      }
    }
    setShowCancelDialog(false);
    setBookingToCancel(null);
  };

  return (
    <TooltipProvider>
      <section 
        className="h-[280px] bg-primary/10 border-y border-border"
        style={{ backgroundColor: "hsl(var(--primary) / 0.08)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8 h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-foreground">Upcoming Bookings</h2>
            {sortedBookings.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {safeCurrentIndex + 1} of {sortedBookings.length}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevBooking}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextBooking}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center h-[145px]">
            <Card className="flex items-center bg-card/80 backdrop-blur-sm border border-border/50 w-full h-full overflow-hidden">
              {/* Booking Image */}
              <div className="relative w-64 h-full flex-shrink-0">
                <img 
                  src={currentBooking.image} 
                  alt={currentBooking.facilityName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Booking Details */}
              <div className="flex-1 min-w-0 p-4">
                <h3 className="font-semibold text-foreground truncate">{currentBooking.facilityName}</h3>
                <p className="text-sm text-muted-foreground">{currentBooking.location}</p>
                <p className="text-sm text-muted-foreground">{currentBooking.participants} • {currentBooking.facilitySize} sq mtrs.</p>
                <p className="text-sm text-muted-foreground">{currentBooking.date} • {convertTo12HourFormat(currentBooking.time)}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0 p-4 pl-0">
                {isQRAvailable ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-1 text-[#05a25b] border-[#05a25b] hover:bg-[#05a25b] hover:text-white"
                    onClick={handleQRCodeClick}
                  >
                    <QrCode className="h-4 w-4" />
                    <span className="hidden sm:inline">QR Code</span>
                  </Button>
                 ) : isMoreThanOneHourAway ? (
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="flex items-center space-x-1 text-[#ac909c] border-[#ac909c] hover:bg-[#ac909c] hover:text-white"
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
                          className="flex items-center space-x-1 text-[#ac909c] border-[#ac909c] opacity-50 cursor-not-allowed"
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
                
                {canCancel ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-1 text-destructive hover:text-white hover:bg-destructive border-destructive"
                    onClick={() => handleCancelClick(currentBooking.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-1 text-[#ab909c] border-[#ab909c] hover:bg-[#ab909c] hover:text-white"
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
                )}
              </div>
            </Card>
          </div>
        </div>
        
        <QRCodeDialog
          isOpen={showQRCodeDialog}
          onClose={() => setShowQRCodeDialog(false)}
          booking={currentBooking}
          isQRAvailable={isQRAvailable}
        />
        
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alert</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your booking?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className={cn(buttonVariants(), "mt-2 sm:mt-0")}>Keep Booking</AlertDialogCancel>
              <AlertDialogAction className={cn(buttonVariants({ variant: "outline" }))} onClick={handleConfirmCancel}>
                Yes, Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </TooltipProvider>
  );
};

export default YourBookings;