import ApiService from './api';

export interface BookingData {
  facilityName: string;
  sport: string;
  location: string;
  date: string;
  time: string;
  image: string;
  participants: string;
  facilitySize: number;
}

export interface Booking extends BookingData {
  id: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  shareToken: string;
  qrCode?: string;
  createdAt: Date;
  participantIds: string[];
}

export interface BookingRequest {
  facilityId: string;
  date: string;
  timeSlotId: string;
  participantCount: number;
  participantIds: string[];
  sendEmailConfirmation: boolean;
}

class BookingService extends ApiService {
  // API call to create a booking
  async createBooking(bookingRequest: BookingRequest): Promise<Booking> {
    // TODO: Replace with actual API call
    // const response = await this.post<Booking>('/bookings', bookingRequest);
    
    // Return dummy data for now - replace this with actual API response
    return getDummyBooking(bookingRequest);
  }

  // API call to get user's bookings
  async getUserBookings(userId: string): Promise<Booking[]> {
    // TODO: Replace with actual API call
    // const response = await this.get<Booking[]>(`/users/${userId}/bookings`);
    
    // Return dummy data for now - replace this with actual API response
    return getDummyUserBookings();
  }

  // API call to cancel a booking
  async cancelBooking(bookingId: string): Promise<boolean> {
    // TODO: Replace with actual API call
    // const response = await this.delete<boolean>(`/bookings/${bookingId}`);
    
    // Return dummy success for now - replace this with actual API response
    return true;
  }

  // API call to get booking by share token
  async getBookingByToken(shareToken: string): Promise<Booking | null> {
    // TODO: Replace with actual API call
    // const response = await this.get<Booking>(`/bookings/share/${shareToken}`);
    
    // Return dummy data for now - replace this with actual API response
    return getDummyBookingByToken(shareToken);
  }

  // API call to send email confirmations
  async sendEmailConfirmations(bookingId: string, emails: string[]): Promise<boolean> {
    // TODO: Replace with actual API call
    // const response = await this.post<boolean>(`/bookings/${bookingId}/emails`, { emails });
    
    // Return dummy success for now - replace this with actual API response
    console.log('Would send emails to:', emails);
    return true;
  }
}

// Dummy data functions - TODO: Remove when API is ready
const getDummyBooking = (request: BookingRequest): Booking => ({
  id: `booking-${Date.now()}`,
  facilityName: "Sample Facility",
  sport: "Football",
  location: "Sample Location",
  date: request.date,
  time: "14:00 - 16:00",
  image: "/lovable-uploads/3a13d82d-5544-4379-a3e4-a65a065f42f8.png",
  participants: `${request.participantCount} participant${request.participantCount > 1 ? 's' : ''}`,
  facilitySize: 8968,
  status: 'Upcoming',
  shareToken: `BK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
  createdAt: new Date(),
  participantIds: request.participantIds
});

const getDummyUserBookings = (): Booking[] => [
  {
    id: "booking-1",
    facilityName: "Football Ground",
    sport: "Football",
    location: "Near K block",
    date: "Today",
    time: "16:00 - 18:00",
    participants: "2 participants",
    status: "Upcoming",
    image: "/lovable-uploads/3a13d82d-5544-4379-a3e4-a65a065f42f8.png",
    facilitySize: 8968,
    shareToken: "BK-ABC123",
    createdAt: new Date(),
    participantIds: ["user1", "user2"]
  }
];

const getDummyBookingByToken = (token: string): Booking | null => {
  if (token === "BK-ABC123") {
    return getDummyUserBookings()[0];
  }
  return null;
};

export default new BookingService();