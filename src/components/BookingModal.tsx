import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Users, Share2, QrCode, ChevronLeft, ChevronRight, X, Mail, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBookings } from "@/contexts/BookingContext";
import { format, addDays, isSameDay } from "date-fns";
import QRCodeLib from "qrcode";
import { getSportImage } from "@/constants/images";

interface TimeSlot {
  id: string;
  time: string;
  available: number;
  capacity: number;
  isExpired?: boolean;
  unavailableReason?: 'expired' | 'booked' | 'blocked' | 'maintenance';
}

interface ParticipantData {
  enrollmentId: string;
}

type BookingStep = 'slot-selection' | 'booking-confirmation' | 'final-confirmation';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignedIn: boolean;
  selectedDate: Date;
  facility: {
    id: string;
    name: string;
    sport: string;
    location: string;
  } | null;
}

// Sport configuration with max participants based on Excel data
const sportConfig: { [key: string]: number } = {
  'Football': 22,
  'Cricket': 22,
  'Basketball': 20,
  'Volleyball': 24,
  'Tennis': 8,
  'Badminton': 12,
  'Squash': 6,
  'Swimming': 35,
  'Pickleball': 40,
  'Gym': 40,
  'Field Court': 8,
  'Hockey': 10,
  'Table Tennis': 48,
  'Chess': 10,
  'Padel': 8,
  'Padel Court': 8,
  'Basket Court': 12
};

// Generate 45-minute slots for morning (6:30 AM - 9:30 AM) and evening (5:30 PM - 10:00 PM)
const generateTimeSlots = (selectedDate: Date, facilityCapacity: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  let id = 1;
  const currentTime = new Date();
  
  // Create a seed based on the selected date to ensure consistent availability for each date
  const dateSeed = selectedDate.getFullYear() * 10000 + selectedDate.getMonth() * 100 + selectedDate.getDate();
  
  // Simple seeded random function to ensure consistency
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Helper function to check if slot is expired
  const isSlotExpired = (slotStartTime: Date, selectedDate: Date) => {
    // Create the actual slot date/time by combining selected date with slot time
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(slotStartTime.getHours(), slotStartTime.getMinutes(), 0, 0);
    
    return slotDateTime < currentTime;
  };

  // Morning slots: 6:30 AM to 9:30 AM
  const morningStart = new Date();
  morningStart.setHours(6, 30, 0, 0);
  
  for (let i = 0; i < 4; i++) {
    const startTime = new Date(morningStart);
    startTime.setMinutes(startTime.getMinutes() + (i * 45));
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 45);
    
    // Check if slot is expired
    const isExpired = isSlotExpired(startTime, selectedDate);
    
    // Create different slot states based on seeded random for consistency
    const random = seededRandom(dateSeed + id);
    let available: number;
    let unavailableReason: 'expired' | 'booked' | 'blocked' | 'maintenance' | undefined;
    
    // If slot is expired, set available to 0
    if (isExpired) {
      available = 0;
      unavailableReason = 'expired';
    } else if (random < 0.3) {
      available = facilityCapacity; // Fully available
    } else if (random < 0.6) {
      // Partially available - generate X where X < facilityCapacity
      available = Math.floor(seededRandom(dateSeed + id + 1000) * (facilityCapacity - 1)) + 1;
    } else if (random < 0.8) {
      available = 0; // Slot unavailable - booked
      unavailableReason = 'booked';
    } else if (random < 0.9) {
      available = 0; // Blocked by admin
      unavailableReason = 'blocked';
    } else {
      available = 0; // Down for maintenance
      unavailableReason = 'maintenance';
    }
    
    slots.push({
      id: id.toString(),
      time: `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`,
      available: available,
      capacity: facilityCapacity,
      isExpired: isExpired,
      unavailableReason: unavailableReason
    });
    id++;
  }

  // Evening slots: 5:30 PM to 10:00 PM
  const eveningStart = new Date();
  eveningStart.setHours(17, 30, 0, 0);
  
  for (let i = 0; i < 6; i++) {
    const startTime = new Date(eveningStart);
    startTime.setMinutes(startTime.getMinutes() + (i * 45));
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 45);
    
    // Check if slot is expired
    const isExpired = isSlotExpired(startTime, selectedDate);
    
    // Create different slot states based on seeded random for consistency
    const random = seededRandom(dateSeed + id);
    let available: number;
    let unavailableReason: 'expired' | 'booked' | 'blocked' | 'maintenance' | undefined;
    
    // If slot is expired, set available to 0
    if (isExpired) {
      available = 0;
      unavailableReason = 'expired';
    } else if (random < 0.3) {
      available = facilityCapacity; // Fully available
    } else if (random < 0.6) {
      // Partially available - generate X where X < facilityCapacity
      available = Math.floor(seededRandom(dateSeed + id + 1000) * (facilityCapacity - 1)) + 1;
    } else if (random < 0.8) {
      available = 0; // Slot unavailable - booked
      unavailableReason = 'booked';
    } else if (random < 0.9) {
      available = 0; // Blocked by admin
      unavailableReason = 'blocked';
    } else {
      available = 0; // Down for maintenance
      unavailableReason = 'maintenance';
    }
    
    slots.push({
      id: id.toString(),
      time: `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`,
      available: available,
      capacity: facilityCapacity,
      isExpired: isExpired,
      unavailableReason: unavailableReason
    });
    id++;
  }

  return slots;
};

export const BookingModal = ({ isOpen, onClose, facility, isSignedIn, selectedDate }: BookingModalProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('slot-selection');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [participants, setParticipants] = useState<ParticipantData[]>([{ enrollmentId: '' }]);
  const [sendEmailConfirmation, setSendEmailConfirmation] = useState<boolean>(false);
  const [shareToken] = useState("BK-" + Math.random().toString(36).substr(2, 8).toUpperCase());
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  
  // Daily booking limit tracking
  const getDailyBookingKey = (date: Date) => {
    return `daily_bookings_${format(date, 'yyyy-MM-dd')}`;
  };

  const getDailyBookingCount = (date: Date) => {
    const key = getDailyBookingKey(date);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored).count : 0;
  };

  const incrementDailyBookingCount = (date: Date) => {
    const key = getDailyBookingKey(date);
    const currentCount = getDailyBookingCount(date);
    localStorage.setItem(key, JSON.stringify({ count: currentCount + 1, date: format(date, 'yyyy-MM-dd') }));
  };

  const decrementDailyBookingCount = (date: Date) => {
    const key = getDailyBookingKey(date);
    const currentCount = getDailyBookingCount(date);
    if (currentCount > 0) {
      localStorage.setItem(key, JSON.stringify({ count: currentCount - 1, date: format(date, 'yyyy-MM-dd') }));
    }
  };

  const canBookForDay = (date: Date) => {
    return getDailyBookingCount(date) < 2;
  };

  const dailyBookingsCount = getDailyBookingCount(selectedDate);
  const canBookToday = canBookForDay(selectedDate);

  // Get existing bookings for the selected date
  const getExistingBookingsForDate = (date: Date) => {
    const dateStr = isSameDay(date, new Date()) ? "Today" : 
                   isSameDay(date, addDays(new Date(), 1)) ? "Tomorrow" :
                   format(date, 'MMM dd, yyyy');
    
    return bookings.filter(booking => 
      booking.date === dateStr && 
      (booking.status === 'Upcoming' || booking.status === 'Completed')
    );
  };

  // Check if two time slots are consecutive
  const areConsecutiveSlots = (slot1Time: string, slot2Time: string) => {
    // Parse time from "6:30 am - 7:15 am" format
    const parseTime = (timeRange: string) => {
      const startTime = timeRange.split(' - ')[0].trim();
      let [time, period] = startTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (period?.toLowerCase() === 'pm' && hours !== 12) {
        hours += 12;
      } else if (period?.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }
      
      return hours * 60 + minutes; // Convert to minutes
    };

    const slot1End = parseTime(slot1Time) + 45; // 45 minute slots
    const slot2Start = parseTime(slot2Time);
    const slot1Start = parseTime(slot1Time);
    const slot2End = parseTime(slot2Time) + 45;

    // Check if slots are consecutive (one ends when the other starts)
    return slot1End === slot2Start || slot2End === slot1Start;
  };

  // Check if a slot is consecutive to existing bookings
  const isConsecutiveSlot = (slotTime: string) => {
    const existingBookings = getExistingBookingsForDate(selectedDate);
    
    return existingBookings.some(booking => 
      areConsecutiveSlots(booking.time, slotTime)
    );
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      if (currentStep === 'final-confirmation') {
        resetModal();
      } else {
        setShowExitConfirm(true);
      }
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    resetModal();
  };
  
  const { toast } = useToast();
  const { addBooking, bookings } = useBookings();
  
  const timeSlots = generateTimeSlots(selectedDate, facility ? sportConfig[facility.sport] || 10 : 10);
  const maxParticipants = facility ? sportConfig[facility.sport] || 10 : 10;

  const handleSlotSelect = async (slotId: string) => {
    const selectedTimeSlot = timeSlots.find(s => s.id === slotId);
    if (!selectedTimeSlot) return;

    // Check if this is a consecutive slot for today/tomorrow
    const isToday = isSameDay(selectedDate, new Date());
    const isTomorrow = isSameDay(selectedDate, addDays(new Date(), 1));
    
    if ((isToday || isTomorrow) && isConsecutiveSlot(selectedTimeSlot.time)) {
      toast({
        title: "Alert",
        description: "Consecutive slot booking is not allowed, please book any other slot of your choice",
        duration: 4000,
      });
      return;
    }
    
    setSelectedSlot(slotId);
    
    // Update availability after selection (API call placeholder)
    await updateSlotAvailability(slotId);
    
    setCurrentStep('booking-confirmation');
  };

  // Placeholder function for updating slot availability via API
  const updateSlotAvailability = async (slotId: string) => {
    // TODO: Replace with actual API call to update slot availability
    console.log('Would update slot availability for:', slotId);
    
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  };

  // Removed handleParticipantCountSelect and handleEnrollmentIdChange as they're no longer needed

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

  // Placeholder function for email service - replace with actual email service integration
  const sendConfirmationEmails = async (bookingDetails: any, participantEmails: string[]) => {
    // TODO: Replace with actual email service integration (Supabase, Zapier, etc.)
    console.log('Email service would be called here with:', {
      bookingDetails,
      participantEmails,
      facility: facility?.name,
      date: isSameDay(selectedDate, new Date()) ? "Today" : 
            isSameDay(selectedDate, addDays(new Date(), 1)) ? "Tomorrow" :
            format(selectedDate, 'MMM dd, yyyy'),
      participants: participants.map(p => p.enrollmentId)
    });
    
    // Simulate email sending delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !facility) return;
    
    if (!isSignedIn) {
      toast({
        title: "Please Sign-In to continue with booking",
        duration: 4000,
      });
      return;
    }

    // Check daily booking limit first
    if (!canBookToday) {
      const dateDisplay = isSameDay(selectedDate, new Date()) ? "today" : 
                         isSameDay(selectedDate, addDays(new Date(), 1)) ? "tomorrow" :
                         format(selectedDate, 'MMM dd, yyyy');
      toast({
        title: `Daily booking limit reached`,
        description: `You can only book 2 slots per day. You have already booked ${dailyBookingsCount}/2 slots for ${dateDisplay}.`,
        duration: 4000,
      });
      return;
    }

    // Check if user already has 4 upcoming bookings
    const upcomingBookings = bookings.filter(booking => booking.status === 'Upcoming');
    if (upcomingBookings.length >= 4) {
      toast({
        title: "You already have 4 active bookings, you can schedule another booking after a booking completes",
        duration: 4000,
      });
      return;
    }

    const selectedTimeSlot = timeSlots.find(s => s.id === selectedSlot);
    if (selectedTimeSlot) {
      const bookingData = {
        facilityName: facility.name,
        sport: facility.sport,
        location: facility.location,
        date: isSameDay(selectedDate, new Date()) ? "Today" : 
              isSameDay(selectedDate, addDays(new Date(), 1)) ? "Tomorrow" :
              format(selectedDate, 'MMM dd, yyyy'),
        time: selectedTimeSlot.time,
        image: getSportImage(facility.sport),
        participants: `${participantCount} participant${participantCount > 1 ? 's' : ''}`,
        facilitySize: getSizeForSport(facility.sport)
      };

      // Add the booking to context
      addBooking(bookingData);
      
      // Increment daily booking count
      incrementDailyBookingCount(selectedDate);
      
      // Generate QR code
      generateQRCode();

      // Send email confirmation if requested
      if (sendEmailConfirmation) {
        try {
          // Placeholder for participant emails - would typically fetch from enrollment IDs
          const participantEmails = participants.map(p => `${p.enrollmentId}@example.com`);
          await sendConfirmationEmails(bookingData, participantEmails);
        } catch (error) {
          console.error('Email sending failed:', error);
        }
      }
      
      toast({
        title: "Booking Confirmed",
        description: "Your booking details have been shared on your university e-mail address",
        duration: 4000,
      });
    }
    
    setCurrentStep('final-confirmation');
  };

  const generateQRCode = async () => {
    const shareUrl = `${window.location.origin}/join/${shareToken}`;
    try {
      const qrCodeDataUrl = await QRCodeLib.toDataURL(shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const resetModal = () => {
    setCurrentStep('slot-selection');
    setSelectedSlot(null);
    setParticipantCount(1);
    setParticipants([{ enrollmentId: '' }]);
    setSendEmailConfirmation(false);
    onClose();
  };

  const getImageForFacility = (facility: any) => {
    // Map facility types to their images - this could be improved with proper image mapping
    const sportImages: { [key: string]: string } = {
      'Football': '/lovable-uploads/3a13d82d-5544-4379-a3e4-a65a065f42f8.png',
      'Cricket': '/lovable-uploads/ab1aee87-6cbc-4ad4-ab3e-a52aae6cf731.png',
      'Tennis': '/lovable-uploads/fdffe92f-f5b1-4ab3-9e26-bf822ff29b7e.png',
      'Basketball': '/lovable-uploads/8ba8443e-fd66-4b90-842c-e8cea7b3b146.png',
      'Volleyball': '/lovable-uploads/f5824fb2-7c1a-4759-89eb-628b108960b7.png',
      'Swimming': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop',
      'Badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop',
      'Chess': '/lovable-uploads/02fe3dda-03b5-4600-9dec-0565eb90e485.png',
      'Padel': '/lovable-uploads/30c311d0-0531-4989-b2cf-446fa8a581ed.png',
      'Squash': '/lovable-uploads/de8033c6-2e20-42bf-8b5e-88753e101116.png',
      'Table Tennis': 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&h=300&fit=crop',
      'Gym': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'Pickleball': '/lovable-uploads/75efefc8-6f39-47ce-b08c-18e3336f2ada.png'
    };
    return sportImages[facility.sport] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop';
  };

  // Utility function to convert 24-hour time to AM/PM format
  const convertTo12HourFormat = (timeRange: string) => {
    // Check if the time already has AM/PM format
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

  const handleShare = () => {
    navigator.clipboard.writeText(`Join my booking: ${window.location.origin}/join/${shareToken}`);
    toast({
      title: "Share Link Copied!",
      description: "Your friends can now join your booking using this link.",
      duration: 4000,
    });
  };

  const handleGoBack = () => {
    switch (currentStep) {
      case 'booking-confirmation':
        setCurrentStep('slot-selection');
        break;
      default:
        break;
    }
  };

  const handleShareWhatsApp = () => {
    const selectedTimeSlot = timeSlots.find(s => s.id === selectedSlot);
    const dateDisplay = isSameDay(selectedDate, new Date()) ? "Today" : 
                       isSameDay(selectedDate, addDays(new Date(), 1)) ? "Tomorrow" :
                       format(selectedDate, 'MMM dd, yyyy');
    const timeDisplay = selectedTimeSlot ? convertTo12HourFormat(selectedTimeSlot.time) : '';
    const shareText = `Join me for ${facility?.sport} at ${facility?.name}!\n📅 ${dateDisplay} at ${timeDisplay}\n📍 ${facility?.location}\n\nBooking ID: ${shareToken}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + `${window.location.origin}/join/${shareToken}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = () => {
    const selectedTimeSlot = timeSlots.find(s => s.id === selectedSlot);
    const dateDisplay = isSameDay(selectedDate, new Date()) ? "Today" : 
                       isSameDay(selectedDate, addDays(new Date(), 1)) ? "Tomorrow" :
                       format(selectedDate, 'MMM dd, yyyy');
    const timeDisplay = selectedTimeSlot ? convertTo12HourFormat(selectedTimeSlot.time) : '';
    const shareText = `Join me for ${facility?.sport} at ${facility?.name}!\n📅 ${dateDisplay} at ${timeDisplay}\n📍 ${facility?.location}\n\nBooking ID: ${shareToken}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(`Join me for ${facility?.sport}`)}&body=${encodeURIComponent(shareText + '\n\n' + `${window.location.origin}/join/${shareToken}`)}`;
    window.open(emailUrl);
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 'slot-selection':
        return { current: 1, total: 2, label: 'Select Time Slot' };
      case 'booking-confirmation':
        return { current: 2, total: 2, label: 'Confirm Booking' };
      case 'final-confirmation':
        return { current: 2, total: 2, label: 'Confirmed' };
      default:
        return { current: 1, total: 2, label: 'Select Time Slot' };
    }
  };

  if (!facility) return null;

  const stepInfo = getStepInfo();

  const renderStepContent = () => {
    switch (currentStep) {
      case 'slot-selection':
        const dateDisplay = isSameDay(selectedDate, new Date()) ? "Today" : 
                           isSameDay(selectedDate, addDays(new Date(), 1)) ? "Tomorrow" :
                           format(selectedDate, 'MMM dd, yyyy');
        
        return (
          <div className="space-y-6">
            {/* Show selected date */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">Booking for {dateDisplay}</span>
              </div>
            </div>
            
            {/* Available Time Slots */}
            <div>
              <h3 className="font-medium mb-3">Available Time Slots: Click on available slot to proceed</h3>
              {!canBookToday && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    Daily booking limit reached ({dailyBookingsCount}/2 slots booked for this day). 
                    You cannot book more slots for this day even after canceling existing bookings.
                  </p>
                </div>
              )}
              <div className="grid gap-2">
                 {timeSlots.map((slot) => {
                    const isAvailable = slot.available > 0 && !slot.isExpired && canBookToday;
                    const isExpired = slot.isExpired || slot.unavailableReason === 'expired';
                    const isToday = isSameDay(selectedDate, new Date());
                    const isTomorrow = isSameDay(selectedDate, addDays(new Date(), 1));
                    const isConsecutive = (isToday || isTomorrow) && isConsecutiveSlot(slot.time);
                    
                    return (
                      <div
                        key={slot.id}
                        onClick={() => (isAvailable && !isConsecutive) && handleSlotSelect(slot.id)}
                         className={`p-3 rounded-lg border transition-all ${
                           selectedSlot === slot.id
                             ? 'border-primary bg-primary/5 cursor-pointer'
                              : isAvailable && !isConsecutive
                                ? 'border-border hover:border-primary/50 cursor-pointer' 
                                : isExpired
                                  ? 'border-muted bg-muted/30 cursor-default opacity-60'
                                  : isConsecutive
                                    ? 'border-destructive/30 bg-destructive/5 cursor-not-allowed'
                                    : 'border-destructive/30 bg-destructive/5 cursor-default'
                         }`}
                        style={{ cursor: (isAvailable && !isConsecutive) ? 'pointer' : isConsecutive ? 'not-allowed' : 'default' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className={`h-4 w-4 ${isExpired ? 'text-muted-foreground' : 'text-foreground'}`} />
                            <span className={`font-medium ${isExpired ? 'text-muted-foreground' : 'text-foreground'}`}>{slot.time}</span>
                          </div>
                         <div className="flex items-center gap-2">
                               {isExpired ? (
                                 <Badge 
                                   className="text-white border-gray-600 font-bold relative z-50"
                                   style={{ backgroundColor: '#4a5568' }}
                                 >
                                  Expired
                                </Badge>
                               ) : !canBookToday ? (
                                 <Badge 
                                   className="text-white border-orange-600 font-bold relative z-50"
                                   style={{ backgroundColor: '#d69e2e' }}
                                 >
                                   Daily Limit Reached
                                 </Badge>
                               ) : isConsecutive ? (
                                 <Badge 
                                   className="text-white border-red-600 font-bold relative z-50"
                                   style={{ backgroundColor: '#dc2626' }}
                                 >
                                   Consecutive Slot Blocked
                                 </Badge>
                               ) : slot.available === 0 ? (
                                slot.unavailableReason === 'blocked' ? (
                                   <Badge 
                                     className="text-white border-[#063970] font-bold relative z-50"
                                     style={{ backgroundColor: '#063970' }}
                                   >
                                    Blocked by Admin
                                  </Badge>
                                ) : slot.unavailableReason === 'maintenance' ? (
                                   <Badge 
                                     className="text-white border-[#873e23] font-bold relative z-50"
                                     style={{ backgroundColor: '#873e23' }}
                                   >
                                    Down for Maintenance
                                  </Badge>
                                ) : (
                                  <Badge 
                                    className="slot-unavailable"
                                  >
                                    No Spots Available
                                  </Badge>
                                )
                             ) : slot.available === slot.capacity ? (
                               <Badge 
                                 className="facility-available"
                               >
                                 {slot.available}/{slot.capacity} Spots Available
                               </Badge>
                             ) : (
                                <Badge 
                                  className="slot-partial"
                                >
                                 {slot.available}/{slot.capacity} Spots Available
                               </Badge>
                             )}
                         </div>
                       </div>
                     </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'booking-confirmation':
        const selectedTimeSlot = timeSlots.find(s => s.id === selectedSlot);
        const confirmDateDisplay = isSameDay(selectedDate, new Date()) ? "Today" : 
                           isSameDay(selectedDate, addDays(new Date(), 1)) ? "Tomorrow" :
                           format(selectedDate, 'MMM dd, yyyy');
        const confirmTimeDisplay = selectedTimeSlot ? convertTo12HourFormat(selectedTimeSlot.time) : '';
        
        return (
          <div className="space-y-6">
            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              <div className="mb-4">
                <img 
                  src={getImageForFacility(facility)} 
                  alt={facility.sport}
                  className="w-full h-48 rounded-lg object-cover"
                />
              </div>
              
              <div className="space-y-3 text-left">
                <h4 className="font-semibold text-lg">{facility.name}</h4>
                <p className="text-muted-foreground">{facility.location} • {getSizeForSport(facility.sport)} sq mtrs.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-left">
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Date</span>
                  </div>
                  <p className="font-medium">{confirmDateDisplay}</p>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Time</span>
                  </div>
                  <p className="font-medium">{confirmTimeDisplay}</p>
                </div>
              </div>
              
              <div className="text-left pt-2">
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Available Spots</span>
                </div>
                <p className="font-medium">
                  {selectedTimeSlot ? `${selectedTimeSlot.available}/${selectedTimeSlot.capacity} spots available` : 'Loading...'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="flex-1 h-12 text-lg font-semibold"
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirmBooking}
                className="flex-1 bg-gradient-primary h-12 text-lg font-semibold"
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        );

      case 'final-confirmation':
        const confirmationTimeSlot = timeSlots.find(s => s.id === selectedSlot);
        const finalDateDisplay = isSameDay(selectedDate, new Date()) ? "Today" : 
                           isSameDay(selectedDate, addDays(new Date(), 1)) ? "Tomorrow" :
                           format(selectedDate, 'MMM dd, yyyy');
        const finalTimeDisplay = confirmationTimeSlot ? convertTo12HourFormat(confirmationTimeSlot.time) : '';
        
        // For confirmation, assume QR is not available yet (newly created booking)
        const isConfirmationQRAvailable = false;
        
        return (
          <div className="space-y-6 py-4">
            {/* Heading with checkbox positioned after text */}
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400">Booking Confirmed</h2>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            {/* Full width image with rounded corners */}
            <div className="mb-6">
              <img 
                src={getImageForFacility(facility)} 
                alt={facility.sport}
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
            
            {/* Facility details - left aligned */}
            <div className="text-left space-y-2 mb-6">
              <h3 className="text-lg font-medium">{facility.name}</h3>
              <p className="text-sm text-muted-foreground">Near {facility.location} • {getSizeForSport(facility.sport)} sq mtrs.</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{finalDateDisplay}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{finalTimeDisplay}</span>
                </div>
              </div>
            </div>

            {/* QR code information - no background box */}
            <div className="space-y-2 text-sm text-foreground/80 mb-6">
              <div className="font-bold"><span className="text-red-500">*</span>QR Code will be available from 1 hr before the event till 20 mins after event starts</div>
              <div className="font-bold"><span className="text-red-500">*</span>Please check Your Bookings section for QR Code</div>
              <div className="font-bold"><span className="text-red-500">*</span>QR Code can be scanned at venue from 10 mins before the event till 20 mins after event starts</div>
              <div className="font-bold"><span className="text-red-500">*</span>Bookings can only be cancelled up to 1 hr before event starts</div>
            </div>
            
            <Button
              onClick={handleShareWhatsApp}
              className="w-full flex items-center gap-2 h-12 text-white bg-[#25D366] hover:bg-[#20BA5A] dark:bg-[#25D366] dark:hover:bg-[#20BA5A] border-0"
            >
              <MessageCircle className="h-5 w-5" />
              Share on WhatsApp
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="w-[640px] h-[700px] max-w-none max-h-none flex flex-col">
          <DialogHeader>
            {currentStep !== 'final-confirmation' && (
              <DialogTitle className="flex items-center gap-2">
                Book Your Ground - {facility.name} ({facility.location})
              </DialogTitle>
            )}
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-1">
            {renderStepContent()}
          </div>
          
          {/* Progress Indicator */}
          {currentStep !== 'final-confirmation' && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Booking Progress</span>
                <span className="text-sm font-medium">{stepInfo.current}/{stepInfo.total}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stepInfo.current / stepInfo.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit the booking process?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};