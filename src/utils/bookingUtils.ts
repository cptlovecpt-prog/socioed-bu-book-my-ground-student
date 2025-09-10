import { addDays, parse, addHours, isBefore, isAfter } from "date-fns";

/**
 * Get the real-time status of a booking based on current date/time
 * @param eventDate - Event date (Today, Tomorrow, or formatted date)
 * @param eventTime - Event time string (e.g., "14:00 - 16:00")
 * @param currentStatus - Current stored status (to preserve Cancelled status)
 * @returns 'Upcoming' | 'Completed' | 'Cancelled'
 */
export const getBookingStatus = (
  eventDate: string, 
  eventTime: string, 
  currentStatus?: string
): 'Upcoming' | 'Completed' | 'Cancelled' => {
  // If booking is cancelled, keep it cancelled
  if (currentStatus === 'Cancelled') {
    return 'Cancelled';
  }

  try {
    const now = new Date();
    let bookingDate: Date;
    
    // Parse the date
    if (eventDate === "Today") {
      bookingDate = new Date();
    } else if (eventDate === "Tomorrow") {
      bookingDate = addDays(new Date(), 1);
    } else {
      // Try to parse date formats like "Dec 12" or "Dec 12, 2024"
      const currentYear = new Date().getFullYear();
      const dateWithYear = eventDate.includes(',') ? eventDate : `${eventDate}, ${currentYear}`;
      bookingDate = parse(dateWithYear, 'MMM dd, yyyy', new Date());
    }
    
    // Parse the end time to determine if event is completed
    const timeRange = eventTime.split(' - ');
    const endTime = timeRange[1] || timeRange[0]; // fallback to start time if no range
    
    // Handle both 12-hour and 24-hour formats
    let hours: number, minutes: number;
    
    const timeMatch = endTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      const ampm = timeMatch[3];
      
      // Convert 12-hour to 24-hour format if needed
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
      }
    } else {
      // Fallback parsing
      const [h, m] = endTime.split(':').map(Number);
      hours = h;
      minutes = m || 0;
    }
    
    // Set the booking end time
    bookingDate.setHours(hours, minutes, 0, 0);
    
    // If current time is after the event end time, it's completed
    return isAfter(now, bookingDate) ? 'Completed' : 'Upcoming';
  } catch (error) {
    console.error('Error parsing booking time:', error);
    // Default to current status or Upcoming if parsing fails
    return (currentStatus as 'Upcoming' | 'Completed' | 'Cancelled') || 'Upcoming';
  }
};

/**
 * Check if booking is truly upcoming (not expired) - matches YourBookings logic
 * @param eventDate - Event date
 * @param eventTime - Event time string
 * @returns boolean - true if booking is still upcoming and not expired
 */
export const isBookingUpcoming = (eventDate: string, eventTime: string): boolean => {
  try {
    const now = new Date();
    let bookingDate: Date;
    
    // Parse the date
    if (eventDate === "Today") {
      bookingDate = new Date();
    } else if (eventDate === "Tomorrow") {
      bookingDate = addDays(new Date(), 1);
    } else {
      // Try to parse date formats like "Dec 12" or "Dec 12, 2024"
      const currentYear = new Date().getFullYear();
      const dateWithYear = eventDate.includes(',') ? eventDate : `${eventDate}, ${currentYear}`;
      bookingDate = parse(dateWithYear, 'MMM dd, yyyy', new Date());
    }
    
    // Parse the end time to check if event has completely finished
    const timeRange = eventTime.split(' - ');
    const endTime = timeRange[1] || timeRange[0]; // fallback to start time if no range
    
    // Handle both 12-hour and 24-hour formats
    let hours: number, minutes: number;
    
    const timeMatch = endTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      const ampm = timeMatch[3];
      
      // Convert 12-hour to 24-hour format if needed
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
      }
    } else {
      // Fallback parsing for 24-hour format
      const [h, m] = endTime.split(':').map(Number);
      hours = h;
      minutes = m || 0;
    }
    
    // Set the booking end time
    bookingDate.setHours(hours, minutes, 0, 0);
    
    // Check if event end time is in the future
    return bookingDate > now;
  } catch (error) {
    console.error('Error parsing booking time:', error);
    return true; // Default to showing if parse fails
  }
};

/**
 * Get count of active bookings (upcoming and not expired) - matches YourBookings logic
 * @param bookings - Array of bookings
 * @returns number - count of active bookings
 */
export const getActiveBookingsCount = (bookings: any[]): number => {
  return bookings.filter(booking => 
    booking.status === 'Upcoming' && isBookingUpcoming(booking.date, booking.time)
  ).length;
};

/**
 * Check if cancellation is allowed (more than 1 hour before event start)
 * @param eventDate - Event date
 * @param eventTime - Event time string  
 * @returns boolean - true if cancellation is allowed
 */
export const isCancellationAllowed = (eventDate: string, eventTime: string): boolean => {
  try {
    const now = new Date();
    let bookingDate: Date;
    
    // Parse the date
    if (eventDate === "Today") {
      bookingDate = new Date();
    } else if (eventDate === "Tomorrow") {
      bookingDate = addDays(new Date(), 1);
    } else {
      const currentYear = new Date().getFullYear();
      const dateWithYear = eventDate.includes(',') ? eventDate : `${eventDate}, ${currentYear}`;
      bookingDate = parse(dateWithYear, 'MMM dd, yyyy', new Date());
    }
    
    // Parse the start time
    const startTime = eventTime.split(' - ')[0];
    const timeMatch = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const ampm = timeMatch[3];
      
      // Convert 12-hour to 24-hour format if needed
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
      }
      
      bookingDate.setHours(hours, minutes, 0, 0);
    }
    
    // Check if current time is more than 1 hour before booking time
    const oneHourBeforeBooking = addHours(bookingDate, -1);
    return isBefore(now, oneHourBeforeBooking);
  } catch (error) {
    console.error('Error parsing booking time:', error);
    return true; // Allow cancellation if parsing fails to be safe
  }
};
