import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface FooterProps {
  isSignedIn: boolean;
}

const Footer = ({ isSignedIn }: FooterProps) => {
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isTermsOfServiceOpen, setIsTermsOfServiceOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const { toast } = useToast();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMyBookingsClick = () => {
    if (isSignedIn) {
      scrollToSection('your-bookings-section');
    } else {
      // Scroll to top and show toast
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast({
        title: "Please Sign-In to view your bookings",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <footer className="bg-background border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Company Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Book My Ground</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Playing sports made easy for enthusiasts
              </p>
            </div>
            
            {/* Features Section */}
            <div>
              <h4 className="text-base font-medium text-foreground mb-4">Features</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => scrollToSection('book-your-sport-section')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    Facility Booking
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleMyBookingsClick}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    My Bookings
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Company Links Section */}
            <div>
              <h4 className="text-base font-medium text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setIsAboutUsOpen(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsPrivacyPolicyOpen(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setIsTermsOfServiceOpen(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              © 2025 Book My Ground. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* About Us Modal */}
      <Dialog open={isAboutUsOpen} onOpenChange={setIsAboutUsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">About Book My Ground</DialogTitle>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We're transforming sports facility booking through innovative technology that enhances playing experiences for both facility managers and sports enthusiasts.
            </p>
          </DialogHeader>
          
          <ScrollArea className="h-full pr-6">
            <div className="space-y-6 py-4">
              {/* Our Mission */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Our Mission</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  To democratize access to sports facilities and make playing more convenient, accessible, and enjoyable for everyone in the community.
                </p>
              </section>

              {/* Our Vision */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Our Vision</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A world where every sports enthusiast has seamless access to quality facilities that promote active lifestyles and community engagement.
                </p>
              </section>

              {/* Our Values */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Our Values</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Innovation, accessibility, user-centric design, and a commitment to promoting healthy lifestyles and community sports worldwide.
                </p>
              </section>

              {/* Our Team */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Our Team</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A diverse group of athletes, technologists, and designers passionate about creating innovative solutions for the sports community.
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={isPrivacyPolicyOpen} onOpenChange={setIsPrivacyPolicyOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
            <p className="text-sm text-muted-foreground">Last updated: Aug 31, 2025</p>
          </DialogHeader>
          
          <ScrollArea className="h-full pr-6">
            <div className="space-y-6 py-4">
              {/* Information We Collect */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Information We Collect</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                </p>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">How We Use Your Information</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                </p>
              </section>

              {/* Information Sharing */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Information Sharing</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                </p>
              </section>

              {/* Data Security */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Data Security</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              {/* Contact Us */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Contact Us</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at privacy@socioed.com.
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Modal */}
      <Dialog open={isTermsOfServiceOpen} onOpenChange={setIsTermsOfServiceOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Terms of Service</DialogTitle>
            <p className="text-sm text-muted-foreground">Last updated: Aug 31, 2025</p>
          </DialogHeader>
          
          <ScrollArea className="h-full pr-6">
            <div className="space-y-6 py-4">
              {/* Acceptance of Terms */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Acceptance of Terms</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  By accessing and using SocioEd, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              {/* Use License */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Use License</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Permission is granted to temporarily download one copy of SocioEd materials for personal, non-commercial transitory viewing only.
                </p>
              </section>

              {/* Disclaimer */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Disclaimer</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The materials on SocioEd are provided on an "as is" basis. SocioEd makes no warranties, expressed or implied.
                </p>
              </section>

              {/* Limitations */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Limitations</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  In no event shall SocioEd or its suppliers be liable for any damages arising out of the use or inability to use the materials.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h3 className="text-lg font-semibold text-foreground mb-3">Contact Information</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at legal@socioed.com.
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;