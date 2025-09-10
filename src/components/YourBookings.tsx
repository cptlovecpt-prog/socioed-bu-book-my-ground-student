import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { QrCode, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useBookings } from "@/contexts/BookingContext";
import { QRCodeDialog } from "./QRCodeDialog";
import { addDays, parseISO, parse, isBefore, addHours } from "date-fns";
import { isWithinOneHourOfEvent, isQRCodeAvailable } from "@/utils/timeUtils";

interface YourBookingsProps {
  isSignedIn: boolean;
}

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

const YourBookings = ({ isSignedIn }: YourBookingsProps) => {
  const { bookings, cancelBooking } = useBookings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  
  // Filter to only show upcoming bookings
  const upcomingBookings = bookings.filter(booking => booking.status === 'Upcoming');
  
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
      if (currentIndex >= sortedBookings.length - 1) {
        setCurrentIndex(Math.max(0, sortedBookings.length - 2));
      }
    }
    setShowCancelDialog(false);
    setBookingToCancel(null);
  };

  return (
    <section 
      className="h-[250px] bg-primary/10 border-y border-border"
      style={{ backgroundColor: "hsl(var(--primary) / 0.08)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-6 h-full">
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-3xl font-bold text-foreground">Your Bookings</h2>
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
        
        <div className="flex items-center h-full max-h-[180px]">
          <Card className="flex items-center space-x-4 p-4 bg-card/80 backdrop-blur-sm border border-border/50 w-full max-w-4xl">
            {/* Booking Image */}
            <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={currentBooking.image} 
                alt={currentBooking.facilityName}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Booking Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{currentBooking.facilityName}</h3>
              <p className="text-sm text-muted-foreground">{currentBooking.location}</p>
              <p className="text-sm text-muted-foreground">{currentBooking.participants} • {currentBooking.facilitySize} sq mtrs.</p>
              <p className="text-sm text-muted-foreground">{currentBooking.date} • {convertTo12HourFormat(currentBooking.time)}</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex items-center space-x-1 ${
                        !isQRAvailable ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={handleQRCodeClick}
                      disabled={!isQRAvailable}
                    >
                      <QrCode className="h-4 w-4" />
                      <span className="hidden sm:inline">QR Code</span>
                    </Button>
                  </TooltipTrigger>
                  {!isQRAvailable && (
                    <TooltipContent>
                      <p>QR Code available 1 hr before event starts till 20 mins after event starts</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <Button 
                variant="outline" 
                size="sm" 
                className={`flex items-center space-x-1 ${
                  canCancel 
                    ? "text-destructive hover:text-white hover:bg-destructive border-destructive" 
                    : "text-muted-foreground cursor-not-allowed opacity-50"
                }`}
                onClick={() => canCancel && handleCancelClick(currentBooking.id)}
                disabled={!canCancel}
                title={!canCancel ? "Cannot cancel within 1 hour of booking time" : "Cancel booking"}
                style={{ cursor: canCancel ? 'pointer' : 'not-allowed' }}
              >
                {!canCancel && <Clock className="h-4 w-4" />}
                {canCancel && <X className="h-4 w-4" />}
                <span className="hidden sm:inline">{canCancel ? "Cancel" : "Cannot Cancel"}</span>
              </Button>
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
    </section>
  );
};

export default YourBookings;