import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { HERO_IMAGES } from "@/constants/images";

const heroImages = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&h=400&fit=crop",
    title: "Cricket Ground",
    description: "Professional cricket grounds with world-class facilities"
  },
  {
    id: 2,
    image: HERO_IMAGES.PICKLEBALL,
    title: "Pickleball Courts",
    description: "Modern pickleball courts for competitive matches"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=1200&h=400&fit=crop",
    title: "Table Tennis",
    description: "Professional table tennis facilities for tournaments"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop",
    title: "Gym & Swimming Pool",
    description: "State-of-the-art gym and aquatic facilities"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&h=400&fit=crop",
    title: "Badminton Courts",
    description: "Professional badminton courts for competitive play"
  }
];

const HeroCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Add keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        api.scrollPrev();
      } else if (event.key === "ArrowRight") {
        api.scrollNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [api]);

  return (
    <section className="relative h-[400px] w-full overflow-hidden">
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: false,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full h-full"
      >
        <CarouselContent className="h-full">
          {heroImages.map((slide) => (
            <CarouselItem key={slide.id} className="h-[400px] min-h-[400px]">
              <div className="relative h-full w-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
                <div className="absolute inset-0 flex items-end justify-center pb-20 text-center text-white px-4">
                  <div className="w-full max-w-4xl">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-2 sm:mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-200",
              current === index 
                ? "bg-white" 
                : "bg-white/50 hover:bg-white/75"
            )}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;