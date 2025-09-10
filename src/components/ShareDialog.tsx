import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, Share2, Twitter, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    facilityName: string;
    sport: string;
    date: string;
    time: string;
    location: string;
  };
}

export const ShareDialog = ({ isOpen, onClose, booking }: ShareDialogProps) => {
  const { toast } = useToast();
  
  const shareText = `Join me for ${booking.sport} at ${booking.facilityName}!\n📅 ${booking.date} at ${booking.time}\n📍 ${booking.location}\n\nBooking ID: ${booking.id}`;
  const shareUrl = `${window.location.origin}/join/${booking.id}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank');
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Booking
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <h3 className="font-medium">{booking.facilityName}</h3>
            <p className="text-sm text-muted-foreground">{booking.sport}</p>
            <p className="text-sm text-muted-foreground">{booking.date} • {booking.time}</p>
            <p className="text-sm text-muted-foreground">{booking.location}</p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Share via:</h4>
            
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 h-12 bg-[#25D366] hover:bg-[#128C7E] text-white border-0"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleTwitter}
                className="flex items-center gap-2 h-12"
              >
                <Twitter className="h-5 w-5 text-blue-400" />
                <span>Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleFacebook}
                className="flex items-center gap-2 h-12"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span>Facebook</span>
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2 h-12"
            >
              <Copy className="h-5 w-5" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};