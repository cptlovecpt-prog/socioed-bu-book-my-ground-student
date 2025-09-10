import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, Phone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpSupportModal = ({ isOpen, onClose }: HelpSupportModalProps) => {
  const phoneNumber = "+91 9876543210";
  const email = "admin@bennett.edu.in";

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">Help & Support</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Phone Number */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Phone className="h-4 w-4" />
              <span>Phone Number</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
              <span className="font-mono text-sm">{phoneNumber}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(phoneNumber, "Phone number")}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              <span>Email Address</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
              <span className="font-mono text-sm">{email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(email, "Email address")}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Please contact admin for any support at the above credentials
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpSupportModal;