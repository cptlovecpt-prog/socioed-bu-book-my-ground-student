// Utility functions for time-based logic

/**
 * Check if QR code is available (1 hour before event start to 20 minutes after event start)
 * @param eventDate - Event date (Today, Tomorrow, or formatted date)
 * @param eventTime - Event time string (e.g., "14:00 - 16:00")
 * @returns boolean - true if QR code is available
 */
export const isQRCodeAvailable = (eventDate: string, eventTime: string): boolean => {
  try {
    const now = new Date();
    
    // Parse event date
    let eventDateTime = new Date();
    
    if (eventDate === "Today") {
      // Use today's date
      eventDateTime = new Date();
    } else if (eventDate === "Tomorrow") {
      // Use tomorrow's date
      eventDateTime = new Date();
      eventDateTime.setDate(eventDateTime.getDate() + 1);
    } else {
      // Parse formatted date (e.g., "Dec 12", "Jan 15, 2024")
      eventDateTime = new Date(eventDate);
    }
    
    // Parse event time (extract start time from "14:00 - 16:00" format)
    const timeMatch = eventTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (!timeMatch) return false;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const ampm = timeMatch[3];
    
    // Convert 12-hour to 24-hour format if needed
    if (ampm) {
      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
    }
    
    eventDateTime.setHours(hours, minutes, 0, 0);
    
    // QR code available from 1 hour before event start to 20 minutes after event start
    const qrStartTime = eventDateTime.getTime() - (60 * 60 * 1000); // 1 hour before
    const qrEndTime = eventDateTime.getTime() + (20 * 60 * 1000);   // 20 minutes after event start
    const currentTime = now.getTime();
    
    return currentTime >= qrStartTime && currentTime <= qrEndTime;
  } catch (error) {
    console.error('Error parsing event time:', error);
    return false;
  }
};

// Keep the old function for backwards compatibility but make it use the new logic
export const isWithinOneHourOfEvent = isQRCodeAvailable;

/**
 * Get time remaining until QR code becomes available or when it expires
 * @param eventDate - Event date
 * @param eventTime - Event time string
 * @returns string - Human readable time remaining or status
 */
export const getQRCodeStatus = (eventDate: string, eventTime: string): string => {
  try {
    const now = new Date();
    
    let eventDateTime = new Date();
    
    if (eventDate === "Today") {
      eventDateTime = new Date();
    } else if (eventDate === "Tomorrow") {
      eventDateTime = new Date();
      eventDateTime.setDate(eventDateTime.getDate() + 1);
    } else {
      eventDateTime = new Date(eventDate);
    }
    
    const timeMatch = eventTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
    if (!timeMatch) return "Unable to calculate";
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const ampm = timeMatch[3];
    
    if (ampm) {
      if (ampm === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
    }
    
    eventDateTime.setHours(hours, minutes, 0, 0);
    
    // QR code available from 1 hour before to 20 minutes after event start
    const qrStartTime = new Date(eventDateTime.getTime() - (60 * 60 * 1000));
    const qrEndTime = new Date(eventDateTime.getTime() + (20 * 60 * 1000));
    const currentTime = now.getTime();
    
    if (currentTime >= qrStartTime.getTime() && currentTime <= qrEndTime.getTime()) {
      return "Available now";
    } else if (currentTime < qrStartTime.getTime()) {
      const timeDiff = qrStartTime.getTime() - currentTime;
      const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hoursRemaining > 0) {
        return `Available in ${hoursRemaining}h ${minutesRemaining}m`;
      } else {
        return `Available in ${minutesRemaining}m`;
      }
    } else {
      return "QR Code expired";
    }
  } catch (error) {
    console.error('Error calculating QR code status:', error);
    return "Unable to calculate";
  }
};

// Keep old function name for backwards compatibility
export const getTimeUntilQRAvailable = getQRCodeStatus;