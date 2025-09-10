import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, MessageCircle, Mail, X } from "lucide-react";
import QRCodeLib from "qrcode";

interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    facilityName: string;
    sport: string;
    date: string;
    time: string;
    location: string;
    participants: string;
    facilitySize: number;
  };
  isQRAvailable?: boolean;
}

export const QRCodeDialog = ({ isOpen, onClose, booking, isQRAvailable = true }: QRCodeDialogProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  
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
  
  const shareUrl = `${window.location.origin}/join/${booking.id}`;
  const shareText = `Join me for ${booking.sport} at ${booking.facilityName}!\n📅 ${booking.date} at ${convertTo12HourFormat(booking.time)}\n📍 ${booking.location}\n\nBooking ID: ${booking.id}`;

  useEffect(() => {
    if (isOpen) {
      generateQRCode();
    }
  }, [isOpen, booking.id]);

  const generateQRCode = async () => {
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

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(`Join me for ${booking.sport}`)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(emailUrl);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="sr-only">
            QR Code for Booking Access
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-center relative">
            {qrCodeUrl && isQRAvailable ? (
              <div className="p-4 bg-white rounded-lg border">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center relative">
                <QrCode className="h-12 w-12 text-muted-foreground" />
                {!isQRAvailable && (
                  <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center text-white text-center p-4">
                    <div className="text-sm font-medium">QR Code available</div>
                    <div className="text-sm">1 hr before till 20 mins after event starts</div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-medium">{booking.facilityName}</h3>
            <p className="text-sm text-muted-foreground">{booking.date} • {convertTo12HourFormat(booking.time)}</p>
            <p className="text-sm text-muted-foreground">{booking.participants} • {booking.facilitySize} sq mtrs.</p>
          </div>
          
          <div className="text-center text-sm leading-tight px-4 py-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
            <div>
              <span className="text-red-600 font-bold">* </span>
              <span className="text-red-800">Show this QR Code at the entrance to get access to your booked facility</span>
            </div>
            <div>
              <span className="text-red-600 font-bold">* </span>
              <span className="text-red-800">QR Code is only valid from 10 mins before the booked slot to 20 mins after slot starts</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-2 h-12 bg-green-600 hover:bg-green-700"
              disabled={!isQRAvailable}
            >
              <MessageCircle className="h-5 w-5" />
              Share on WhatsApp
            </Button>
            
            <Button
              onClick={handleEmail}
              variant="outline"
              className="w-full flex items-center gap-2 h-12"
              disabled={!isQRAvailable}
            >
              <Mail className="h-5 w-5" />
              Share on Mail
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};