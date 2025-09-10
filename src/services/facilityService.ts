import ApiService from './api';

export interface Facility {
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
  type: 'indoor' | 'outdoor';
}

export interface TimeSlot {
  id: string;
  time: string;
  available: number;
  capacity: number;
  facilityId: string;
  date: string;
}

class FacilityService extends ApiService {
  // API call to get all facilities
  async getFacilities(): Promise<{ indoor: Facility[]; outdoor: Facility[] }> {
    // TODO: Replace with actual API call
    // const response = await this.get<{ indoor: Facility[]; outdoor: Facility[] }>('/facilities');
    
    // Return dummy data for now - replace this with actual API response
    return {
      indoor: getIndoorFacilitiesDummy(),
      outdoor: getOutdoorFacilitiesDummy()
    };
  }

  // API call to get available time slots for a facility and date
  async getTimeSlots(facilityId: string, date: string): Promise<TimeSlot[]> {
    // TODO: Replace with actual API call
    // const response = await this.get<TimeSlot[]>(`/facilities/${facilityId}/slots?date=${date}`);
    
    // Return dummy data for now - replace this with actual API response
    return getDummyTimeSlots(facilityId, date);
  }

  // API call to get facility details
  async getFacilityById(id: string): Promise<Facility | null> {
    // TODO: Replace with actual API call
    // const response = await this.get<Facility>(`/facilities/${id}`);
    
    // Return dummy data for now - replace this with actual API response
    const allFacilities = [...getIndoorFacilitiesDummy(), ...getOutdoorFacilitiesDummy()];
    return allFacilities.find(f => f.id === id) || null;
  }
}

// Dummy data functions - TODO: Remove when API is ready
const getIndoorFacilitiesDummy = (): Facility[] => [
  {
    id: "indoor-1",
    name: "Badminton Court",
    sport: "Badminton",
    capacity: 12,
    available: 8,
    location: "K block",
    nextSlot: "10:00 - 12:00",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop",
    status: 'available',
    rating: 4.3,
    votes: 480,
    type: 'indoor'
  },
  {
    id: "indoor-2",
    name: "Squash Court",
    sport: "Squash",
    capacity: 6,
    available: 0,
    location: "K block",
    nextSlot: "12:00 - 14:00",
    image: "/lovable-uploads/de8033c6-2e20-42bf-8b5e-88753e101116.png",
    status: 'full',
    rating: 4.2,
    votes: 187,
    type: 'indoor'
  },
  // Add more indoor facilities...
];

const getOutdoorFacilitiesDummy = (): Facility[] => [
  {
    id: "outdoor-1",
    name: "Football Ground",
    sport: "Football",
    capacity: 22,
    available: 18,
    location: "Near K block",
    nextSlot: "14:00 - 18:00",
    image: "/lovable-uploads/3a13d82d-5544-4379-a3e4-a65a065f42f8.png",
    status: 'available',
    rating: 4.7,
    votes: 8968,
    type: 'outdoor'
  },
  // Add more outdoor facilities...
];

const getDummyTimeSlots = (facilityId: string, date: string): TimeSlot[] => [
  {
    id: "1",
    time: "6:30 AM - 7:15 AM",
    available: 10,
    capacity: 22,
    facilityId,
    date
  },
  // Add more time slots...
];

export default new FacilityService();