// Image constants for embedded usage
// TODO: Convert these to actual imports when images are moved to assets

// Logo and branding
export const LOGO_IMAGE = "/lovable-uploads/923283f5-8027-43fb-b25c-080ee8310656.png";

// Hero carousel images
export const HERO_IMAGES = {
  PICKLEBALL: "/lovable-uploads/78147606-33bf-41e6-9575-8f1950aff715.png"
};

// Sport facility images
export const SPORT_IMAGES = {
  FOOTBALL: "/lovable-uploads/3a13d82d-5544-4379-a3e4-a65a065f42f8.png",
  CRICKET: "/lovable-uploads/ab1aee87-6cbc-4ad4-ab3e-a52aae6cf731.png",
  TENNIS: "/lovable-uploads/fdffe92f-f5b1-4ab3-9e26-bf822ff29b7e.png",
  BASKETBALL: "/lovable-uploads/8ba8443e-fd66-4b90-842c-e8cea7b3b146.png",
  VOLLEYBALL: "/lovable-uploads/f5824fb2-7c1a-4759-89eb-628b108960b7.png",
  CHESS: "/lovable-uploads/02fe3dda-03b5-4600-9dec-0565eb90e485.png",
  PADEL: "/lovable-uploads/30c311d0-0531-4989-b2cf-446fa8a581ed.png",
  SQUASH: "/lovable-uploads/de8033c6-2e20-42bf-8b5e-88753e101116.png",
  PICKLEBALL: "/lovable-uploads/75efefc8-6f39-47ce-b08c-18e3336f2ada.png",
  
  // Fallback images from Unsplash
  BADMINTON: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop",
  GYM: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
  SWIMMING: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop",
  TABLE_TENNIS: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&h=300&fit=crop"
};

// Function to get image for a sport
export const getSportImage = (sport: string): string => {
  const sportKey = sport.toUpperCase().replace(/\s+/g, '_') as keyof typeof SPORT_IMAGES;
  return SPORT_IMAGES[sportKey] || SPORT_IMAGES.GYM;
};