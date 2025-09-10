import { createContext, useContext, useState, ReactNode } from 'react';

export interface Booking {
  id: string;
  facilityName: string;
  sport: string;
  location: string;
  date: string;
  time: string;
  image: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  participants: string;
  facilitySize: number;
}

interface BookingContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  removeBooking: (id: string) => void;
  cancelBooking: (id: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};

const generateBookingId = () => {
  return 'BK-' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "BK-ABC123",
      facilityName: "Football Ground",
      sport: "Football",
      date: "Today",
      time: "14:00 - 16:00",
      location: "Near K block",
      participants: "18/22 joined",
      status: "Upcoming",
      image: "/lovable-uploads/3a13d82d-5544-4379-a3e4-a65a065f42f8.png",
      facilitySize: 8968
    },
    {
      id: "BK-XYZ789",
      facilityName: "Tennis Court",
      sport: "Tennis",
      date: "Tomorrow",
      time: "10:00 - 12:00",
      location: "Near K block",
      participants: "3/8 joined",
      status: "Upcoming",
      image: "/lovable-uploads/fdffe92f-f5b1-4ab3-9e26-bf822ff29b7e.png",
      facilitySize: 1338
    },
    {
      id: "BK-DEF456",
      facilityName: "Swimming Pool",
      sport: "Swimming",
      date: "Dec 12",
      time: "08:00 - 10:00",
      location: "N block",
      participants: "12/35 joined",
      status: "Upcoming",
      image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop",
      facilitySize: 1474
    },
    {
      id: "BK-EXP001",
      facilityName: "Basketball Court",
      sport: "Basketball",
      date: "Dec 8",
      time: "16:00 - 18:00",
      location: "Near K block",
      participants: "8/20 joined",
      status: "Completed",
      image: "/lovable-uploads/8ba8443e-fd66-4b90-842c-e8cea7b3b146.png",
      facilitySize: 536
    },
    {
      id: "BK-EXP002",
      facilityName: "Badminton Court",
      sport: "Badminton",
      date: "Dec 7",
      time: "18:00 - 20:00",
      location: "K block",
      participants: "6/12 joined",
      status: "Completed",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop",
      facilitySize: 480
    },
    {
      id: "BK-EXP003",
      facilityName: "Squash Court",
      sport: "Squash",
      date: "Dec 6",
      time: "14:00 - 16:00",
      location: "K block",
      participants: "4/6 joined",
      status: "Completed",
      image: "/lovable-uploads/de8033c6-2e20-42bf-8b5e-88753e101116.png",
      facilitySize: 187
    }
  ]);

  const addBooking = (bookingData: Omit<Booking, 'id' | 'status'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: generateBookingId(),
      status: 'Upcoming'
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  const removeBooking = (id: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== id));
  };

  const cancelBooking = (id: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === id ? { ...booking, status: 'Cancelled' as const } : booking
    ));
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, removeBooking, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
};